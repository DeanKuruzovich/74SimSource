use std::path::Path;
use tauri::Manager;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
async fn pick_save_path(
    app: tauri::AppHandle,
    default_name: Option<String>,
) -> Option<String> {
    tauri::async_runtime::spawn_blocking(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        let mut builder = app
            .dialog()
            .file()
            .add_filter("74SIM Circuit", &["json", "74sim"]);
        if let Some(name) = default_name {
            builder = builder.set_file_name(name);
        }
        builder.save_file(move |path| {
            let _ = tx.send(path);
        });
        rx.recv().ok().flatten().map(|p| p.to_string())
    })
    .await
    .ok()
    .flatten()
}

#[tauri::command]
async fn pick_open_path(app: tauri::AppHandle) -> Option<String> {
    tauri::async_runtime::spawn_blocking(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        app.dialog()
            .file()
            .add_filter("74SIM Circuit", &["json", "74sim"])
            .pick_file(move |path| {
                let _ = tx.send(path);
            });
        rx.recv().ok().flatten().map(|p| p.to_string())
    })
    .await
    .ok()
    .flatten()
}

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_text_file(path: String, contents: String) -> Result<(), String> {
    if let Some(dir) = Path::new(&path).parent() {
        let _ = std::fs::create_dir_all(dir);
    }
    std::fs::write(&path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn autosave_path(app: tauri::AppHandle) -> Result<String, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("autosave.json").to_string_lossy().to_string())
}

#[tauri::command]
fn path_basename(path: String) -> String {
    Path::new(&path)
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or(path)
}

const REPORTS_ENDPOINT: &str = "https://74sim.com/api/reports";

#[tauri::command]
async fn submit_report(report_type: String, description: String) -> Result<(), String> {
    if description.trim().is_empty() {
        return Err("Description is empty".to_string());
    }
    let form = reqwest::multipart::Form::new()
        .text("report_type", report_type)
        .text("description", description);
    let client = reqwest::Client::builder()
        .user_agent(concat!("74SIM-desktop/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|e| e.to_string())?;
    let res = client
        .post(REPORTS_ENDPOINT)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;
    if !res.status().is_success() {
        let status = res.status();
        let msg = match status.as_u16() {
            503 | 502 | 504 => "The server is temporarily unavailable — please try again in a few minutes.".to_string(),
            500..=599 => format!("Server error ({}). Please try again later.", status.as_u16()),
            429 => "Too many requests — please wait a moment and try again.".to_string(),
            _ => format!("Submission failed (HTTP {}). Please try again.", status.as_u16()),
        };
        return Err(msg);
    }
    Ok(())
}

// Tauri 2's updater plugin no longer auto-prompts on `dialog: true` like v1 did —
// the host has to drive the flow. Runs on every launch from `setup()`; silently
// no-ops if the manifest is unreachable, the version isn't newer, or the user declines.
async fn check_and_apply_update(app: tauri::AppHandle) {
    let update = match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(u)) => u,
            Ok(None) => return,
            Err(e) => { eprintln!("[updater] check failed: {e}"); return; }
        },
        Err(e) => { eprintln!("[updater] init failed: {e}"); return; }
    };

    let prompt = format!(
        "Version {} is available.\n\nInstall and restart now?",
        update.version
    );

    let (tx, rx) = std::sync::mpsc::channel::<bool>();
    app.dialog()
        .message(prompt)
        .title("74SIM update available")
        .buttons(MessageDialogButtons::OkCancelCustom("Install".into(), "Later".into()))
        .show(move |yes| { let _ = tx.send(yes); });

    let accepted = tauri::async_runtime::spawn_blocking(move || rx.recv().unwrap_or(false))
        .await
        .unwrap_or(false);
    if !accepted { return; }

    if let Err(e) = update.download_and_install(|_, _| {}, || {}).await {
        eprintln!("[updater] download/install failed: {e}");
        return;
    }

    app.restart();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_and_apply_update(handle).await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            pick_save_path,
            pick_open_path,
            read_text_file,
            write_text_file,
            autosave_path,
            path_basename,
            submit_report,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
