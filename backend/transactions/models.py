from django.db import models
from django.conf import settings
from books.models import Book

class Borrow(models.Model):
    STATUS_CHOICES = [
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name= "borrows")
    book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name="borrows")

    borrowed_at = models.DateTimeField(auto_now_add = True)
    due_date = models.DateField()
    returned_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='borrowed')

    def __str__(self):
        return f"{self.user} - {self.book}"


class BookQueue(models.Model):
    STATUS_CHOICES= [
        ('waiting', 'Waiting'),
        ('notified', 'Notified'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name= 'book_queues')
    book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name="queue_entries") 
    joined_at = models.DateTimeField(auto_now_add=True)
    status= models.CharField(max_length=20, choices=STATUS_CHOICES, default="waiting")

    def __str__(self):
        return f"{self.user}- {self.book}- {self.status}"
