from rest_framework import serializers
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    total_present = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'created_at', 'total_present']
        read_only_fields = ['id', 'created_at']

    def validate_employee_id(self, value):
        value = value.upper()
        if self.instance is None and Employee.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("An employee with this ID already exists.")
        return value

    def validate_email(self, value):
        qs = Employee.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An employee with this email already exists.")
        return value
