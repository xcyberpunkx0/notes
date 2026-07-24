use tauri::{
    tray::{TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_sql::{Migration, MigrationKind};

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "initial_schema",
        sql: include_str!("../migrations/001_init.sql"),
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
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
                .tooltip("DSA Vault — Ctrl+Shift+Space to quick-log")
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
