from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from books.models import Book
from accounts.models import User
from accounts.permissions import (
    IsLibrarian,
    IsStudent,
    IsStudentOrLibrarian
)
from .models import Borrow, BookQueue, Fine
from .serializers import (
    BookQueueSerializer,
    BorrowSerializer,
    FineSerializer
)


class BorrowListCreateView(generics.ListCreateAPIView):
    queryset = Borrow.objects.all()
    serializer_class = BorrowSerializer
    permission_classes = [IsStudent]

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
    permission_classes = [IsStudent]

    def get_queryset(self):
        return BookQueue.objects.filter(
            user=self.request.user
        )


class BorrowReturnView(APIView):
    permission_classes = [IsStudentOrLibrarian]

    def post(self, request, pk):
        borrow = get_object_or_404(
            Borrow,
            pk=pk
        )

        if (
            request.user.role == "STUDENT"
            and borrow.user != request.user
        ):
            return Response(
                {
                    "detail": "You cannot return another user's book."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if borrow.status == "returned":
            return Response(
                {
                    "detail": "This book has already been returned."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        is_overdue = borrow.due_date < timezone.now().date()

        fine = None

        if is_overdue:

            overdue_days = (
                timezone.now().date() - borrow.due_date
            ).days

            amount = overdue_days * 5

            fine, created = Fine.objects.get_or_create(
                borrow=borrow,
                defaults={
                    "amount": amount
                }
            )

        borrow.status = "returned"
        borrow.returned_at = timezone.now()
        borrow.save()

        book = borrow.book
        book.available_copies += 1
        book.save()
        queue_entry = BookQueue.objects.filter(
            book=book,
            status="waiting"
        ).order_by("joined_at").first()

        if queue_entry:
            queue_entry.status = "notified"
            queue_entry.save()

        return Response(
            {
                "detail": "Book returned successfully.",
                "borrow_id": borrow.id,
                "book": book.title,
                "available_copies": book.available_copies,
                "overdue": is_overdue,
                "fine": (
                    {
                        "fine_id": fine.id,
                        "amount": fine.amount,
                        "is_paid": fine.is_paid
                    }
                    if fine else None
                ),
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

class FineListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        fines = Fine.objects.filter(borrow__user=request.user)
        serializer = FineSerializer(fines, many=True)
        return Response(serializer.data)

class FinePaymentView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        fine = get_object_or_404(
            Fine,
            pk=pk
        )
        if fine.borrow.user != request.user:
            return Response(
                {
                    "detail": "You cannot pay another user's fine."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if fine.is_paid:
            return Response(
                {
                    "detail": "This fine has already been paid."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

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


class StudentDashboardView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user

        borrows = Borrow.objects.filter(
            user=user
        )

        for borrow in borrows:
            if borrow.status == 'borrowed':
                if borrow.due_date < timezone.now().date():
                    borrow.status = 'overdue'
                    borrow.save()

        current_borrows = borrows.filter(
            status='borrowed'
        )

        overdue_borrows = borrows.filter(
            status__in=['borrowed', 'overdue'],
            due_date__lt=timezone.now().date()
        )

        queue_count = BookQueue.objects.filter(
            user=user,
            status='waiting'
        ).count()

        queue_entries = BookQueue.objects.filter(
            user=user
        ).order_by('joined_at')

        unpaid_fines = Fine.objects.filter(
            borrow__user=user,
            is_paid=False
        )

        total_unpaid_fine = sum(
            fine.amount for fine in unpaid_fines
        )

        fine_details = [
            {
                "fine_id": fine.id,
                "book_title": fine.borrow.book.title,
                "amount": fine.amount,
                "is_paid": fine.is_paid,
            }
            for fine in Fine.objects.filter(
                borrow__user=user
            )
        ]

        return Response(
            {
                "total_borrowed": borrows.count(),

                "current_borrows": [
                    {
                        "borrow_id": borrow.id,
                        "book_id": borrow.book.id,
                        "book_title": borrow.book.title,
                        "borrowed_at": borrow.borrowed_at,
                        "due_date": borrow.due_date,
                    }
                    for borrow in current_borrows
                ],

                "overdue_borrows": [
                    {
                        "borrow_id": borrow.id,
                        "book_id": borrow.book.id,
                        "book_title": borrow.book.title,
                        "due_date": borrow.due_date,
                    }
                    for borrow in overdue_borrows
                ],

                "waiting_queue": queue_count,

                "queue": [
                    {
                        "queue_id": entry.id,
                        "book_id": entry.book.id,
                        "book_title": entry.book.title,
                        "status": entry.status,
                        "joined_at": entry.joined_at,
                    }
                    for entry in queue_entries
                ],

                "unpaid_fines": total_unpaid_fine,

                "fines": fine_details,
            }
        )


class LibrarianDashboardView(APIView):
    permission_classes = [IsLibrarian]
    def get(self, request):
        total_books = Book.objects.count()

        total_students = User.objects.filter(
            role="STUDENT"
        ).count()

        currently_borrowed = Borrow.objects.filter(
            status__in=["borrowed", "overdue"]
        ).count()

        overdue_books = Borrow.objects.filter(
            status__in=["borrowed", "overdue"],
            due_date__lt=timezone.now().date()
        ).count()

        waiting_queue = BookQueue.objects.filter(
            status="waiting"
        ).count()

        unpaid_fines = Fine.objects.filter(
            is_paid=False
        ).count()

        total_unpaid_fine_amount = sum(
            fine.amount
            for fine in Fine.objects.filter(
                is_paid=False
            )
        )

        recent_borrows = Borrow.objects.select_related(
            'user',
            'book'
        ).order_by('-borrowed_at')[:5]

        return Response(
            {
                "total_books": total_books,

                "total_students": total_students,

                "currently_borrowed": currently_borrowed,

                "overdue_books": overdue_books,

                "waiting_queue": waiting_queue,

                "unpaid_fines": unpaid_fines,

                "total_unpaid_fine_amount": total_unpaid_fine_amount,

                "recent_borrows": [
                    {
                        "borrow_id": borrow.id,
                        "student": borrow.user.username,
                        "book_title": borrow.book.title,
                        "borrowed_at": borrow.borrowed_at,
                        "due_date": borrow.due_date,
                        "status": borrow.status,
                    }
                    for borrow in recent_borrows
                ],
            }
        )