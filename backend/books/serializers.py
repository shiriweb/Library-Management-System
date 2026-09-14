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

    authors_details = AuthorSerializer(source="authors", many=True, read_only=True)
    category_name = serializers.CharField(source= "category.name",read_only=True)
    publisher_name = serializers.CharField(source="publisher.name",read_only=True)

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "isbn",
            "description",
            "published_date",
            "total_copies",
            "available_copies",
            "image",
            "category",
            "category_name",
            "authors",
            "authors_details",
            "publisher",
            "publisher_name",
            "created_at",
            "updated_at",
        ]