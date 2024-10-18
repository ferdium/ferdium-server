#!/bin/bash

# THIS SCRIPT IS USED TO MIGRATE FROM ADONISJS V4 TO ADONISJS V5
# IT SHOULD BE RUN BEFORE RUNNING THE SERVER

# Check if DB_DATABASE is undefined or empty, and set a default value if necessary
if [ -z "$DB_DATABASE" ]; then
    DB_DATABASE="ferdium"
fi

# Check if DATA_DIR is undefined or empty, and set a default value if necessary
if [ -z "$DATA_DIR" ]; then
    DATA_DIR="/data"
fi

# Check if $DB_CONNECTION is undefined or equals 'sqlite'
if [ -z "$DB_CONNECTION" ] || [ "$DB_CONNECTION" = "sqlite" ]; then
    
    # Define the path to your SQLite database file
    db_file="$DATA_DIR/$DB_DATABASE.sqlite"
    
    # Check if the database file exists
    if [ ! -f "$db_file" ]; then
        echo "Database file '$db_file' not found. An empty database will be created."
        exit 0
    fi
    
    # Check if the "adonis_schema_versions" table exists and if the version is less than 2
    version=$(sqlite3 "$db_file" "SELECT version FROM adonis_schema_versions LIMIT 1;" 2>/dev/null)
    if [ -z "$version" ] || [ "$version" -lt 2 ]; then
        # Table not found or version less than 2, proceed
        echo "-- Starting database migration from AdonisJS v4 to v5 --"
    
        # Check if the "adonis_schema" table exists
        schema_exists=$(sqlite3 "$db_file" "SELECT name FROM sqlite_master WHERE type='table' AND name='adonis_schema';" 2>/dev/null)
        if [ -n "$schema_exists" ]; then
            # "adonis_schema" table exists, proceed
    
            # Iterate through rows in the "name" column of "adonis_schema" and append "database/migrations" to each value
            sqlite3 -batch "$db_file" "SELECT name FROM adonis_schema;" 2>/dev/null | while read -r old_value; do
                new_value="database/migrations/$old_value"
                echo "Updating value from '$old_value' to '$new_value'"
    
                # Update the value in the database
                sqlite3 "$db_file" "UPDATE adonis_schema SET name='$new_value' WHERE name='$old_value';" 2>/dev/null
            done
        else
            echo "ERROR: Table 'adonis_schema' not found."
            exit 1
        fi
    # else
        # echo "Version is greater than or equal to 2. Exiting script."
    fi
fi
