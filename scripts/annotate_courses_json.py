import os
import json

COURSES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data", "courses")

def annotate_node(node):
    if not isinstance(node, dict):
        return 0
    
    if node.get("type") == "file":
        return 1
    
    children = node.get("children", [])
    total = 0
    if isinstance(children, list):
        for child in children:
            total += annotate_node(child)
            
    if node.get("type") == "folder":
        node["total_files"] = total
        
    return total

def process_all_jsons():
    if not os.path.exists(COURSES_DIR):
        print(f"Directorio no encontrado: {COURSES_DIR}")
        return

    json_files = [f for f in os.listdir(COURSES_DIR) if f.endswith(".json") and f != "index.json"]
    print(f"Procesando {len(json_files)} archivos JSON en {COURSES_DIR}...")
    
    updated_count = 0
    for filename in json_files:
        filepath = os.path.join(COURSES_DIR, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            if "tree" in data:
                annotate_node(data["tree"])
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                updated_count += 1
        except Exception as e:
            print(f"Error procesando {filename}: {e}")
            
    print(f"¡Éxito! Se actualizaron {updated_count} archivos JSON de cursos con total_files en cada carpeta.")

if __name__ == "__main__":
    process_all_jsons()
