from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Q
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        return Employee.objects.annotate(
            total_present=Count(
                'attendance_records',
                filter=Q(attendance_records__status='Present')
            )
        ).order_by('full_name')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Employee deleted successfully."},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total = Employee.objects.count()
        departments = Employee.objects.values_list('department', flat=True).distinct().count()
        department_counts = list(
            Employee.objects.values('department')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response({
            'total_employees': total,
            'total_departments': departments,
            'department_breakdown': department_counts,
        })
