from rest_framework.permissions import BasePermission

class IsLibrarian(BasePermission):
    def has_permission(self, request,view):
        return (request.user and request.user.is_authenticated and request.user.role== "LIBRARIAN")


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and request.user.role == "STUDENT")
    