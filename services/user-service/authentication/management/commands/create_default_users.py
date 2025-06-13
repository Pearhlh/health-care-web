from django.core.management.base import BaseCommand
from django.db import transaction
from authentication.models import User

class Command(BaseCommand):
    help = 'Create default users for testing'

    def handle(self, *args, **options):
        with transaction.atomic():
            # Check if admin already exists
            if not User.objects.filter(email='admin@example.com').exists():
                admin_user = User.objects.create_user(
                    email='admin@example.com',
                    password='admin123',
                    first_name='Admin',
                    last_name='User',
                    is_staff=True,
                    is_superuser=True,
                    role='ADMIN'
                )
                self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_user.email}'))
            else:
                self.stdout.write(self.style.WARNING('Admin user already exists'))
            
            # Create a default doctor
            if not User.objects.filter(email='doctor@example.com').exists():
                doctor_user = User.objects.create_user(
                    email='doctor@example.com',
                    password='doctor123',
                    first_name='Doctor',
                    last_name='Test',
                    role='DOCTOR'
                )
                self.stdout.write(self.style.SUCCESS(f'Created doctor user: {doctor_user.email}'))
            
            # Create a default patient
            if not User.objects.filter(email='patient@example.com').exists():
                patient_user = User.objects.create_user(
                    email='patient@example.com',
                    password='patient123',
                    first_name='Patient',
                    last_name='Test',
                    role='PATIENT'
                )
                self.stdout.write(self.style.SUCCESS(f'Created patient user: {patient_user.email}'))
            
            self.stdout.write(self.style.SUCCESS('Default users have been created successfully')) 