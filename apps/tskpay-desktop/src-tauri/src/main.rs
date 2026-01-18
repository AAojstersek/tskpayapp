// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use database::{db_init, db_get_all, db_get_by_id, db_create, db_update, db_delete, db_get_member_parents, db_set_member_parents, db_get_parent_members, export_database, import_database};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            db_init,
            db_get_all,
            db_get_by_id,
            db_create,
            db_update,
            db_delete,
            db_get_member_parents,
            db_set_member_parents,
            db_get_parent_members,
            export_database,
            import_database,
        ])
        .setup(|app| {
            // Initialize database on app startup
            if let Err(e) = database::init_database(app.handle()) {
                eprintln!("Failed to initialize database: {}", e);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
