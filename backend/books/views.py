from rest_framework import generics
from rest_framework.permissions import AllowAny

from accounts.permissions import IsLibrarian

from .models import Category, Author, Publisher, Book
from .serializers import (
    CategorySerializer,
    AuthorSerializer,
    PublisherSerializer,
    BookSerializer,
)


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsLibrarian()]

        return [AllowAny()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsLibrarian()]

        return [AllowAny()]


class AuthorListCreateView(generics.ListCreateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsLibrarian()]

        return [AllowAny()]


class AuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsLibrarian()]

        return [AllowAny()]


class PublisherListCreateView(generics.ListCreateAPIView):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsLibrarian()]

        return [AllowAny()]


class PublisherDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsLibrarian()]

        return [AllowAny()]


class BookListView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsLibrarian()]

        return [AllowAny()]


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsLibrarian()]

        return [AllowAny()]