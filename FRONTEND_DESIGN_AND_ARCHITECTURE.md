# 🎨 SACU — Análisis de Arquitectura Visual y Especificaciones de Diseño Frontend

Este documento contiene un análisis detallado de los componentes de la interfaz de usuario de **SACU (Sistema Académico Unificado)**, su desglose por partes, el sistema de diseño actual y un mapa de requerimientos/oportunidades de mejora visual para el equipo de desarrollo frontend y UI/UX.

---

## 📌 1. Introducción y Propósito

**SACU** es una plataforma universitaria estática impulsada por JSONs pre-generados, orientada a la exploración, previsualización y descarga de material académico (exámenes, prácticas resueltas, guías de laboratorio) y perfiles docentes.

El objetivo de este documento es proporcionar una radiografía completa de la interfaz actual, documentando la jerarquía de componentes, estados de interacción y decisiones estéticas para que un equipo de diseño/frontend pueda evaluar, refactorizar o elevar el diseño hacia una versión de nivel producción de alta fidelidad.

---

## 📐 2. Jerarquía General de Componentes (Component Tree)

```text
src/
├── App.tsx                        # Shell Principal de la SPA (Control de vistas y Layout)
│
├── core/components/               # Layout y Componentes Globales Persistentes
│   ├── Navbar.tsx                 # Header fijo con Navegación, Switcher de Facultad y CTA
│   ├── Hero.tsx                   # Banner principal con Buscador y Estadísticas
│   ├── Footer.tsx                 # Pie de página institucional y branding
│   ├── NotificationToast.tsx      # Sistema de alertas flotantes (Toast)
│   └── LoadingFallback.tsx        # Spinner / Pantalla de carga diferida (Suspense)
│
└── features/                      # Módulos de Funcionalidad
    ├── repositorio/               # MÓDULO 1: Repositorio Académico de Cursos
    │   ├── RepositorioFeature.tsx # Vista contenedora principal (Catálogo vs Detalle)
    │   └── components/
    │       ├── FacultyDropdown.tsx     # Selector desplegable de Facultad
    │       ├── CourseDriveViewer.tsx   # Navegador SPA del Curso seleccionado
    │       ├── FolderSidebar.tsx       # Menú lateral interactivo (Árbol de carpetas)
    │       ├── FileGrid.tsx            # Cuadrícula de archivos con miniaturas
    │       ├── FilePreviewModal.tsx    # Modal interactivo de vista previa de PDF/Drive
    │       ├── CourseDetailView.tsx    # Vista tradicional de materiales
    │       ├── MaterialCard.tsx        # Tarjeta de material académico independiente
    │       └── UploadMaterialModal.tsx # Modal con formulario para subir material
    │
    └── profesor/                  # MÓDULO 2: Directorio de Profesores
        ├── ProfesorFeature.tsx    # Vista principal de búsqueda de docentes
        └── components/
            ├── ProfessorCard.tsx   # Tarjeta de perfil de docente con calificación
            └── ProfessorsModal.tsx  # Modal con detalle de reseñas y cursos del profesor
```

---

## 🧩 3. Análisis Detallado por Componentes y Vistas

### 3.1. Shell Global y Estructura de Navegación (`core/components`)

#### A. `Navbar.tsx` (Barra de Navegación Fija)
* **Función**: Cabecera global superior fija (`position: fixed`).
* **Elementos Visuales**:
  * Logo de la marca con gradiente azul (`linear-gradient(135deg, #4f73ff, #818cf8)`).
  * `FacultyDropdown`: Desplegable de Facultades (por defecto FIIS - Sistemas).
  * Enlaces de cambio de pestaña: **Repositorio** vs **Docentes**.
  * Botón CTA destacado (`#4f73ff`) **"Subir plancha"** (Abre `UploadMaterialModal`).
* **Comportamiento Dinámico**: Al hacer scroll (`scrollY > 20`), cambia de fondo transparente a azul oscuro translúcido con desenfoque `backdrop-blur(12px)` y borde inferior sutil.

#### B. `Hero.tsx` (Banner Principal)
* **Función**: Primer impacto visual en la pestaña de Repositorio.
* **Elementos Visuales**:
  * Encabezado de alto impacto con tipografía grande en negrita.
  * Buscador global dinámico con icono de lupa y botón de limpieza.
  * Badges interactivos (pills) para seleccionar facultad.
  * Indicadores numéricos de estadísticas (Total de materiales, Cursos escaneados, Autores).
* **Fondo y Estilo**: Gradiente oscuro espacial (`#080e22` a `#172651`) con formas decorativas semitransparentes.

---

### 3.2. Módulo de Repositorio Académico (`features/repositorio`)

#### A. `RepositorioFeature.tsx` (Vista de Primera Pantalla / Catálogo)
* **Función**: Controla el estado entre el catálogo de cursos disponibles y la vista detallada de un curso.
* **Elementos Visuales (Primera Pantalla)**:
  * Rejilla de tarjetas de cursos de 4 columnas en escritorio (`grid-cols-4`).
  * Cada tarjeta muestra:
    * Badge con el código del curso (ej. `BMA01`, `SI302`).
    * Nombre estandarizado de la materia.
    * Enlace "Ver estructura" con flecha animada en hover (`group-hover:translate-x-1`).

#### B. `CourseDriveViewer.tsx` (Navegador SPA del Curso Seleccionado)
* **Función**: Renderiza la vista SPA de un curso al ser seleccionado.
* **Elementos Visuales**:
  * **Sub-Hero Header**: Fondo oscuro graduado, botón de retorno ("← Volver a la selección de cursos"), código de materia y título formateado.
  * **Layout en 2 Columnas**:
    * **Columna Izquierda (~25%)**: Menú de estructura de carpetas (`FolderSidebar`).
    * **Columna Derecha (~75%)**: Cuadrícula de archivos de la carpeta activa (`FileGrid`).

#### C. `FolderSidebar.tsx` (Navegador de Árbol de Carpetas)
* **Función**: Explorador jerárquico recursivo de carpetas.
* **Elementos Visuales**:
  * Iconos de carpeta (`amber-500` / `indigo-600` en estado activo).
  * Botones de colapsar/expandir (`rotate-90`).
  * Contador de archivos por carpeta (badge circular font-mono).
  * Resaltado visual en color azul índigo cuando una carpeta está seleccionada.

#### D. `FileGrid.tsx` & `FileCardItem` (Cuadrícula y Tarjeta de Archivos)
* **Función**: Muestra los archivos pertenecientes a la carpeta activa.
* **Características de `FileCardItem`**:
  * **Encabezado Visual (Thumbnail Preview)**: Renderiza la **imagen miniatura de la primera página** mediante la URL de vista previa de Google Drive (`https://drive.google.com/thumbnail?id={ID}&sz=w800`).
  * **Overlay interactivo al hacer Hover**: Muestra una capa semi-oscura con el botón "Ver vista previa".
  * **Badges por Tipo de Formato**:
    * `PDF`: Fondo rojo (`bg-red-50 text-red-600 border-red-200`).
    * `DOC` / `DOCX`: Fondo azul (`bg-blue-50 text-blue-600 border-blue-200`).
    * `XLS` / `XLSX`: Fondo verde (`bg-emerald-50 text-emerald-600 border-emerald-200`).
    * `PPT` / `PPTX`: Fondo naranja (`bg-orange-50 text-orange-600 border-orange-200`).
    * `ZIP` / `RAR`: Fondo ámbar (`bg-amber-50 text-amber-600 border-amber-200`).
  * **Botones de Acción**:
    * **"Ver páginas"**: Abre el modal interactivo `FilePreviewModal`.
    * **"Drive"**: Enlace directo para abrir/descargar el archivo en Google Drive.

#### E. `FilePreviewModal.tsx` (Modal de Previsualización Interactivo)
* **Función**: Modal flotante para explorar todas las páginas del archivo dentro de la aplicación.
* **Elementos Visuales**:
  * Fondo oscuro con filtro de desenfoque (`backdrop-blur-sm`).
  * Cabecera con título del archivo, código ID y botón "Abrir en Drive".
  * Contenedor con `<iframe>` apuntando a `https://drive.google.com/file/d/{ID}/preview`.

#### F. `UploadMaterialModal.tsx` (Formulario de Carga)
* **Función**: Formulario modal para que los estudiantes suban nuevas planchas/materiales.
* **Campos**: Título, código de curso, facultad, categoría (Examen Parcial, Final, PC, Guía), ciclo académico, archivo/enlace y autor.

---

### 3.3. Módulo de Docentes (`features/profesor`)

#### A. `ProfesorFeature.tsx` (Directorio de Docentes)
* **Función**: Vista de búsqueda y evaluación de profesores de la facultad.
* **Componentes Relacionados**:
  * `ProfessorCard.tsx`: Muestra avatar, nombre del docente, facultad, puntuación con estrellas (rating), materias dictadas y botón "Ver reseñas".
  * `ProfessorsModal.tsx`: Ventana modal con el desglose de comentarios y evaluaciones de los alumnos.

---

## 🎨 4. Sistema de Diseño Actual (Design Tokens Summary)

| Token / Categoría | Valor / Especificación en Código |
| :--- | :--- |
| **Color Primario Marca** | Indigo `#4f73ff` / Tailwind `indigo-600` (`#4f46e5`) |
| **Fondo Principal** | Slate 50 (`#f8fafc`) para luz; Slate 950 (`#020617`) para headers/modales |
| **Gradiente Hero / Sub-Hero** | `linear-gradient(155deg, #080e22 0%, #0f1b3d 50%, #172651 100%)` |
| **Tipografía** | Sans-serif moderna (`Inter` / System UI), Monospaced para códigos (`font-mono`) |
| **Bordes & Radios** | `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-full` para badges |
| **Efectos Glassmorphism** | `backdrop-blur-md`, `bg-white/10`, `border-white/10` |
| **Sombras (Elevation)** | `shadow-xs`, `shadow-md`, `shadow-xl`, `shadow-2xl` en modales |

---

## 🚀 5. Diagnóstico y Guía de Rediseño (Handover para el Equipo Frontend / UI/UX)

Para que el equipo de diseño y frontend pueda elevar la interfaz al siguiente nivel, se sugieren las siguientes **mejores prácticas y líneas de trabajo prioritarias**:

### 🎯 1. Consolidación del Design System en Tailwind v4
* **Problema actual**: Existen estilos y colores codificados directamente inline (ej. `style={{ backgroundColor: '#4f73ff' }}`).
* **Solución deseada**: Centralizar todos los tokens cromáticos (Primary, Secondary, Accent, Dark Mode, Fonts) dentro de `index.css` utilizando la directiva `@theme` de Tailwind CSS v4 para garantizar coherencia visual.

### ⚡ 2. Implementación de Skeleton Loaders (Shimmer Effect)
* **Problema actual**: Mientras las miniaturas de las imágenes (`https://drive.google.com/thumbnail...`) cargan a través de la red, la tarjeta puede presentar destellos visuales o espacios en blanco.
* **Solución deseada**: Reemplazar los spinners o espacios vacíos con **Skeleton Screen Loaders** con animación shimmer mientras se cargan los JSONs y las imágenes miniaturas en `FileGrid.tsx`.

### 📱 3. Adaptabilidad Móvil Avanzada (Drawer para `FolderSidebar`)
* **Problema actual**: En pantallas móviles de ancho reducido (`<768px`), el árbol de carpetas lateral (`FolderSidebar`) ocupa espacio vertical valioso arriba de la rejilla de archivos.
* **Solución deseada**: Convertir el `FolderSidebar` en un **Off-canvas Drawer / Bottom Sheet** en dispositivos móviles, accesible mediante un botón flotante *"📁 Explorar Carpetas"*.

### 🔍 4. Filtros Contextuales y Buscador de Archivos
* **Problema actual**: La búsqueda global en `Hero.tsx` filtra materias a nivel general, pero una vez dentro de un curso no hay buscador interno de archivos.
* **Solución deseada**: Agregar una barra de búsqueda contextual dentro de `CourseDriveViewer.tsx` que permita filtrar rápidamente por nombre de archivo (ej. *"PC1 2024-1"*) o filtrar por tipo de archivo (PDF, DOCX, ZIP).

### ♿ 5. Accesibilidad (a11y) e Interacciones
* **Problema actual**: Algunos botones e iconos interactivos carecen de atributos `aria-label` explícitos y contrastes de foco visibles (`focus-visible`).
* **Solución deseada**: Incorporar atributos `aria-expanded`, `aria-label` en los árboles desplegables y modales, y asegurar el soporte para navegación mediante teclado (`Tab` / `Esc`).

### 🎬 6. Transiciones y Micro-animaciones Fluidas
* **Problema actual**: El cambio de vista entre la primera pantalla y la pestaña del curso es instantáneo o con animación básica `fade-in`.
* **Solución deseada**: Integrar animaciones de transición fluidas (usando `Framer Motion` / `Motion`) al abrir modales, seleccionar carpetas o volver al catálogo de cursos.

---

*Documento generado automáticamente para el equipo de desarrollo y diseño de SACU.*
