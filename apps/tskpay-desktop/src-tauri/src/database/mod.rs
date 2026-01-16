use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::io;
use tauri::path::BaseDirectory;
use tauri::Manager;

mod queries;
mod commands;
pub use queries::*;
pub use commands::*;

const DB_FILENAME: &str = "tskpay.db";
const SCHEMA_VERSION: i32 = 2;

/// Get the database file path in the app data directory
pub fn get_db_path(app: &tauri::AppHandle) -> Result<PathBuf> {
    let app_data = app.path()
        .resolve(DB_FILENAME, BaseDirectory::AppData)
        .map_err(|e| {
            rusqlite::Error::InvalidPath(
                PathBuf::from(format!("Could not get app data directory: {:?}", e))
            )
        })?;
    
    if let Some(parent) = app_data.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| {
                rusqlite::Error::InvalidPath(
                    PathBuf::from(format!("Could not create app data directory: {}", e))
                )
            })?;
    }
    
    Ok(app_data)
}

/// Initialize the database connection
pub fn init_database(app: &tauri::AppHandle) -> Result<Connection> {
    let db_path = get_db_path(app)?;
    let conn = Connection::open(&db_path)?;
    
    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])?;
    
    // Check if database needs initialization
    let needs_init = !table_exists(&conn, "parents")?;
    
    if needs_init {
        initialize_schema(&conn)?;
    }
    
    // Check and update schema version if needed
    ensure_schema_version(&conn)?;
    
    Ok(conn)
}

/// Check if a table exists
fn table_exists(conn: &Connection, table_name: &str) -> Result<bool> {
    let mut stmt = conn.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?1"
    )?;
    let exists = stmt.exists([table_name])?;
    Ok(exists)
}

/// Initialize the database schema
fn initialize_schema(conn: &Connection) -> Result<()> {
    // Read and execute schema SQL
    let schema = include_str!("schema.sql");
    
    // Execute schema in a transaction
    conn.execute("BEGIN TRANSACTION", [])?;
    
    match conn.execute_batch(schema) {
        Ok(_) => {
            conn.execute("COMMIT", [])?;
            Ok(())
        }
        Err(e) => {
            conn.execute("ROLLBACK", [])?;
            Err(e)
        }
    }
}

/// Ensure schema version is set
fn ensure_schema_version(conn: &Connection) -> Result<()> {
    // Create schema_version table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)",
        [],
    )?;
    
    // Check current version
    let current_version: Result<i32> = conn.query_row(
        "SELECT version FROM schema_version LIMIT 1",
        [],
        |row| row.get(0),
    );
    
    match current_version {
        Ok(version) => {
            if version < SCHEMA_VERSION {
                // Run migrations
                run_migrations(conn, version, SCHEMA_VERSION)?;
                conn.execute(
                    "UPDATE schema_version SET version = ?1",
                    [SCHEMA_VERSION],
                )?;
            }
        }
        Err(_) => {
            // First time setup
            conn.execute(
                "INSERT INTO schema_version (version) VALUES (?1)",
                [SCHEMA_VERSION],
            )?;
        }
    }
    
    Ok(())
}

/// Run database migrations
fn run_migrations(conn: &Connection, from_version: i32, to_version: i32) -> Result<()> {
    for version in (from_version + 1)..=to_version {
        match version {
            2 => {
                // Migration to version 2: Add recurring cost fields
                conn.execute("ALTER TABLE costs ADD COLUMN is_recurring INTEGER DEFAULT 0", [])?;
                conn.execute("ALTER TABLE costs ADD COLUMN recurring_period TEXT", [])?;
                conn.execute("ALTER TABLE costs ADD COLUMN recurring_start_date TEXT", [])?;
                conn.execute("ALTER TABLE costs ADD COLUMN recurring_end_date TEXT", [])?;
                conn.execute("ALTER TABLE costs ADD COLUMN recurring_day_of_month INTEGER", [])?;
                conn.execute("ALTER TABLE costs ADD COLUMN recurring_template_id TEXT", [])?;
            }
            _ => {
                // Future migrations
            }
        }
    }
    Ok(())
}

/// Get a database connection (for use in Tauri commands)
pub fn get_connection(app: &tauri::AppHandle) -> Result<Connection> {
    init_database(app)
}
