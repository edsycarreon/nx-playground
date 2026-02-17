#!/bin/bash
set -e
set -u

# Creates a database and grants all privileges to POSTGRES_USER.
# Called for each app-specific database below.
create_database() {
  local database=$1
  echo "Creating database '$database'..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE $database;
    GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
  echo "Database '$database' created."
}

# ──────────────────────────────────────────────
# App databases — add new entries here
# ──────────────────────────────────────────────

create_database "auth"

# To add a database for another app, duplicate the line above:
# create_database "billing"
# create_database "notifications"
