use serde::Deserialize;
use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_sql::{Migration, MigrationKind};

#[derive(Deserialize)]
struct ExportFile {
    name: String,
    content: String,
}

/// Copies the SQLite database (with WAL/SHM sidecars) to a user-chosen file.
/// Fully offline — the backup is just files on this machine.
#[tauri::command]
fn backup_database(app: tauri::AppHandle, dest: String) -> Result<(), String> {
    let src = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("dsavault.db");
    std::fs::copy(&src, &dest).map_err(|e| e.to_string())?;
    for ext in ["-wal", "-shm"] {
        let side = src.with_file_name(format!("dsavault.db{ext}"));
        if side.exists() {
            std::fs::copy(&side, format!("{dest}{ext}")).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

/// Writes exported files (markdown) into a user-chosen directory.
#[tauri::command]
fn export_files(dir: String, files: Vec<ExportFile>) -> Result<u32, String> {
    let base = std::path::Path::new(&dir);
    let mut written = 0u32;
    for file in files {
        // Only allow simple relative paths — no escaping the chosen folder
        let rel = std::path::Path::new(&file.name);
        if rel.is_absolute()
            || rel
                .components()
                .any(|c| matches!(c, std::path::Component::ParentDir))
        {
            return Err(format!("Invalid export path: {}", file.name));
        }
        let path = base.join(rel);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        std::fs::write(&path, file.content).map_err(|e| e.to_string())?;
        written += 1;
    }
    Ok(written)
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "initial_schema",
            sql: include_str!("../migrations/001_init.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_concepts_recalled",
            sql: include_str!("../migrations/002_concepts_recalled.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![backup_database, export_files])
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:dsavault.db", migrations)
                .build(),
        )
        .setup(|app| {
            // Ctrl+Shift+Space from anywhere: focus the vault and open quick-log
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::ShortcutState;
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_shortcuts(["ctrl+shift+space"])?
                        .with_handler(|app, _shortcut, event| {
                            if event.state == ShortcutState::Pressed {
                                show_main_window(app);
                                let _ = app.emit("quick-capture", ());
                            }
                        })
                        .build(),
                )?;
            }

            // Tray icon: click to bring the vault back
            TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Trove — Ctrl+Shift+Space to quick-log")
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
