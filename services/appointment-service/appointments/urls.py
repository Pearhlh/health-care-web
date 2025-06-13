from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DoctorAvailabilityViewSet,
    TimeSlotViewSet,
    AppointmentViewSet,
    PatientVisitViewSet,
    AppointmentReasonViewSet,
    DepartmentViewSet,
    DoctorProfileViewSet
)

# Router chính cho tất cả các endpoint
router = DefaultRouter()
router.register(r'doctor-availabilities', DoctorAvailabilityViewSet)
router.register(r'time-slots', TimeSlotViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'patient-visits', PatientVisitViewSet)
router.register(r'appointment-reasons', AppointmentReasonViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'doctors', DoctorProfileViewSet)

# Cấu trúc URL đơn giản và thống nhất
urlpatterns = [
    path('', include(router.urls)),
]
