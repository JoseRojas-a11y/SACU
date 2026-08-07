# SACU — Sistema Académico Unificado

Plataforma universitaria unificada de arquitectura estática para la gestión, exploración y descarga de recursos académicos, planchas de evaluación (prácticas, exámenes parciales y finales) y cursos escaneados de la FIIS (Facultad de Ingeniería Industrial y de Sistemas).

---

## 🏗️ Arquitectura de Directorios Unificada

El proyecto se encuentra simplificado en una única carpeta **Aplicación Web Estática impulsada por JSONs**:

```text
SACU/
├── .github/
│   └── workflows/
│       └── update-courses.yml  # Automatización GitHub Actions para escaneo de cursos
├── public/
│   └── data/
│       └── courses/            # Archivos JSON por curso (BMA01.json, etc.) e index.json manifest
├── scripts/
│   └── update_courses.py       # Script en Python puro para mantenimiento y escaneo de Drive
├── src/                        # Aplicación SPA (React 19 + Vite + Tailwind CSS v4)
│   ├── components/
│   ├── features/
│   └── services/               # Carga de JSONs estáticos mediante fetch()
├── index.html
├── vite.config.ts
└── package.json
```

---

## ⚡ Inicio Rápido

### 1. Requisitos Previos
- Node.js >= 18
- Python >= 3.10 (Únicamente para ejecutar los scripts de mantenimiento local)

### 2. Levantar la Aplicación Web Estática

```bash
# Instalar dependencias del frontend
npm install

# Levantar servidor de desarrollo local
npm run dev
```

Abre tu navegador en `http://localhost:5173`.

---

## ⚙️ Mantenimiento y Actualización de Cursos (.json)

Los cursos y su estructura de carpetas/archivos son gestionados mediante archivos `.json` locales ubicados en `public/data/courses/`.

### Ejecutar Actualización Manualmente (Local):

```bash
python scripts/update_courses.py
```

El script validará/escanean los cursos en Google Drive (o preservará/creará datasets iniciales si no hay credenciales) y actualizará el archivo manifest `public/data/courses/index.json`.

### Automatización mediante GitHub Actions:

El repositorio incluye un workflow en `.github/workflows/update-courses.yml` que:
- Se ejecuta automáticamente todos los días a medianoche.
- Puede dispararse manualmente desde la pestaña **Actions** en GitHub (`workflow_dispatch`).
- Hace `git commit` automático de los archivos `.json` actualizados en el repositorio.

---

## 🎨 Características Destacadas
- **Arquitectura Ultra-Ligera**: Sin servidor backend, sin base de datos ni configuraciones complejas. Totalmente estático y desplegable en GitHub Pages, Vercel o Netlify.
- **Navegador SPA de Cursos**: Exploración interactiva del árbol de carpetas de exámenes y laboratorios resueltos.
- **FIIS Integrado**: Configurado exclusivamente para los cursos y materias de la Facultad de Ingeniería Industrial y de Sistemas.
