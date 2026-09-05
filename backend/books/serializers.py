from rest_framework import serializers
from .models import Category,Author,Book,Publisher

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ['id', 'name', 'biography']

class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = ['id', 'name', 'address', 'website']

        
class BookSerializer(serializers.ModelSerializer):

    authors = AuthorSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    publisher = PublisherSerializer(read_only=True)

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "isbn",
            "description",
            "publication_date",
            "total_copies",
            "available_copies",
            "category",
            "authors",
            "publisher",
            "created_at",
            "updated_at",
        ]