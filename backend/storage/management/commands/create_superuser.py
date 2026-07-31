import os
from django.core.management import BaseCommand
from users.models import User


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
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            self.stdout.write(self.style.SUCCESS(f'Суперпользователь "{username}" успешно создан'))
