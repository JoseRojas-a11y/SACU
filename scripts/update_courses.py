import os
import re
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List

# Define target paths relative to script root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COURSES_DIR = os.path.join(BASE_DIR, "public", "data", "courses")

def load_dotenv_file():
    """Carga variables desde el archivo .env en el directorio raíz del proyecto si existe."""
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.isfile(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    # No sobreescribir si ya está en las variables de entorno del sistema
                    if key not in os.environ:
                        os.environ[key] = val

load_dotenv_file()

GOOGLE_DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")
GOOGLE_DRIVE_API_KEY = os.getenv("GOOGLE_DRIVE_API_KEY", "")

def standardize_name(name: str) -> str:
    """
    Reemplaza espacios y separadores por guiones bajos '_',
    preservando caracteres legibles y estandarizando la cadena.
    """
    if not name:
        return ""
    cleaned = re.sub(r'\s+', '_', name.strip())
    cleaned = re.sub(r'_+', '_', cleaned)
    return cleaned

def parse_course_folder_name(folder_name: str, fallback_counter: int) -> tuple[str, str]:
    """
    Analiza el nombre de la carpeta principal del curso.
    Formato esperado: "[Nombre del curso] - [Código del curso]"
    Retorna (course_id, course_name_standardized)
    """
    parts = folder_name.split(" - ")
    if len(parts) >= 2:
        code_part = parts[-1].strip()
        name_part = " - ".join(parts[:-1]).strip()
        clean_code = re.sub(r'[^A-Za-z0-9_-]', '', code_part)
        if clean_code:
            return clean_code, standardize_name(name_part)
    
    fallback_id = f"AA{fallback_counter:03d}"
    return fallback_id, standardize_name(folder_name)

def count_tree_files(node: Dict[str, Any]) -> int:
    """Cuenta el número total de archivos en el árbol del curso."""
    if node.get("type") == "file":
        return 1
    count = 0
    for child in node.get("children", []):
        count += count_tree_files(child)
    return count

class CourseScanner:
    def __init__(self, storage_dir: str):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

    def _clear_previous_courses(self):
        print(f"[CourseScanner] Limpiando cursos anteriores en '{self.storage_dir}'...")
        if os.path.exists(self.storage_dir):
            for filename in os.listdir(self.storage_dir):
                if filename.endswith(".json"):
                    filepath = os.path.join(self.storage_dir, filename)
                    try:
                        os.remove(filepath)
                    except Exception as e:
                        print(f"[CourseScanner] No se pudo eliminar {filepath}: {e}")

    def run(self) -> List[Dict[str, Any]]:
        print("==================================================")
        print("SACU - Rutina de Mantenimiento y Generación de JSONs")
        print("==================================================")

        self._clear_previous_courses()

        if GOOGLE_DRIVE_FOLDER_ID:
            print(f"[CourseScanner] Escaneando carpetas de Google Drive en Folder ID: {GOOGLE_DRIVE_FOLDER_ID}")
            results = self._scan_google_drive()
        else:
            print("[CourseScanner] No se detectó GOOGLE_DRIVE_FOLDER_ID. Generando o preservando datos de cursos...")
            results = self._process_existing_or_generate_mock()

        self._generate_index_manifest(results)
        print(f"\n[Éxito] Proceso finalizado. Se generaron {len(results)} JSONs de cursos y el manifest 'index.json' en '{self.storage_dir}'.")
        return results

    def _fetch_drive_items(self, parent_id: str) -> List[Dict[str, Any]]:
        query = f"'{parent_id}' in parents and trashed = false"
        fields = "files(id, name, mimeType, size)"
        url = f"https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(query)}&fields={urllib.parse.quote(fields)}"
        if GOOGLE_DRIVE_API_KEY:
            url += f"&key={GOOGLE_DRIVE_API_KEY}"

        req = urllib.request.Request(url)
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                return data.get('files', [])
        except Exception as e:
            print(f"[DriveScanner] Error obteniendo elementos para la carpeta {parent_id}: {e}")
            return []

    def _build_tree_recursive(self, item: Dict[str, Any]) -> Dict[str, Any]:
        is_folder = item.get('mimeType') == 'application/vnd.google-apps.folder'
        std_name = standardize_name(item.get('name', ''))

        if is_folder:
            children_items = self._fetch_drive_items(item['id'])
            children_nodes = [self._build_tree_recursive(child) for child in children_items]
            return {
                "name": std_name,
                "type": "folder",
                "id": item['id'],
                "children": children_nodes
            }
        else:
            file_node = {
                "name": std_name,
                "type": "file",
                "id": item['id'],
                "mimeType": item.get('mimeType', 'application/octet-stream'),
                "size": item.get('size')
            }

            # Si están configuradas las credenciales de Cloudflare o la bandera de miniaturas en .env
            if os.getenv("ENABLE_CLOUDFLARE_THUMBNAILS", "false").lower() == "true" or os.getenv("CLOUDFLARE_R2_ACCOUNT_ID"):
                try:
                    from cloudflare_uploader import download_and_optimize_thumbnail, upload_thumbnail_to_cloudflare
                    img_bytes = download_and_optimize_thumbnail(item['id'], max_size_kb=250)
                    if img_bytes:
                        thumb_url = upload_thumbnail_to_cloudflare(item['id'], img_bytes)
                        if thumb_url:
                            file_node["thumbnail_url"] = thumb_url
                except Exception as e:
                    print(f"[CourseScanner] No se pudo generar thumbnail para {item['id']}: {e}")

            return file_node

    def _scan_google_drive(self) -> List[Dict[str, Any]]:
        top_items = self._fetch_drive_items(GOOGLE_DRIVE_FOLDER_ID)
        course_folders = [item for item in top_items if item.get('mimeType') == 'application/vnd.google-apps.folder']

        results = []
        fallback_counter = 1

        for folder in course_folders:
            raw_name = folder.get('name', '')
            course_id, course_name = parse_course_folder_name(raw_name, fallback_counter)
            if course_id.startswith("AA"):
                fallback_counter += 1

            children_items = self._fetch_drive_items(folder['id'])
            children_nodes = [self._build_tree_recursive(child) for child in children_items]

            course_data = {
                "course_id": course_id,
                "course_name": course_name,
                "id": folder['id'],
                "scanned_at": datetime.now(timezone.utc).isoformat(),
                "tree": {
                    "name": course_name,
                    "type": "folder",
                    "id": folder['id'],
                    "children": children_nodes
                }
            }

            output_path = os.path.join(self.storage_dir, f"{course_id}.json")
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(course_data, f, ensure_ascii=False, indent=2)

            results.append(course_data)
            print(f"[CourseScanner] Curso procesado: {course_id} ({course_name}) -> {output_path}")

        return results

    def _process_existing_or_generate_mock(self) -> List[Dict[str, Any]]:
        results = []
        # Leer archivos .json existentes en el directorio
        for filename in sorted(os.listdir(self.storage_dir)):
            if filename.endswith(".json") and filename != "index.json":
                filepath = os.path.join(self.storage_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if "course_id" in data and "tree" in data:
                            results.append(data)
                except Exception:
                    continue

        if results:
            print(f"[CourseScanner] Se encontraron y validaron {len(results)} cursos existentes en almacenamiento.")
            return results

        print("[CourseScanner] No se encontraron JSONs existentes. Generando conjunto inicial de demostración...")
        # Generar datasets de demostración inicial si la carpeta estuviera vacía
        sample_courses = [
            ("Álgebra Lineal - BMA01", [
                ("Examenes_Parciales", [
                    {"name": "EP_2024_1_Solucionario.pdf", "id": "1DriveFileId_BMA01_EP1"},
                    {"name": "EP_2023_2_Enunciado.pdf", "id": "1DriveFileId_BMA01_EP2"}
                ]),
                ("Examenes_Finales", [
                    {"name": "EF_2024_1_Solucionario.pdf", "id": "1DriveFileId_BMA01_EF1"}
                ])
            ]),
            ("Algorítmica - SI101", [
                ("Examenes_Parciales", [
                    {"name": "EP_2024_2_Algoritmos.pdf", "id": "1DriveFileId_SI101_EP1"}
                ])
            ])
        ]

        fallback_counter = 1
        for raw_name, subfolders in sample_courses:
            course_id, course_name = parse_course_folder_name(raw_name, fallback_counter)
            if course_id.startswith("AA"):
                fallback_counter += 1

            folder_children = []
            for sub_name, files in subfolders:
                std_sub_name = standardize_name(sub_name)
                file_nodes = [{
                    "name": standardize_name(f["name"]),
                    "type": "file",
                    "id": f["id"],
                    "mimeType": "application/pdf",
                    "size": 1024 * 500
                } for f in files]
                folder_children.append({
                    "name": std_sub_name,
                    "type": "folder",
                    "id": f"folder_{std_sub_name}",
                    "children": file_nodes
                })

            course_data = {
                "course_id": course_id,
                "course_name": course_name,
                "id": f"root_{course_id}",
                "scanned_at": datetime.now(timezone.utc).isoformat(),
                "tree": {
                    "name": course_name,
                    "type": "folder",
                    "id": f"root_{course_id}",
                    "children": folder_children
                }
            }

            output_path = os.path.join(self.storage_dir, f"{course_id}.json")
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(course_data, f, ensure_ascii=False, indent=2)

            results.append(course_data)

        return results

    def _generate_index_manifest(self, courses_data: List[Dict[str, Any]]):
        manifest = []
        for c in courses_data:
            course_id = c.get("course_id", "")
            course_name = c.get("course_name", "")
            scanned_at = c.get("scanned_at", datetime.now(timezone.utc).isoformat())
            tree = c.get("tree", {})
            total_files = count_tree_files(tree)

            manifest.append({
                "course_id": course_id,
                "course_name": course_name,
                "id": c.get("id"),
                "scanned_at": scanned_at,
                "total_files": total_files
            })

        # Ordenar por course_id
        manifest.sort(key=lambda x: x["course_id"])

        manifest_path = os.path.join(self.storage_dir, "index.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        print(f"[CourseScanner] Manifest unificado generado: {manifest_path} ({len(manifest)} cursos)")

if __name__ == "__main__":
    scanner = CourseScanner(COURSES_DIR)
    scanner.run()

