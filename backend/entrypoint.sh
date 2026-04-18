#!/bin/sh
set -e

echo "Esperando a que MySQL esté listo..."
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT:-3306};dbname=${DB_NAME}', '${DB_USER}', '${DB_PASS}');" 2>/dev/null; do
  sleep 1
done
echo "MySQL listo."

echo "Ejecutando seeder..."
php /app/backend/config/seeder.php

echo "Iniciando servidor PHP en 0.0.0.0:${PHP_PORT:-8000}..."
exec php -S "0.0.0.0:${PHP_PORT:-8000}" -t /app/backend /app/backend/index.php
