"""
SACU - Script Unificado (Wrapper de compatibilidad)
Este script redirige la ejecución al pipeline centralizado en update_courses.py,
el cual realiza la anotación de total_files, persistencia local para SACU y
sincronización con la base de datos de Supabase.
"""

from update_courses import main

if __name__ == "__main__":
    main()
