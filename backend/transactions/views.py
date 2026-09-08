from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status 
from django.utils import timezone
from .models import Borrow,BookQueue,Fine
from .serializers import (BookQueueSerializer, BorrowSerializer, FineSerializer)


class BorrowListCreateView(generics.ListCreateAPIView):
    queryset = Borrow.objects.all()
    serializer_class = BorrowSerializer
    permission_classes = [IsAuthenticated]

class BookQueueListCreateView(generics.ListCreateAPIView):
    queryset = BookQueue.objects.all()
    serializer_class = BookQueueSerializer
    permission_classes = [IsAuthenticated]

class BorrowReturnView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request, pk):
        borrow = get_object_or_404(Borrow, pk = pk)
        if (borrow.status == "returned"):
            return Response(
                {
                    "detail":"This book has already been returned",
                },
                status = status.HTTP_404_BAD_REQUEST
            )
        borrow.status = 'returned'
        borrow.returned_at= timezone.now()
        borrow.save()

        book = borrow.book 
        book.available_copies += 1
        book.save()


        queue_entry = BookQueue.objects.filter(book= book, status = "waiting").order_by('joined_at').first()
        if queue_entry:
            queue_entry.status = 'notified'
            queue_entry.save() 

        return Response(
            {
                "detail": "Book retrieve successfully.",
                "boorow_id": borrow.id,
                "book": book.title,
                "available_copies": book.available_copies,
                'queue_notified': queue_entry.user.username if queue_entry else None
            },
            status = status.HTTP_200_OK
        )


class BookQueueDeleteView(generics.DestroyAPIView):
    serializer_class = BookQueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BookQueue.objects.filter(user = self.request.user)


class FineCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        borrow = get_object_or_404(Borrow, pk=pk)

        if borrow.status != 'overdue':
            return Response(
                {"detail": "This borrow is not overdue."},
                status=status.HTTP_400_BAD_REQUEST
            )

        overdue_days = (
            timezone.now().date() - borrow.due_date
        ).days

        amount = overdue_days * 5

        fine = Fine.objects.create(
            borrow=borrow,
            amount=amount
        )

        return Response(
            FineSerializer(fine).data,
            status=status.HTTP_201_CREATED
        )