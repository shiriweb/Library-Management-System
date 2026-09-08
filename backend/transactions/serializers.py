from rest_framework import serializers
from .models import Borrow, BookQueue, Fine

class BorrowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Borrow
        fields= [
            'id',
            'user',
            'book',
            'borrowed_at',
            'due_date',
            'returned_at',
            'status',
        ]

        read_only_fields = [
            'id',
            'user',
            'borrowed_at',
            'returned_at',
            'status',
        ]

    def validate(self, data):
        user = self.context['request'].user
        book = data['book']

        existing_borrow = Borrow.objects.filter(user = user, book = book, status= "borrowed").exists()
        if existing_borrow :
            raise serializers.ValidationError("You already have this book borrowed.")

        if book.available_copies <= 0:
            raise serializers.ValidationError(
                "This book is currently unavailable.Please join the queue."

            )
        return data

    def create(self,validated_data):
        user = self.context['request'].user
        book = validated_data['book']
        book.available_copies -= 1
        book.save()
        borrow = Borrow.objects.create(user = user,**validated_data)
        return borrow

    
class BookQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookQueue
        fields = [
            'id',
            'user',
            'book',
            'joined_at',
            'status',
        ]

        read_only_fields = [
            'id',
            'user',
            'joined_at',
            'status',
        ]

    def validate(self,data):
        user= self.context['request'].user
        book = data['book']

        if book.available_copies > 0:
            raise serializers.ValidationError("This book is currently availabe. You can borrow it directly.")

        existing_queue = BookQueue.objects.filter(user = user, book = book, status='waiting').exists()

        if existing_queue:
            raise serializers.ValidationError("You are already in the waiting queue for this book.")
        return data

    def create(self, validate_data):
        user = self.context['request'].user
        queue_entry = BookQueue.objects.create(user= user, **validate_data)
        return queue_entry


class FineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fine
        fields = [
            'id',
            'borrow',
            'amount',
            'is_paid',
            'created_at',
        ]

        read_only_fields= [
            'id',
            'amount',
            'create_at',
        ]