# 🎓 SACU — Sistema Académico Unificado

> **Plataforma universitaria integral para la gestión de recursos académicos, evaluación docente y simulación de matrícula de la Facultad de Ingeniería Industrial y de Sistemas (FIIS - UNI).**

SACU (Sistema Académico Unificado) es una solución web moderna diseñada para centralizar y optimizar la vida académica de los estudiantes. Combina un **repositorio digital de materiales**, un **sistema interactivo de ranking y evaluación de profesores**, y **acceso rápido a herramientas de generación de horarios**.

---

## 🌟 Características Principales

### 📚 1. Repositorio Académico Digital
- **Banco de Materiales**: Exploración y descarga de exámenes parciales, finales, prácticas dirigidas y laboratorios resueltos organizados por curso y código académico.
- **Búsqueda Inteligente**: Filtrado dinámico e instantáneo por asignatura, código o término clave (`CourseSmartSearch`).
- **Visor de Archivos**: Previsualización directa en modal y descarga optimizada de materiales alojados en Google Drive / Cloudinary.

### 👨‍🏫 2. Módulo Docente y Ranking de Profesores
- **Evaluación y Reseñas de Catedráticos**: Perfiles detallados con valoraciones comunitarias, comentarios y sistema de reporte/moderación respaldado por **Supabase**.
- **Personalizador de Pesos (`WeightCustomizer`)**: Permite a los estudiantes ajustar la ponderación de exigencia, puntualidad y metodología para obtener un ranking de profesores adaptado a sus preferencias personales.
- **Inspector de PDFs Sincronizado (`SyncedPdfInspector`)**: Visualización interactiva de planchas de evaluación y soluciones escaneadas vinculadas al docente.

### 📅 3. Widget de Generación de Horarios
- **Acceso Directo a Generadores**: Widget flotante interactivo con acceso directo a simuladores de matrícula externos destacados (ej. *Portal SIGA UNI* e *Index UNI*).

### 🔗 4. Enlaces Directos e Integración de URLs (Deep Linking)
- **Rutas Compartibles**: Navegación sincronizada por URL (`/docentes`, `/repositorio`, `/profesores`, `?curso=BMA01`).
- Permite a los usuarios copiar y compartir enlaces directos a vistas o asignaturas específicas sin perder el contexto.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend Core** | React 19, Vite, TypeScript |
| **Estilos & UI** | Tailwind CSS v4, Lucide React, Glassmorphism design |
| **Gestión de Estado** | Zustand, React Custom Hooks |
| **Backend & BD** | Supabase (PostgreSQL, RLS, Auth), Cloudinary |
| **Automatización** | Python 3.10+ (Google Drive API), GitHub Actions |

---

## 🏗️ Estructura del Proyecto

```text
SACU/
├── .github/
│   └── workflows/
│       └── update-courses.yml  # Automatización diaria para escaneo de cursos
├── public/
│   └── data/
│       └── courses/            # Datasets JSON indexados por curso (BMA01.json, etc.)
├── scripts/
│   └── update_courses.py       # Script en Python para escaneo de Google Drive y Supabase
├── src/
│   ├── core/                   # Componentes globales (Navbar, Hero, Footer, Toast, Store)
│   ├── features/
│   │   ├── profesor/           # Módulo de catedráticos, ranking, reseñas y visor PDF
│   │   └── repositorio/        # Módulo de cursos, explorador de materiales y búsquedas
│   ├── services/               # Servicios de API estática y conexiones externas
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

---

## ⚡ Inicio Rápido

### 1. Requisitos Previos
- **Node.js**: `>= 18.x`
- **npm**: `>= 9.x`
- **Python**: `>= 3.10` *(opcional, solo para ejecutar scripts de actualización local)*

### 2. Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/JoseRojas-a11y/SACU.git
cd SACU

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### 3. Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo Vite.
- `npm run build`: Compila la aplicación para producción.
- `npm run preview`: Previsualiza la build de producción localmente.

---

## ⚙️ Sincronización y Mantenimiento de Cursos

El catálogo de cursos se mantiene actualizado de forma automática mediante un script de sincronización con Google Drive:

- **Script Local**: `python scripts/update_courses.py` (actualiza los JSONs en `public/data/courses/`).
- **GitHub Actions**: El workflow `.github/workflows/update-courses.yml` ejecuta este escaneo automáticamente todas las noches a medianoche (`cron: 0 0 * * *`).

---

## 📄 Licencia

Desarrollado para la comunidad universitaria de la **FIIS - UNI**.
