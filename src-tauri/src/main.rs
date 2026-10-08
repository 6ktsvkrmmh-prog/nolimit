// No Limit als Desktop-App: ein Fenster mit dem Spiel, dazu das übliche Mac-Menü (Kopieren, Einfügen, Beenden).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{WebviewUrl, WebviewWindowBuilder};

// Das Spiel speichert sonst alle 10 Sekunden; beim Beenden mit ⌘Q gibt es kein Ereignis mehr.
// In der App deshalb alle 2 Sekunden und sobald das Fenster in den Hintergrund geht.
const SAVE_OFTEN: &str = r#"
  window.addEventListener('DOMContentLoaded', () => {
    const save = () => { try { window.save(); } catch (e) {} };
    setInterval(save, 2000);
    window.addEventListener('blur', save);
  });
"#;

fn main() {
    tauri::Builder::default()
        .menu(|app| tauri::menu::Menu::default(app))
        .setup(|app| {
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("No Limit")
                .inner_size(1280.0, 860.0)
                .min_inner_size(380.0, 600.0)
                .initialization_script(SAVE_OFTEN)
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("No Limit konnte nicht starten");
}
