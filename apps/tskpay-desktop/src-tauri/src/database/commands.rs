use crate::database::{get_connection, get_all, get_by_id, create, update, delete, get_member_parents, set_member_parents, get_parent_members};
use serde_json::Value;
use std::collections::HashMap;
use tauri::AppHandle;
use rusqlite;

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

// Member-Parent relationship commands

#[tauri::command]
pub fn db_get_member_parents(app: AppHandle, member_id: String) -> Result<Vec<String>, String> {
    let conn = get_connection(&app).map_err(|e: rusqlite::Error| e.to_string())?;
    get_member_parents(&conn, &member_id).map_err(|e: rusqlite::Error| e.to_string())
}

#[tauri::command]
pub fn db_set_member_parents(app: AppHandle, member_id: String, parent_ids: Vec<String>) -> Result<(), String> {
    let conn = get_connection(&app).map_err(|e: rusqlite::Error| e.to_string())?;
    set_member_parents(&conn, &member_id, &parent_ids).map_err(|e: rusqlite::Error| e.to_string())
}

#[tauri::command]
pub fn db_get_parent_members(app: AppHandle, parent_id: String) -> Result<Vec<String>, String> {
    let conn = get_connection(&app).map_err(|e: rusqlite::Error| e.to_string())?;
    get_parent_members(&conn, &parent_id).map_err(|e: rusqlite::Error| e.to_string())
}
