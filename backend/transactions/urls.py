from django.urls import path

from .views import (
    BorrowListCreateView,
    BookQueueListCreateView,BorrowReturnView, BookQueueDeleteView, FineCreateView, FinePaymentView
)

urlpatterns=[
    path('borrows/', BorrowListCreateView.as_view(), name='borrow_list_create'),
    path('borrows/<int:pk>/return/', BorrowReturnView.as_view(), name='borrow_return'),
    path('queue/', BookQueueListCreateView.as_view(), name='queue_list_create'),
    path('queue/<int:pk>/', BookQueueDeleteView.as_view(), name='queue_delete'),
    path('borrows/<int:pk>/fine/', FineCreateView.as_view(),name='fine_create'),
    path('fines/<int:pk>/pay/',FinePaymentView.as_view(),name='fine_payment'),
]