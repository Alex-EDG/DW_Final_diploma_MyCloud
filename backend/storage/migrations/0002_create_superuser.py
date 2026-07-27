from django.db import migrations
from django.contrib.auth import get_user_model
import os


def create_superuser(apps, schema_editor):
    User = get_user_model()
    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    admin_password = os.getenv('ADMIN_PASSWORD', 'admin')
    admin_firstname = os.getenv('ADMIN_FIRSTNAME', 'Admin')
    admin_lastname = os.getenv('ADMIN_LASTNAME', 'Administrator')
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@mail.ru')
    superuser = User.objects.create_superuser()

    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username=admin_username,
            first_name=admin_firstname,
            last_name=admin_lastname,
            email=admin_email,
            password=admin_password,
            is_active=True,
            is_staff=True
        )
        print("Superuser 'admin' created successfully")
    else:
        print("Superuser 'admin' already exists")


class Migration(migrations.Migration):
    dependencies = [
        ('storage', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]