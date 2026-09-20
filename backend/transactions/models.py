from datetime import timedelta

from django.db import models
from django.conf import settings
from django.utils import timezone

from books.models import Book


def get_due_date():
    return (timezone.now() + timedelta(days=10)).date()


class Borrow(models.Model):
    STATUS_CHOICES = [
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="borrows"
    )

    book = models.ForeignKey(
        Book,
        on_delete=models.PROTECT,
        related_name="borrows"
    )

    borrowed_at = models.DateTimeField(auto_now_add=True)

    due_date = models.DateField(default=get_due_date)

    returned_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='borrowed'
    )

    def __str__(self):
        return f"{self.user} - {self.book}"


class BookQueue(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('notified', 'Notified'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='book_queues'
    )

    book = models.ForeignKey(
        Book,
        on_delete=models.PROTECT,
        related_name="queue_entries"
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="waiting"
    )

    def __str__(self):
        return f"{self.user}- {self.book}- {self.status}"


class Fine(models.Model):
    borrow = models.OneToOneField(
        Borrow,
        on_delete=models.CASCADE,
        related_name="fine"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        default=0
    )

    is_paid = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Fine for {self.borrow} - Rs. {self.amount}"