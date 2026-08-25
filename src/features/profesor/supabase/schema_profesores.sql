-- ==============================================================================
-- SACU - Base de Datos Unificada y Limpia en Supabase (PostgreSQL)
-- Integra los esquemas de Repositorio, CsP, Directorio de Docentes, Eventos y Avisos
-- ==============================================================================

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumeradores
DO $$ BEGIN
    CREATE TYPE access_type AS ENUM ('FREE', 'PREMIUM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE role_type_enum AS ENUM ('Teoria', 'Practica', 'Laboratorio', 'General');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Limpieza de Tablas Obsoletas / Deprecadas (si existieran)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.professor_positives CASCADE;
DROP TABLE IF EXISTS public.professor_negatives CASCADE;
DROP TABLE IF EXISTS public.professor_course_reviews CASCADE;
DROP TABLE IF EXISTS public.exploration_items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.course_materials CASCADE;
DROP TABLE IF EXISTS public.planchas CASCADE;

-- ------------------------------------------------------------------------------
-- 4. Estructura Académica Base (Facultades y Cursos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
    course_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_courses_code_faculty UNIQUE(course_code, faculty_id)
);

CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    physical_location TEXT,
    file_size_mb NUMERIC,
    access_condition access_type NOT NULL DEFAULT 'FREE',
    price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. Módulo de Profesores & Valoraciones
-- ------------------------------------------------------------------------------
-- Profesores simplificado: solo nombre y facultad
CREATE TABLE IF NOT EXISTS public.professors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tupla relacional: (Profesor, Curso, RoleType)
CREATE TABLE IF NOT EXISTS public.professor_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES public.professors(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    role_type role_type_enum NOT NULL DEFAULT 'Teoria',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_professor_course_role UNIQUE(professor_id, course_id, role_type)
);

-- Reseñas y Calificaciones Anónimas con submétricas
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_course_id UUID NOT NULL REFERENCES public.professor_courses(id) ON DELETE CASCADE,
    author_tag VARCHAR(100) DEFAULT 'Estudiante Anónimo',
    teaching_score NUMERIC(3,2) NOT NULL CHECK (teaching_score BETWEEN 1.0 AND 5.0),
    difficulty_score NUMERIC(3,2) NOT NULL CHECK (difficulty_score BETWEEN 1.0 AND 5.0),
    dedication_score NUMERIC(3,2) NOT NULL CHECK (dedication_score BETWEEN 1.0 AND 5.0),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    flagged_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reportes y Flags de Comentarios
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Repositorio CsP: "Cómo sobrevivir a tu Profe"
CREATE TABLE IF NOT EXISTS public.csp_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period VARCHAR(20) NOT NULL, -- ej: '25-2', '25-1', '24-2'
    cycle INTEGER NOT NULL CHECK (cycle BETWEEN 1 AND 10),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    pdf_url TEXT NOT NULL,
    index_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. Etiquetas y Comentarios Libres de Profesores
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professor_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.professor_tag_assignments (
    professor_id UUID NOT NULL REFERENCES public.professors(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.professor_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (professor_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.professor_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID NOT NULL REFERENCES public.professors(id) ON DELETE CASCADE,
    author_name VARCHAR(100),
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    comment_text TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. Eventos, Avisos y Delegados
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME WITHOUT TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    image_url TEXT,
    organizer VARCHAR(255),
    description TEXT,
    community_link TEXT,
    registration_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    short_description TEXT
);

CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.courses_alerts (
    course_id VARCHAR(100) NOT NULL,
    section VARCHAR(50) NOT NULL,
    alerts TEXT[] NOT NULL DEFAULT '{}',
    PRIMARY KEY (course_id, section)
);

CREATE TABLE IF NOT EXISTS public.delegates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL,
    section TEXT DEFAULT 'U',
    unicode TEXT
);

-- ------------------------------------------------------------------------------
-- 8. Documentos Procesados, Páginas e Índice Invertido
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profesores_documentos (
    doc_id VARCHAR(100) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    periodo VARCHAR(50) NOT NULL DEFAULT 'General',
    ciclo VARCHAR(50) NOT NULL DEFAULT 'General',
    total_pages INTEGER NOT NULL DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profesores_paginas (
    page_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    doc_id VARCHAR(100) NOT NULL REFERENCES public.profesores_documentos(doc_id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    texto_contenido TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profesores_indice_invertido (
    termino VARCHAR(255) PRIMARY KEY,
    n_gram INTEGER NOT NULL DEFAULT 1,
    documentos JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_apariciones INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. Índices para Alto Rendimiento
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_professors_faculty ON public.professors(faculty_id);
CREATE INDEX IF NOT EXISTS idx_professor_courses_prof ON public.professor_courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_courses_course ON public.professor_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_prof_course ON public.reviews(professor_course_id);
CREATE INDEX IF NOT EXISTS idx_csp_period_cycle ON public.csp_documents(period, cycle);
CREATE INDEX IF NOT EXISTS idx_csp_index_data ON public.csp_documents USING gin (index_data);
CREATE INDEX IF NOT EXISTS idx_profesores_paginas_doc ON public.profesores_paginas(doc_id);

-- ------------------------------------------------------------------------------
-- 10. Vista Agregada de Estadísticas de Docentes y Cátedras
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.view_professor_course_stats AS
SELECT 
    pc.id,
    pc.professor_id,
    p.full_name AS professor_name,
    p.faculty_id,
    f.name AS faculty_name,
    f.code AS faculty_code,
    pc.course_id,
    c.full_name AS course_name,
    c.course_code,
    pc.role_type,
    COALESCE(AVG(r.teaching_score), 4.0) AS avg_teaching,
    COALESCE(AVG(r.difficulty_score), 3.5) AS avg_difficulty,
    COALESCE(AVG(r.dedication_score), 4.2) AS avg_dedication,
    COUNT(r.id) AS review_count
FROM public.professor_courses pc
JOIN public.professors p ON pc.professor_id = p.id
JOIN public.courses c ON pc.course_id = c.id
LEFT JOIN public.faculties f ON p.faculty_id = f.id
LEFT JOIN public.reviews r ON pc.id = r.professor_course_id AND r.is_approved = true
GROUP BY pc.id, pc.professor_id, p.full_name, p.faculty_id, f.name, f.code, pc.course_id, c.full_name, c.course_code, pc.role_type;

-- ------------------------------------------------------------------------------
-- 11. Políticas de Seguridad RLS (Row Level Security)
-- ------------------------------------------------------------------------------
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csp_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesores_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesores_paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesores_indice_invertido ENABLE ROW LEVEL SECURITY;

-- Limpieza y recreación segura de políticas
DROP POLICY IF EXISTS "Public read for faculties" ON public.faculties;
CREATE POLICY "Public read for faculties" ON public.faculties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for courses" ON public.courses;
CREATE POLICY "Public read for courses" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for library_books" ON public.library_books;
CREATE POLICY "Public read for library_books" ON public.library_books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for professors" ON public.professors;
CREATE POLICY "Public read for professors" ON public.professors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for professor_courses" ON public.professor_courses;
CREATE POLICY "Public read for professor_courses" ON public.professor_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for approved reviews" ON public.reviews;
CREATE POLICY "Public read for approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Public read for csp_documents" ON public.csp_documents;
CREATE POLICY "Public read for csp_documents" ON public.csp_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for professor_tags" ON public.professor_tags;
CREATE POLICY "Public read for professor_tags" ON public.professor_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for professor_tag_assignments" ON public.professor_tag_assignments;
CREATE POLICY "Public read for professor_tag_assignments" ON public.professor_tag_assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for professor_comments" ON public.professor_comments;
CREATE POLICY "Public read for professor_comments" ON public.professor_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for events" ON public.events;
CREATE POLICY "Public read for events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for event_speakers" ON public.event_speakers;
CREATE POLICY "Public read for event_speakers" ON public.event_speakers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for notices" ON public.notices;
CREATE POLICY "Public read for notices" ON public.notices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for courses_alerts" ON public.courses_alerts;
CREATE POLICY "Public read for courses_alerts" ON public.courses_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for delegates" ON public.delegates;
CREATE POLICY "Public read for delegates" ON public.delegates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for profesores_documentos" ON public.profesores_documentos;
CREATE POLICY "Public read for profesores_documentos" ON public.profesores_documentos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for profesores_paginas" ON public.profesores_paginas;
CREATE POLICY "Public read for profesores_paginas" ON public.profesores_paginas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for profesores_indice_invertido" ON public.profesores_indice_invertido;
CREATE POLICY "Public read for profesores_indice_invertido" ON public.profesores_indice_invertido FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anonymous insert for reviews" ON public.reviews;
CREATE POLICY "Anonymous insert for reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anonymous insert for reports" ON public.reports;
CREATE POLICY "Anonymous insert for reports" ON public.reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anonymous insert for professor_comments" ON public.professor_comments;
CREATE POLICY "Anonymous insert for professor_comments" ON public.professor_comments FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 12. Datos Semilla Iniciales (con ON CONFLICT (id) seguro)
-- ------------------------------------------------------------------------------
INSERT INTO public.faculties (id, code, name) VALUES
('f0000000-0000-0000-0000-000000000001', 'sistemas', 'Facultad de Ingeniería Industrial y de Sistemas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (id, faculty_id, course_code, full_name) VALUES
('c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'CC201', 'Algorítmica y Estructura de Datos'),
('c0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'SI302', 'Base de Datos I'),
('c0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'SI401', 'Sistemas Operativos'),
('c0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'SI502', 'Redes de Computadores'),
('c0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 'CC102', 'Programación Orientada a Objetos')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.professors (id, full_name, faculty_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'Dr. Carlos Mendoza Ramos', 'f0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000002', 'Mg. Elena Valdivia Soto', 'f0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000003', 'Ing. Roberto Huamán Quispe', 'f0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000004', 'Dra. Patricia Salazar Córdova', 'f0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000005', 'Ing. Javier Alarcón Vega', 'f0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.professor_courses (id, professor_id, course_id, role_type) VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Teoria'),
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Practica'),
('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Teoria'),
('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Laboratorio'),
('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'General'),
('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'Teoria')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, professor_course_id, author_tag, teaching_score, difficulty_score, dedication_score, comment) VALUES
('d0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Estudiante FIIS #32', 4.8, 4.2, 4.9, 'Excelente docente de Teoría. Sus exámenes son muy retadores pero explica la complejidad algorítmica con total claridad.'),
('d0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Estudiante FIIS #88', 4.5, 4.6, 4.7, 'Muy puntual y preparado. Si resuelves las planchas pasadas de SACU tienes muchas posibilidades de aprobar.'),
('d0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'Estudiante FIIS #12', 4.6, 3.4, 4.8, 'La profesora Elena es muy comprensiva y resuelve todas las dudas en clase. Las prácticas de SQL y modelado son muy útiles.'),
('d0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'Estudiante FIIS #05', 4.2, 4.7, 4.0, 'Laboratorio exigente. Recomiendo tener instalada la máquina virtual con Linux desde la primera semana.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.csp_documents (id, period, cycle, title, description, pdf_url, index_data) VALUES
('a0000000-0000-0000-0000-000000000001', '25-2', 3, 'Cómo sobrevivir a tu Profe - Ciclo 3 (2025-II)', 'Compilatorio oficial con recomendaciones, tips de estudio y metodologías de evaluación de docentes de 3er ciclo.', 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf', '[
  {"page": 1, "course_id": "c0000000-0000-0000-0000-000000000001", "professor_id": "b0000000-0000-0000-0000-000000000001", "role_type": "Teoria", "course_name": "Algorítmica y Estructura de Datos", "professor_name": "Dr. Carlos Mendoza Ramos", "tips_summary": "Revisar árboles balanceados y grafos. Sus PCs tienen 4 preguntas tipo demostración."},
  {"page": 2, "course_id": "c0000000-0000-0000-0000-000000000001", "professor_id": "b0000000-0000-0000-0000-000000000001", "role_type": "Practica", "course_name": "Algorítmica y Estructura de Datos", "professor_name": "Dr. Carlos Mendoza Ramos", "tips_summary": "Entrega de código limpio con pruebas unitarias. Evalúa complejidad O(n)."},
  {"page": 3, "course_id": "c0000000-0000-0000-0000-000000000005", "professor_id": "b0000000-0000-0000-0000-000000000005", "role_type": "Teoria", "course_name": "Programación Orientada a Objetos", "professor_name": "Ing. Javier Alarcón Vega", "tips_summary": "Patrones de diseño GoF (Singleton, Factory, Observer). Proyecto final en Java/TypeScript."}
]'::jsonb),
('a0000000-0000-0000-0000-000000000002', '25-2', 4, 'Cómo sobrevivir a tu Profe - Ciclo 4 (2025-II)', 'Guía con consejos prácticos para los cursos de 4to ciclo: Base de Datos I, Estadística, etc.', 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf', '[
  {"page": 1, "course_id": "c0000000-0000-0000-0000-000000000002", "professor_id": "b0000000-0000-0000-0000-000000000002", "role_type": "Teoria", "course_name": "Base de Datos I", "professor_name": "Mg. Elena Valdivia Soto", "tips_summary": "Normalización (3FN y BCNF) y álgebra relacional entran fijas en la PC2 y Parcial."}
]'::jsonb),
('a0000000-0000-0000-0000-000000000003', '25-1', 5, 'Cómo sobrevivir a tu Profe - Ciclo 5 (2025-I)', 'Experiencias recopiladas de alumnos en Sistemas Operativos y Redes.', 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf', '[
  {"page": 1, "course_id": "c0000000-0000-0000-0000-000000000003", "professor_id": "b0000000-0000-0000-0000-000000000003", "role_type": "Laboratorio", "course_name": "Sistemas Operativos", "professor_name": "Ing. Roberto Huamán Quispe", "tips_summary": "Threads en C con pthreads y semáforos POSIX. Muy atento a memory leaks."}
]'::jsonb)
ON CONFLICT (id) DO NOTHING;

