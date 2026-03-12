from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Q
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        queryset = Attendance.objects.select_related('employee')
        employee_id = self.request.query_params.get('employee')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        date = self.request.query_params.get('date')

        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if date:
            queryset = queryset.filter(date=date)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_records = Attendance.objects.count()
        total_present = Attendance.objects.filter(status='Present').count()
        total_absent = Attendance.objects.filter(status='Absent').count()
        return Response({
            'total_records': total_records,
            'total_present': total_present,
            'total_absent': total_absent,
        })
