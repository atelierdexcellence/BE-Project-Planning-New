#!/bin/bash
set -e

# Variables de conexión a la base de datos
DB_HOST="localhost" # Dentro del contenedor, postgres se refiere a sí mismo como localhost
DB_USER="$POSTGRES_USER"
DB_PASSWORD="$POSTGRES_PASSWORD"
DB_NAME="$POSTGRES_DB"

# Espera a que PostgreSQL esté disponible
echo "Esperando a que PostgreSQL esté listo..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -c '\q'; do
  >&2 echo "Postgres no está disponible - durmiendo"
  sleep 1
done

>&2 echo "Postgres está listo - ejecutando migraciones"

# Aplica las migraciones SQL
# Los archivos SQL en /docker-entrypoint-initdb.d/ se ejecutan automáticamente
# por la imagen de postgres, pero si queremos un orden específico o lógica adicional,
# podemos iterar sobre ellos. Aquí, simplemente nos aseguramos de que se ejecuten.
# La imagen oficial de postgres ya ejecuta *.sql en /docker-entrypoint-initdb.d/
# pero este script asegura que se haga después de que la DB esté lista.
for f in /docker-entrypoint-initdb.d/migrations/*.sql; do
    echo "Aplicando migración: $f"
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$f" || {
        echo "Error al aplicar la migración $f. Saliendo."
        exit 1
    }
done

echo "Todas las migraciones aplicadas."

# Permite que el proceso principal de postgres continúe
exec "$@"
