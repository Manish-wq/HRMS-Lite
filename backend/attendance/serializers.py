from rest_framework import serializers
from django.utils import timezone
from .models import Attendance
from employees.models import Employee


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_display = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_id_display', 'date', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError(
                f"Cannot mark attendance for a future date. Today is {timezone.now().date()}."
            )
        return value

    def validate(self, data):
        employee = data.get('employee')
        date = data.get('date')
        if employee and date:
            qs = Attendance.objects.filter(employee=employee, date=date)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "Attendance for this employee on this date already exists."
                )
        return data
