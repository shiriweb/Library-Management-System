from rest_framework import serializers

from .models import Borrow, BookQueue, Fine


class BorrowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Borrow

        fields = [
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

        # Check if the student already has this book borrowed.
        existing_borrow = Borrow.objects.filter(
            user=user,
            book=book,
            status='borrowed'
        ).exists()

        if existing_borrow:
            raise serializers.ValidationError(
                "You already have this book borrowed."
            )

        # Check if the book is available.
        if book.available_copies <= 0:
            raise serializers.ValidationError(
                "This book is currently unavailable. Please join the queue."
            )

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        book = validated_data['book']

        # Decrease available copies.
        book.available_copies -= 1
        book.save()

        # Create the borrow record.
        borrow = Borrow.objects.create(
            user=user,
            **validated_data
        )

        # If the student was notified about this book,
        # mark their queue entry as fulfilled.
        queue_entry = BookQueue.objects.filter(
            user=user,
            book=book,
            status='notified'
        ).first()

        if queue_entry:
            queue_entry.status = 'fulfilled'
            queue_entry.save()

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

    def validate(self, data):
        user = self.context['request'].user
        book = data['book']

        # A student should join the queue only
        # when the book is unavailable.
        if book.available_copies > 0:
            raise serializers.ValidationError(
                "This book is currently available. You can borrow it directly."
            )

        # Check if the student already has an active
        # queue entry for this book.
        existing_queue = BookQueue.objects.filter(
            user=user,
            book=book,
            status__in=['waiting', 'notified']
        ).exists()

        if existing_queue:
            raise serializers.ValidationError(
                "You are already in the queue for this book."
            )

        return data

    def create(self, validated_data):
        user = self.context['request'].user

        queue_entry = BookQueue.objects.create(
            user=user,
            **validated_data
        )

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

        read_only_fields = [
            'id',
            'amount',
            'created_at',
        ]