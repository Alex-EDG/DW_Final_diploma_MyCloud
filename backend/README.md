Дипломный проект по профессии «Fullstack-разработчик на Python»

 # ☁️ **Облачное хранилище My Cloud**

Запуск

Создайте виртуальное окружение
(В программе VSCode комбинация клавиш Ctrl+Shirft+P. В строке поиска наберите 
Python: Create Environment и выберите "Venv Creates .venv virtual environments in current workspace
Появится предложение сразу же установить зависимости из файла requirements.txt в виртуальное окружение,
соглашаемся и шаг с установкой зависимостей можно пропустить
)
либо через теминал
```bash
python -m venv .venv
```

Активируйте его
```bash
.venv/Scripts/activate
```

Установите зависимости
```bash
pip install -r requirements.txt
```

либо используйте (установите при необходимости) pipenv
```bash
pip install pipenv
```

и установите зависимости из файла Pipfile
```bash
pipenv install
```

Далее создаем файл .env со следующим содержимым:
```bash
SECRET_KEY=*******  генерируем с помощью терминала 
ALLOWED_HOSTS= localhost,127.0.0.1,ИМЯ ДОМЕНА ИЛИ IP АДРЕС СЕРВЕРА
DB_NAME=Название вашей БД
DB_USER=имя пользователя БД
DB_PASSWORD=пароль пользователя БД
DB_HOST=localhost
DB_PORT=5432
```

SECRET_KEY=*******  можно сгенерировать с помощью терминала
```bash
python
>>> import secrets 
>>> print(secrets.token_urlsafe(50))
```
Копируем и вставляем вместо *** после SECRET_KEY= 
Создайте БД в PgAdmin4 или в терминале

```bash
createdb -U <DB_USER> <DB_NAME>
```

Выполните миграции БД

```bash
python manage.py migrate
```

Создайте суперпользователя для админки Django (Для входа в админ-панель)

```bash
python manage.py createsuperuser
```

либо по готову скрипту с подставленными по умолчанию параметрами командой находясь в папке my_cloud
```bash
python manage.py create_admin
```

При успешном создании получим в терминале ответ:
```bash
Администратор создан:
Username: admin
Email: admin@mail.ru
Password: admin
```

Перед данной командой можно в файле по относительному пути в файле backend/storage/management/commands/create_admin.py изменить параметры создания ползователя на свои.

Запустите сервер Django
```bash
python manage.py runserver
```

Админка Django доступна по адресу
http://127.0.0.1:8000/admin/

## Endpoints (Удобно тестировать через POSTMAN) 

Сервер должен быть запущен на момент тестирования командой
```bash
python manage.py runserver
```

### Пользователи

POST 'http://localhost:8000/api/auth/register/' - регистрация пользователя \
POST 'http://localhost:8000/api/auth/login/' - аутентификация пользователя \
POST 'http://localhost:8000/api/auth/logout/' - завершение сеанса пользователя \
GET 'http://localhost:8000/api/auth/me/' - получение информации о профиле текущего пользователя (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \
POST 'http://localhost:8000/api/files/' - Добавление файла в репозиторий пользователя (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \
GET 'http://localhost:8000/api/files/' - Получение списка файлов пользователя (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \
GET 'http://localhost:8000/api/files/ID/' - Получение ссылки на файл, где ID - идентификатор файла (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \
PATCH 'http://localhost:8000/api/ID/files/update_filename/' - Изменение имени файла, где ID - идентификатор файла (требуется передавать ключ Authorization: Bearer JWT-токен пользователя), данные об изменении имени файла передаются через JSON 
PATCH 'http://localhost:8000/api/ID/files/update_comment/' - Изменение комментария файла, где ID - идентификатор файла (требуется передавать ключ Authorization: Bearer JWT-токен пользователя), данные об изменении комментария файла передаются через JSON
PATCH 'http://localhost:8000/api/ID/download/' - Получение файла по ссылке (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \.
DELETE 'http://localhost:8000/api/files/ID/admin_delete/' - Удаление файла, где ID - идентификатор файла (требуется передавать ключ Authorization: Bearer JWT-токен пользователя).

### Администратор

GET 'http://localhost:8000/api/users/' - Получение информации о всех пользователях, их количестве и общем размере и количестве файлов (требуется передавать ключ Authorization: Bearer JWT-токен пользователя)\
GET 'http://localhost:8000/api/users/ID/files/' - Получение информации о файлах в хранилище выбранного пользователе с информацией по каждому файлу, где ID - это id пользователя (требуется передавать ключ Authorization: Bearer JWT-токен администратора). \
PATCH 'http://localhost:8000/api/users/ID/set_admin/' - Установка статуса адинистратора у выбранного пользователе, где ID - это id пользователя (требуется передавать ключ Authorization: Bearer JWT-токен администратора). \
