use crate::database::{get_connection, get_all, get_by_id, create, update, delete};
use serde_json::Value;
use std::collections::HashMap;
use tauri::AppHandle;

// Generic CRUD commands for all entities
#[tauri::command]
pub fn db_get_all(app: AppHandle, table: String) -> Result<Vec<HashMap<String, Value>>, String> {
    let conn = get_connection(&app).map_err(|e| e.to_string())?;
    get_all(&conn, &table).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_get_by_id(app: AppHandle, table: String, id: String) -> Result<Option<HashMap<String, Value>>, String> {
    let conn = get_connection(&app).map_err(|e| e.to_string())?;
    get_by_id(&conn, &table, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_create(app: AppHandle, table: String, data: HashMap<String, Value>) -> Result<HashMap<String, Value>, String> {
    let conn = get_connection(&app).map_err(|e| e.to_string())?;
    create(&conn, &table, &data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_update(app: AppHandle, table: String, id: String, data: HashMap<String, Value>) -> Result<(), String> {
    let conn = get_connection(&app).map_err(|e| e.to_string())?;
    update(&conn, &table, &id, &data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_delete(app: AppHandle, table: String, id: String) -> Result<(), String> {
    let conn = get_connection(&app).map_err(|e| e.to_string())?;
    delete(&conn, &table, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn db_init(app: AppHandle) -> Result<(), String> {
    get_connection(&app).map_err(|e| e.to_string())?;
    Ok(())
}
