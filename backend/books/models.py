from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique= True)
    description = models.CharField(blank= True)

    def __str__(self):
        return self.name

class Author(models.Model):
    name = models.CharField(max_length= 100)
    biography = models.TextField(blank= True)

    def __str__(self):
        return self.name

class Publisher(models.Model):
    name= models.CharField(max_length= 150)
    address = models.TextField(blank= True)
    website = models.URLField(blank= True)

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length= 200)
    isbn = models.CharField(max_length= 20, unique= True)
    description = models.TextField(blank= True)
    published_date = models.DateField(null= True, blank= True)
    total_copies = models.PositiveIntegerField(default = 1)
    available_copies = models.PositiveIntegerField(default = 1)

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="books")
    authors = models.ManyToManyField(Author, related_name= "books")
    publisher = models.ForeignKey(Publisher,on_delete=models.SET_NULL,null=True, blank= True, related_name= 'books')
    created_at = models.DateTimeField(auto_now_add= True)
    updated_at = models.DateTimeField(auto_now= True)

    def __str__(self):
        return self.title