from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone

from .models import Borrow, BookQueue, Fine
from .serializers import (
    BookQueueSerializer,
    BorrowSerializer,
    FineSerializer
)


class BorrowListCreateView(generics.ListCreateAPIView):
    queryset = Borrow.objects.all()
    serializer_class = BorrowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        borrows = Borrow.objects.filter(
            user=self.request.user
        )

        for borrow in borrows:
            if borrow.status == 'borrowed':
                if borrow.due_date < timezone.now().date():
                    borrow.status = 'overdue'
                    borrow.save()

        return borrows


class BookQueueListCreateView(generics.ListCreateAPIView):
    queryset = BookQueue.objects.all()
    serializer_class = BookQueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BookQueue.objects.filter(
            user=self.request.user
        )


class BorrowReturnView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        borrow = get_object_or_404(
            Borrow,
            pk=pk
        )

        # Check if the borrow belongs to the logged-in user
        if borrow.user != request.user:
            return Response(
                {
                    "detail": "You cannot return another user's book."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if the book has already been returned
        if borrow.status == "returned":
            return Response(
                {
                    "detail": "This book has already been returned"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark the borrow as returned
        borrow.status = 'returned'
        borrow.returned_at = timezone.now()
        borrow.save()

        # Increase available copies
        book = borrow.book
        book.available_copies += 1
        book.save()

        # Find the first person in the waiting queue
        queue_entry = BookQueue.objects.filter(
            book=book,
            status="waiting"
        ).order_by('joined_at').first()

        # Notify the first person
        if queue_entry:
            queue_entry.status = 'notified'
            queue_entry.save()

        return Response(
            {
                "detail": "Book returned successfully.",
                "borrow_id": borrow.id,
                "book": book.title,
                "available_copies": book.available_copies,
                "queue_notified": (
                    queue_entry.user.username
                    if queue_entry else None
                )
            },
            status=status.HTTP_200_OK
        )


class BookQueueDeleteView(generics.DestroyAPIView):
    serializer_class = BookQueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BookQueue.objects.filter(
            user=self.request.user
        )


class FineCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        borrow = get_object_or_404(
            Borrow,
            pk=pk
        )

        # Check if the borrow belongs to the logged-in user
        if borrow.user != request.user:
            return Response(
                {
                    "detail": "You cannot create a fine for another user's borrow."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if the borrow is overdue
        if borrow.status != 'overdue':
            return Response(
                {
                    "detail": "This borrow is not overdue."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate overdue days
        overdue_days = (
            timezone.now().date() - borrow.due_date
        ).days

        # Fine is Rs. 5 per overdue day
        amount = overdue_days * 5

        # Check if a fine already exists
        existing_fine = Fine.objects.filter(
            borrow=borrow
        ).first()

        if existing_fine:
            return Response(
                {
                    "detail": "A fine already exists for this borrow.",
                    "fine": FineSerializer(existing_fine).data
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new fine
        fine = Fine.objects.create(
            borrow=borrow,
            amount=amount
        )

        return Response(
            FineSerializer(fine).data,
            status=status.HTTP_201_CREATED
        )


class FinePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        fine = get_object_or_404(
            Fine,
            pk=pk
        )

        # Check if the fine belongs to the logged-in user
        if fine.borrow.user != request.user:
            return Response(
                {
                    "detail": "You cannot pay another user's fine."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if the fine is already paid
        if fine.is_paid:
            return Response(
                {
                    "detail": "This fine has already been paid."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark fine as paid
        fine.is_paid = True
        fine.save()

        return Response(
            {
                "detail": "Fine paid successfully.",
                "fine_id": fine.id,
                "amount": fine.amount,
                "is_paid": fine.is_paid
            },
            status=status.HTTP_200_OK
        )