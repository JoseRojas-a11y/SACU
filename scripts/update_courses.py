import os
import re
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List

# Rutas base del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COURSES_DIR = os.path.join(BASE_DIR, "public", "data", "courses")

def load_dotenv_file():
    """Carga variables desde el archivo .env en el directorio raíz del proyecto."""
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.isfile(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key not in os.environ:
                        os.environ[key] = val

load_dotenv_file()

GOOGLE_DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")
GOOGLE_DRIVE_API_KEY = os.getenv("GOOGLE_DRIVE_API_KEY", "")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY", "")
SUPABASE_USER_EMAIL = os.getenv("SUPABASE_USER_EMAIL") or os.getenv("VITE_SUPABASE_USER_EMAIL") or os.getenv("SUPABASE_EMAIL") or os.getenv("VITE_SUPABASE_EMAIL", "")
SUPABASE_USER_PASSWORD = os.getenv("SUPABASE_USER_PASSWORD") or os.getenv("VITE_SUPABASE_USER_PASSWORD") or os.getenv("SUPABASE_PASSWORD") or os.getenv("VITE_SUPABASE_PASSWORD", "")

def standardize_name(name: str) -> str:
    """Reemplaza espacios y separadores por guiones bajos, preservando caracteres legibles."""
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

def annotate_node_total_files(node: Dict[str, Any]) -> int:
    """
    Anota recursivamente cada nodo carpeta con total_files y retorna la cantidad de archivos.
    (Unificación del proceso annotate_courses_json.py)
    """
    if not isinstance(node, dict):
        return 0
    
    if node.get("type") == "file":
        return 1
    
    children = node.get("children", [])
    total = 0
    if isinstance(children, list):
        for child in children:
            total += annotate_node_total_files(child)
            
    if node.get("type") == "folder":
        node["total_files"] = total
        
    return total

def collect_file_nodes(node: Dict[str, Any], current_path: str = "") -> List[Dict[str, Any]]:
    """Extrae la lista plana de todos los archivos del árbol para sincronizar con Supabase."""
    files = []
    if not isinstance(node, dict):
        return files

    node_type = node.get("type")
    node_name = node.get("name", "")

    if node_type == "file":
        files.append({
            "name": node_name,
            "id": node.get("id", ""),
            "path": f"{current_path}/{node_name}" if current_path else node_name,
            "mimeType": node.get("mimeType", "application/pdf"),
            "size": node.get("size", 0)
        })
    elif node_type == "folder":
        new_path = f"{current_path}/{node_name}" if current_path else node_name
        for child in node.get("children", []):
            files.extend(collect_file_nodes(child, new_path))

    return files

class SupabaseUploader:
    """Cliente HTTP para sincronizar la misma información de cursos con Supabase REST API."""
    def __init__(self, url: str, key: str, email: str = "", password: str = ""):
        self.url = url.rstrip('/')
        self.key = key
        self.email = email
        self.password = password
        self.access_token = None

    def is_configured(self) -> bool:
        return bool(self.url and self.key and self.url.startswith("http"))

    def authenticate(self) -> bool:
        if not self.email or not self.password or not self.is_configured():
            return False
        
        auth_url = f"{self.url}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": self.key,
            "Content-Type": "application/json"
        }
        body = json.dumps({"email": self.email, "password": self.password}).encode('utf-8')
        req = urllib.request.Request(auth_url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                res_data = json.loads(resp.read().decode('utf-8'))
                if "access_token" in res_data:
                    self.access_token = res_data["access_token"]
                    print(f"[SupabaseUploader] Autenticado exitosamente como usuario ({self.email}).")
                    return True
        except Exception as e:
            print(f"[SupabaseUploader] Error autenticando usuario en Supabase: {e}")
        return False

    def _request(self, endpoint: str, method: str = "GET", data: Any = None, prefer_headers: str = "return=representation") -> Any:
        if not self.is_configured():
            return None

        if not self.access_token and self.email and self.password:
            self.authenticate()

        bearer_token = self.access_token if self.access_token else self.key

        full_url = f"{self.url}/rest/v1/{endpoint}"
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {bearer_token}",
            "Content-Type": "application/json",
            "Prefer": prefer_headers
        }

        req_body = json.dumps(data).encode('utf-8') if data is not None else None
        req = urllib.request.Request(full_url, data=req_body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as response:
                res_bytes = response.read()
                if res_bytes:
                    return json.loads(res_bytes.decode('utf-8'))
                return []
        except Exception as e:
            print(f"[SupabaseUploader] Aviso HTTP {method} {endpoint}: {e}")
            return None

    def ensure_faculty(self, code: str = "sistemas", name: str = "Facultad de Ingeniería Industrial y de Sistemas") -> str:
        res = self._request(f"faculties?code=eq.{code}")
        if res and len(res) > 0:
            return res[0]["id"]
        
        new_fac = self._request("faculties", method="POST", data={"code": code, "name": name})
        if new_fac and len(new_fac) > 0:
            return new_fac[0]["id"]
        return ""

    def upsert_course(self, faculty_id: str, course_code: str, full_name: str) -> str:
        clean_code_query = urllib.parse.quote(course_code)
        res = self._request(f"courses?course_code=eq.{clean_code_query}")
        if res and len(res) > 0:
            course_id = res[0]["id"]
            self._request(f"courses?id=eq.{course_id}", method="PATCH", data={"full_name": full_name})
            return course_id

        data = {
            "faculty_id": faculty_id if faculty_id else "a0000000-0000-0000-0000-000000000000",
            "course_code": course_code,
            "full_name": full_name
        }
        new_course = self._request("courses", method="POST", data=data)
        if new_course and len(new_course) > 0:
            return new_course[0]["id"]
        return ""

    def sync_planchas(self, course_db_id: str, files: List[Dict[str, Any]]):
        if not course_db_id:
            return

        for f in files:
            file_name = f.get("name", "")
            file_id = f.get("id", "")
            pdf_url = f"https://drive.google.com/file/d/{file_id}/view" if file_id else ""

            self._request(
                "planchas",
                method="POST",
                data={
                    "course_id": course_db_id,
                    "tipo": "Material",
                    "ciclo": "General",
                    "profesor": file_name,
                    "pdf_url": pdf_url,
                    "es_premium": False,
                    "costo_monedas": 0
                },
                prefer_headers="resolution=ignore-duplicates"
            )

    def sync_profesores_documentos(self, course_id: str, course_name: str, total_files: int, tree_data: Dict[str, Any]):
        doc_id = f"course_{course_id}"
        self._request(
            "profesores_documentos",
            method="POST",
            data={
                "doc_id": doc_id,
                "file_name": f"{course_name} ({course_id})",
                "periodo": "General",
                "ciclo": "General",
                "total_pages": total_files,
                "metadata": {
                    "course_id": course_id,
                    "course_name": course_name,
                    "total_files": total_files,
                    "scanned_at": datetime.now(timezone.utc).isoformat(),
                    "tree": tree_data
                }
            },
            prefer_headers="resolution=merge-duplicates"
        )

class UnifiedCourseScanner:
    """
    Proceso unificado de escaneo, anotación, persistencia local (SACU)
    y sincronización a Supabase (aplicativos externos).
    """
    def __init__(self, storage_dir: str = COURSES_DIR):
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)
        self.uploader = SupabaseUploader(SUPABASE_URL, SUPABASE_KEY, SUPABASE_USER_EMAIL, SUPABASE_USER_PASSWORD)

    def run(self) -> List[Dict[str, Any]]:
        print("==================================================")
        print("SACU - Proceso Unificado de Cursos (Local + Supabase)")
        print("==================================================")

        # 1. Obtener cursos desde Google Drive o estructura local
        if GOOGLE_DRIVE_FOLDER_ID:
            print(f"[1/3 Escaneo] Conectando a Google Drive Folder ID: {GOOGLE_DRIVE_FOLDER_ID}")
            results = self._scan_google_drive()
        else:
            print("[1/3 Escaneo] GOOGLE_DRIVE_FOLDER_ID no configurado. Procesando archivos locales...")
            results = self._process_local_courses()

        # 2. Guardar archivos localmente para la plataforma SACU
        print(f"\n[2/3 Almacenamiento Local] Guardando JSONs anotados en '{self.storage_dir}'...")
        self._save_local_files_and_manifest(results)

        # 3. Subir la misma información a Supabase para otros aplicativos
        print("\n[3/3 Sincronización Supabase] Sincronizando con base de datos remota...")
        self._sync_all_to_supabase(results)

        print("\n==================================================")
        print(f"¡Éxito! Se procesaron {len(results)} cursos sincronizados localmente y en Supabase.")
        print("==================================================")
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
            print(f"[DriveScanner] Error en carpeta {parent_id}: {e}")
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
            return {
                "name": std_name,
                "type": "file",
                "id": item['id'],
                "mimeType": item.get('mimeType', 'application/octet-stream'),
                "size": item.get('size')
            }

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

            tree = {
                "name": course_name,
                "type": "folder",
                "id": folder['id'],
                "children": children_nodes
            }

            # Anotación unificada de total_files en cada carpeta
            annotate_node_total_files(tree)

            course_data = {
                "course_id": course_id,
                "course_name": course_name,
                "id": folder['id'],
                "scanned_at": datetime.now(timezone.utc).isoformat(),
                "tree": tree
            }
            results.append(course_data)
            print(f"  ✓ Escaneado: {course_id} ({course_name}) - {tree.get('total_files', 0)} archivos")

        return results

    def _process_local_courses(self) -> List[Dict[str, Any]]:
        results = []
        if os.path.exists(self.storage_dir):
            for filename in sorted(os.listdir(self.storage_dir)):
                if filename.endswith(".json") and filename != "index.json":
                    filepath = os.path.join(self.storage_dir, filename)
                    try:
                        with open(filepath, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if "course_id" in data and "tree" in data:
                                annotate_node_total_files(data["tree"])
                                results.append(data)
                    except Exception as e:
                        print(f"  Error procesando {filename}: {e}")

        if results:
            print(f"  ✓ Se cargaron y anotaron {len(results)} cursos locales existentes.")
            return results

        # Generar mock de muestra si el directorio está completamente vacío
        sample_courses = [
            ("Álgebra Lineal - BMA01", [
                ("Examenes_Parciales", [
                    {"name": "EP_2024_1_Solucionario.pdf", "id": "1DriveFileId_BMA01_EP1"},
                    {"name": "EP_2023_2_Enunciado.pdf", "id": "1DriveFileId_BMA01_EP2"}
                ])
            ]),
            ("Algorítmica y Estructura de Datos - CC201", [
                ("Examenes_Parciales", [
                    {"name": "EP_2024_2_Algoritmos.pdf", "id": "1DriveFileId_CC201_EP1"}
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

            tree = {
                "name": course_name,
                "type": "folder",
                "id": f"root_{course_id}",
                "children": folder_children
            }
            annotate_node_total_files(tree)
            results.append({
                "course_id": course_id,
                "course_name": course_name,
                "id": f"root_{course_id}",
                "scanned_at": datetime.now(timezone.utc).isoformat(),
                "tree": tree
            })
        return results

    def _save_local_files_and_manifest(self, courses_data: List[Dict[str, Any]]):
        courses_list = []
        total_scanned_files = 0

        for c in courses_data:
            course_id = c.get("course_id", "")
            course_name = c.get("course_name", "")
            scanned_at = c.get("scanned_at", datetime.now(timezone.utc).isoformat())
            tree = c.get("tree", {})
            total_files = annotate_node_total_files(tree)
            total_scanned_files += total_files

            # Guardar JSON individual del curso para SACU
            output_path = os.path.join(self.storage_dir, f"{course_id}.json")
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(c, f, ensure_ascii=False, indent=2)

            courses_list.append({
                "course_id": course_id,
                "course_name": course_name,
                "id": c.get("id"),
                "scanned_at": scanned_at,
                "total_files": total_files
            })

        courses_list.sort(key=lambda x: x["course_id"])

        manifest = {
            "total_courses": len(courses_list),
            "total_files": total_scanned_files,
            "scanned_at": datetime.now(timezone.utc).isoformat(),
            "courses": courses_list
        }

        manifest_path = os.path.join(self.storage_dir, "index.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        print(f"  ✓ Archivos locales guardados: {len(courses_list)} cursos y manifest 'index.json' ({total_scanned_files} archivos totales).")

    def _sync_all_to_supabase(self, courses_data: List[Dict[str, Any]]):
        if not self.uploader.is_configured():
            print("  [Supabase] Credenciales no configuradas. Se omitió la subida remota.")
            return

        faculty_db_id = self.uploader.ensure_faculty("sistemas", "Facultad de Ingeniería Industrial y de Sistemas")

        for c in courses_data:
            course_id = c.get("course_id", "")
            course_name = c.get("course_name", "")
            tree = c.get("tree", {})
            total_files = tree.get("total_files", 0)

            # 1. Upsert en tabla 'courses'
            course_db_id = self.uploader.upsert_course(faculty_db_id, course_id, course_name)

            # 2. Sincronizar archivos en tabla 'planchas'
            flat_files = collect_file_nodes(tree)
            if course_db_id and flat_files:
                self.uploader.sync_planchas(course_db_id, flat_files)

            # 3. Sincronizar árbol completo en 'profesores_documentos'
            self.uploader.sync_profesores_documentos(course_id, course_name, total_files, tree)
            print(f"  ✓ Sincronizado en Supabase: {course_id} ({course_name}) -> {len(flat_files)} archivos")

def main():
    scanner = UnifiedCourseScanner()
    scanner.run()

if __name__ == "__main__":
    main()
