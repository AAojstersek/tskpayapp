use rusqlite::{Connection, Result};
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::Manager;

pub mod queries;
mod commands;
pub use queries::*;
pub use commands::*;

const DB_FILENAME: &str = "tskpay.db";
const SCHEMA_VERSION: i32 = 5;

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
            3 => {
                // Migration to version 3: Add member_parents pivot table and migrate data
                // Create the pivot table
                conn.execute(
                    "CREATE TABLE IF NOT EXISTS member_parents (
                        id TEXT PRIMARY KEY,
                        member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
                        parent_id TEXT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
                        created_at TEXT NOT NULL DEFAULT (datetime('now')),
                        UNIQUE(member_id, parent_id)
                    )",
                    [],
                )?;
                conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_member_parents_member ON member_parents(member_id)",
                    [],
                )?;
                conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_member_parents_parent ON member_parents(parent_id)",
                    [],
                )?;
                
                // Migrate existing data: for each member with parent_id, create entry in member_parents
                let mut stmt = conn.prepare(
                    "SELECT id, parent_id FROM members WHERE parent_id IS NOT NULL AND parent_id != ''"
                )?;
                let member_rows = stmt.query_map([], |row| {
                    Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
                })?;
                
                for member_row in member_rows {
                    let (member_id, parent_id) = member_row?;
                    // Generate simple ID from member_id and parent_id
                    let pivot_id = format!("{}_{}", member_id, parent_id);
                    conn.execute(
                        "INSERT OR IGNORE INTO member_parents (id, member_id, parent_id) VALUES (?1, ?2, ?3)",
                        [pivot_id.as_str(), member_id.as_str(), parent_id.as_str()],
                    )?;
                }
            }
            4 => {
                // Migration to version 4: Add payment status and payer_name columns
                conn.execute("ALTER TABLE payments ADD COLUMN status TEXT DEFAULT 'confirmed'", [])?;
                conn.execute("ALTER TABLE payments ADD COLUMN payer_name TEXT", [])?;
                // Update existing payments with linked parent to 'confirmed' status
                conn.execute("UPDATE payments SET status = 'confirmed' WHERE parent_id IS NOT NULL", [])?;
            }
            5 => {
                // Migration to version 5: Add "Samo člani" group for club members who pay for themselves
                conn.execute(
                    "INSERT OR IGNORE INTO coaches (id, name, email, phone, created_at, updated_at) 
                     VALUES ('coa-samo-clani', 'Članstvo', NULL, NULL, datetime('now'), datetime('now'))",
                    [],
                )?;
                conn.execute(
                    "INSERT OR IGNORE INTO groups (id, name, coach_id, created_at, updated_at) 
                     VALUES ('grp-samo-clani', 'Samo člani', 'coa-samo-clani', datetime('now'), datetime('now'))",
                    [],
                )?;
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
    init_database(app)?;
    let db_path = get_db_path(app)?;
    Connection::open(&db_path)
}

// Member-Parent relationship functions
pub fn get_member_parents(conn: &Connection, member_id: &str) -> Result<Vec<String>> {
    let mut stmt = conn.prepare("SELECT parent_id FROM member_parents WHERE member_id = ?1")?;
    let rows = stmt.query_map([member_id], |row| {
        Ok(row.get::<_, String>(0)?)
    })?;
    
    let mut parent_ids = Vec::new();
    for row_result in rows {
        parent_ids.push(row_result?);
    }
    
    Ok(parent_ids)
}

pub fn set_member_parents(conn: &Connection, member_id: &str, parent_ids: &[String]) -> Result<()> {
    // Remove all existing relationships
    conn.execute("DELETE FROM member_parents WHERE member_id = ?1", [member_id])?;
    
    // Add new relationships
    for (index, parent_id) in parent_ids.iter().enumerate() {
        let pivot_id = format!("{}_{}_{}", member_id, parent_id, index);
        conn.execute(
            "INSERT INTO member_parents (id, member_id, parent_id) VALUES (?1, ?2, ?3)",
            [&pivot_id, member_id, parent_id],
        )?;
    }
    
    Ok(())
}

pub fn get_parent_members(conn: &Connection, parent_id: &str) -> Result<Vec<String>> {
    let mut stmt = conn.prepare("SELECT member_id FROM member_parents WHERE parent_id = ?1")?;
    let rows = stmt.query_map([parent_id], |row| {
        Ok(row.get::<_, String>(0)?)
    })?;
    
    let mut member_ids = Vec::new();
    for row_result in rows {
        member_ids.push(row_result?);
    }
    
    Ok(member_ids)
}
