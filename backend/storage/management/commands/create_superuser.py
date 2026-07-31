import os
from django.core.management import BaseCommand
from storage.models import User


class Command(BaseCommand):
    help = 'Создайте суперпользователя, если его ещё нет'

    def handle(self, *args, **options):
        username = os.getenv('ADMIN_USERNAME', 'admin')
        password = os.getenv('ADMIN_PASSWORD', 'Admin123!')
        first_name = os.getenv('ADMIN_FIRSTNAME', 'Admin')
        last_name = os.getenv('ADMIN_LASTNAME', 'Administrator')
        email = os.getenv('ADMIN_EMAIL', 'admin@mail.ru')

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Суперпользователь "{username}" уже существует'))
        else:
            admin_user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email,
                is_active=True,
                is_staff=True,      # Для доступа к Django админке
                is_superuser=True   # Полные права в Django
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Администратор создан:\n'
                    f'Username: {admin_user.username}\n'
                    f'Password: {admin_user.password}\n'
                    f'First_name: {admin_user.first_name}\n'
                    f'Last_name: {admin_user.last_name}\n'
                    f'Email: {admin_user.email}\n'
                )
            )
