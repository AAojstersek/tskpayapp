use crate::database::get_db_path;
use std::fs;
use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, FilePath};
use tokio::sync::mpsc;

/// Export database to a user-selected location
#[tauri::command]
pub async fn export_database(app: AppHandle) -> Result<String, String> {
    let db_path = get_db_path(&app).map_err(|e| e.to_string())?;

    // Check if database exists
    if !db_path.exists() {
        return Err("Baza podatkov ne obstaja.".to_string());
    }

    // Generate default filename with timestamp
    let timestamp = chrono::Local::now().format("%Y-%m-%d-%H%M%S");
    let default_filename = format!("tskpay-backup-{}.db", timestamp);

    // Use mpsc channel for async communication
    let (tx, mut rx) = mpsc::unbounded_channel();

    // Open file save dialog
    app.dialog()
        .file()
        .set_title("Shrani izvoz baze podatkov")
        .set_file_name(&default_filename)
        .add_filter("SQLite Database", &["db", "sqlite"])
        .add_filter("All Files", &["*"])
        .save_file(move |dialog_result| {
            let _ = tx.send(dialog_result);
        });

    // Wait for dialog result asynchronously (non-blocking)
    let file_path = rx.recv().await.ok_or_else(|| "Napaka pri komunikaciji z dialogom.".to_string())?;

    let file_path = match file_path {
        Some(path) => match path {
            FilePath::Path(p) => p,
            FilePath::Url(_) => return Err("Podpora za URL poti ni na voljo.".to_string()),
        },
        None => return Err("Izvoz je bil preklican.".to_string()),
    };

    // Copy database file to selected location
    fs::copy(&db_path, &file_path)
        .map_err(|e| format!("Napaka pri kopiranju baze podatkov: {}", e))?;

    // Return the path as string
    file_path
        .to_str()
        .ok_or_else(|| "Napaka pri pretvorbi poti datoteke.".to_string())
        .map(|s| s.to_string())
}

/// Import database from a user-selected file
#[tauri::command]
pub async fn import_database(app: AppHandle) -> Result<String, String> {
    let db_path = get_db_path(&app).map_err(|e| e.to_string())?;

    // Use mpsc channel for async communication
    let (tx, mut rx) = mpsc::unbounded_channel();

    // Open file open dialog
    app.dialog()
        .file()
        .set_title("Izberi datoteko baze podatkov za uvoz")
        .add_filter("SQLite Database", &["db", "sqlite"])
        .add_filter("All Files", &["*"])
        .pick_file(move |dialog_result| {
            let _ = tx.send(dialog_result);
        });

    // Wait for dialog result asynchronously (non-blocking)
    let file_path = rx.recv().await.ok_or_else(|| "Napaka pri komunikaciji z dialogom.".to_string())?;

    let import_file_path = match file_path {
        Some(path) => match path {
            FilePath::Path(p) => p,
            FilePath::Url(_) => return Err("Podpora za URL poti ni na voljo.".to_string()),
        },
        None => return Err("Uvoz je bil preklican.".to_string()),
    };

    // Validate that the selected file is a valid SQLite database
    // Check SQLite magic bytes (first 16 bytes should start with "SQLite format 3\000")
    let mut file = fs::File::open(&import_file_path)
        .map_err(|e| format!("Napaka pri branju datoteke {}: {}", import_file_path.display(), e))?;
    
    let mut header = [0u8; 16];
    use std::io::Read;
    file.read_exact(&mut header)
        .map_err(|e| format!("Napaka pri branju header datoteke {}: {}", import_file_path.display(), e))?;

    // SQLite magic bytes: "SQLite format 3\000" (16 bytes)
    // Compare first 16 bytes
    let sqlite_magic: &[u8; 16] = b"SQLite format 3\0";
    if &header != sqlite_magic {
        // Try to provide more detailed error - check if it starts with "SQLite"
        let header_str = String::from_utf8_lossy(&header);
        if !header_str.starts_with("SQLite") {
            return Err(format!(
                "Izbrana datoteka ni veljavna SQLite baza podatkov. Datoteka ne vsebuje SQLite magic bytes. Prebrano: {:?}",
                header_str
            ));
        } else {
            // Header starts with SQLite but doesn't match exactly - might be valid, skip strict validation
            // This allows importing valid SQLite files with slight header variations
        }
    }

    // Create backup of existing database if it exists
    let backup_path = if db_path.exists() {
        let timestamp = chrono::Local::now().format("%Y-%m-%d-%H%M%S");
        let backup_filename = format!("tskpay-backup-before-import-{}.db", timestamp);
        let mut backup_path = db_path.clone();
        backup_path.set_file_name(&backup_filename);
        
        // Ensure backup directory exists
        if let Some(parent) = backup_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Napaka pri ustvarjanju direktorija za backup {}: {}", parent.display(), e))?;
        }
        
        fs::copy(&db_path, &backup_path)
            .map_err(|e| format!("Napaka pri ustvarjanju backup-a od {} do {}: {}", db_path.display(), backup_path.display(), e))?;
        
        Some(backup_path.to_str().ok_or_else(|| "Napaka pri pretvorbi backup poti v string".to_string())?.to_string())
    } else {
        None
    };

    // Ensure database directory exists
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Napaka pri ustvarjanju direktorija za bazo {}: {}", parent.display(), e))?;
    }

    // Copy imported file to database location
    fs::copy(&import_file_path, &db_path)
        .map_err(|e| format!("Napaka pri kopiranju baze podatkov od {} do {}: {}", import_file_path.display(), db_path.display(), e))?;

    // Return backup path if created
    Ok(backup_path.unwrap_or_else(|| "Nobena obstoječa baza ni bila zamenjana.".to_string()))
}

/// Save text file to a user-selected location
#[tauri::command]
pub async fn save_text_file(app: AppHandle, content: String, default_filename: String) -> Result<String, String> {
    // Use mpsc channel for async communication
    let (tx, mut rx) = mpsc::unbounded_channel();

    // Open file save dialog
    app.dialog()
        .file()
        .set_title("Shrani datoteko")
        .set_file_name(&default_filename)
        .add_filter("Text Files", &["txt"])
        .add_filter("All Files", &["*"])
        .save_file(move |dialog_result| {
            let _ = tx.send(dialog_result);
        });

    // Wait for dialog result asynchronously (non-blocking)
    let file_path = rx.recv().await.ok_or_else(|| "Napaka pri komunikaciji z dialogom.".to_string())?;

    let file_path = match file_path {
        Some(path) => match path {
            FilePath::Path(p) => p,
            FilePath::Url(_) => return Err("Podpora za URL poti ni na voljo.".to_string()),
        },
        None => return Err("Shranjevanje je bilo preklicano.".to_string()),
    };

    // Write content to file
    fs::write(&file_path, content)
        .map_err(|e| format!("Napaka pri shranjevanju datoteke: {}", e))?;

    // Return the path as string
    file_path
        .to_str()
        .ok_or_else(|| "Napaka pri pretvorbi poti datoteke.".to_string())
        .map(|s| s.to_string())
}
