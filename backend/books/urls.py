from django.urls import path

from .views import (
    BookListView,
    BookDetailView,
    CategoryListCreateView,
    CategoryDetailView,
    AuthorListCreateView,
    AuthorDetailView,
    PublisherListCreateView,
    PublisherDetailView,
)


urlpatterns = [
    path("categories/", CategoryListCreateView.as_view()),
    path("categories/<int:pk>/", CategoryDetailView.as_view()),

    path("authors/", AuthorListCreateView.as_view()),
    path("authors/<int:pk>/", AuthorDetailView.as_view()),

    path("publishers/", PublisherListCreateView.as_view()),
    path("publishers/<int:pk>/", PublisherDetailView.as_view()),

    path("", BookListView.as_view()),
    path("<int:pk>/", BookDetailView.as_view()),
]