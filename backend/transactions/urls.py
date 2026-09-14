from django.urls import path

from .views import (
    BorrowListCreateView,
    BookQueueListCreateView,
    BorrowReturnView,
    BookQueueDeleteView,
    FineListView,
    FinePaymentView,
    StudentDashboardView,
    LibrarianDashboardView,
)

urlpatterns = [
    path(
        'borrows/',
        BorrowListCreateView.as_view(),
        name='borrow_list_create'
    ),

    path(
        'borrows/<int:pk>/return/',
        BorrowReturnView.as_view(),
        name='borrow_return'
    ),

    path(
        'queue/',
        BookQueueListCreateView.as_view(),
        name='queue_list_create'
    ),

    path(
        'queue/<int:pk>/',
        BookQueueDeleteView.as_view(),
        name='queue_delete'
    ),

    path(
        'fines/',
        FineListView.as_view(),
        name='fine_list'
    ),
    
    path(
        'fines/<int:pk>/pay/',
        FinePaymentView.as_view(),
        name='fine_payment'
    ),

    path(
        'student-dashboard/',
        StudentDashboardView.as_view(),
        name='student_dashboard'
    ),

    path(
        'librarian-dashboard/',
        LibrarianDashboardView.as_view(),
        name='librarian_dashboard'
    ),
]