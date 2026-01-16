use rusqlite::{Connection, Result};
use serde_json;
use std::collections::HashMap;

// Helper to convert SQLite row to JSON-serializable HashMap
fn row_to_map(row: &rusqlite::Row) -> Result<HashMap<String, serde_json::Value>> {
    let mut map = HashMap::new();
    let column_count = row.as_ref().column_count();
    
    for i in 0..column_count {
        let column_name = row.as_ref().column_name(i)?.to_string();
        let value: rusqlite::types::Value = row.get(i)?;
        
        let json_value = match value {
            rusqlite::types::Value::Null => serde_json::Value::Null,
            rusqlite::types::Value::Integer(i) => serde_json::Value::Number(i.into()),
            rusqlite::types::Value::Real(f) => {
                serde_json::Value::Number(serde_json::Number::from_f64(f).unwrap_or(serde_json::Number::from(0)))
            }
            rusqlite::types::Value::Text(s) => serde_json::Value::String(s),
            rusqlite::types::Value::Blob(_) => serde_json::Value::String("BLOB".to_string()),
        };
        
        map.insert(column_name, json_value);
    }
    
    Ok(map)
}

// Generic get all function
pub fn get_all(conn: &Connection, table: &str) -> Result<Vec<HashMap<String, serde_json::Value>>> {
    let mut stmt = conn.prepare(&format!("SELECT * FROM {}", table))?;
    let rows = stmt.query_map([], |row| row_to_map(row))?;
    
    let mut results = Vec::new();
    for row_result in rows {
        results.push(row_result?);
    }
    
    Ok(results)
}

// Generic get by id
pub fn get_by_id(conn: &Connection, table: &str, id: &str) -> Result<Option<HashMap<String, serde_json::Value>>> {
    let mut stmt = conn.prepare(&format!("SELECT * FROM {} WHERE id = ?1", table))?;
    let mut rows = stmt.query_map([id], |row| row_to_map(row))?;
    
    if let Some(row_result) = rows.next() {
        Ok(Some(row_result?))
    } else {
        Ok(None)
    }
}

// Generic create function
pub fn create(conn: &Connection, table: &str, data: &HashMap<String, serde_json::Value>) -> Result<HashMap<String, serde_json::Value>> {
    let columns: Vec<String> = data.keys().cloned().collect();
    let placeholders: Vec<String> = (1..=columns.len()).map(|i| format!("?{}", i)).collect();
    
    let sql = format!(
        "INSERT INTO {} ({}) VALUES ({})",
        table,
        columns.join(", "),
        placeholders.join(", ")
    );
    
    let mut stmt = conn.prepare(&sql)?;
    
    let values: Vec<rusqlite::types::Value> = columns.iter()
        .map(|col| {
            let val = data.get(col).unwrap_or(&serde_json::Value::Null);
            match val {
                serde_json::Value::Null => rusqlite::types::Value::Null,
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        rusqlite::types::Value::Integer(i)
                    } else if let Some(f) = n.as_f64() {
                        rusqlite::types::Value::Real(f)
                    } else {
                        rusqlite::types::Value::Null
                    }
                }
                serde_json::Value::String(s) => rusqlite::types::Value::Text(s.clone()),
                serde_json::Value::Bool(b) => rusqlite::types::Value::Integer(if *b { 1 } else { 0 }),
                _ => rusqlite::types::Value::Text(val.to_string()),
            }
        })
        .collect();
    
    stmt.execute(rusqlite::params_from_iter(values.iter()))?;
    
    // Return the created record
    if let Some(id) = data.get("id") {
        if let Some(id_str) = id.as_str() {
            return get_by_id(conn, table, id_str).and_then(|opt| {
                opt.ok_or_else(|| rusqlite::Error::QueryReturnedNoRows)
            });
        }
    }
    
    Err(rusqlite::Error::QueryReturnedNoRows)
}

// Generic update function
pub fn update(conn: &Connection, table: &str, id: &str, data: &HashMap<String, serde_json::Value>) -> Result<()> {
    let columns: Vec<String> = data.keys()
        .filter(|k| *k != "id")
        .cloned()
        .collect();
    
    if columns.is_empty() {
        return Ok(());
    }
    
    let set_clauses: Vec<String> = columns.iter()
        .enumerate()
        .map(|(i, col)| format!("{} = ?{}", col, i + 1))
        .collect();
    
    let sql = format!(
        "UPDATE {} SET {} WHERE id = ?{}",
        table,
        set_clauses.join(", "),
        columns.len() + 1
    );
    
    let mut stmt = conn.prepare(&sql)?;
    
    let mut values: Vec<rusqlite::types::Value> = columns.iter()
        .map(|col| {
            let val = data.get(col).unwrap_or(&serde_json::Value::Null);
            match val {
                serde_json::Value::Null => rusqlite::types::Value::Null,
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        rusqlite::types::Value::Integer(i)
                    } else if let Some(f) = n.as_f64() {
                        rusqlite::types::Value::Real(f)
                    } else {
                        rusqlite::types::Value::Null
                    }
                }
                serde_json::Value::String(s) => rusqlite::types::Value::Text(s.clone()),
                serde_json::Value::Bool(b) => rusqlite::types::Value::Integer(if *b { 1 } else { 0 }),
                _ => rusqlite::types::Value::Text(val.to_string()),
            }
        })
        .collect();
    
    values.push(rusqlite::types::Value::Text(id.to_string()));
    
    stmt.execute(rusqlite::params_from_iter(values.iter()))?;
    
    Ok(())
}

// Generic delete function
pub fn delete(conn: &Connection, table: &str, id: &str) -> Result<()> {
    let sql = format!("DELETE FROM {} WHERE id = ?1", table);
    let mut stmt = conn.prepare(&sql)?;
    stmt.execute([id])?;
    Ok(())
}

