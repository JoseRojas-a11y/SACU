-- ==============================================================================
-- SACU (Sistema Académico Unificado)
-- Script SQL: Inserción de Consultas y Reseñas Aleatorias de Docentes (Reviews)
-- ==============================================================================
-- Este script inserta reseñas representativas con valoraciones realistas
-- para diversas cátedras de la FIIS (Ingeniería de Sistemas e Industrial).
-- ==============================================================================

-- 1. Insertar reseñas aleatorias cruzando aleatoriamente cátedras existentes en professor_courses
INSERT INTO public.reviews (
    id,
    professor_course_id,
    author_tag,
    teaching_score,
    difficulty_score,
    dedication_score,
    comment,
    is_approved,
    flagged_count,
    created_at
)
SELECT
    gen_random_uuid() AS id,
    pc.id AS professor_course_id,
    (ARRAY[
        'Estudiante FIIS Base 23',
        'Alumno Sistemas #18',
        'Estudiante Industrial Base 22',
        'Estudiante FIIS #07',
        'Alumno Base 24',
        'Estudiante Sistemas #45',
        'Alumno FIIS #91',
        'Estudiante Anónimo #33'
    ])[floor(random() * 8 + 1)] AS author_tag,
    ROUND((3.5 + random() * 1.5)::numeric, 1) AS teaching_score,
    ROUND((2.8 + random() * 2.2)::numeric, 1) AS difficulty_score,
    ROUND((3.6 + random() * 1.4)::numeric, 1) AS dedication_score,
    (ARRAY[
        'Excelente profesor, domina completamente el temario y absuelve dudas con gran claridad en cada clase.',
        'Exigente en las evaluaciones y califica el procedimiento de forma rigurosa. Si estudias las guías de práctica apruebas.',
        'Muy didáctico para explicar conceptos teóricos complejos. Recomiendo revisar las diapositivas con anticipación.',
        'Docente muy puntual y comprometido con el aprendizaje. Deja proyectos retadores pero muy formativos.',
        'En los laboratorios guía paso a paso y da retroalimentación constante. Clases muy amenas y productivas.',
        'Explica con casos reales aplicados a la industria nacional. Muy recomendado para formar una base sólida.',
        'Las preguntas de los exámenes son de deducción y análisis profundo. Conviene formar grupos de estudio para las PCs.',
        'Accesible en los horarios de asesoría. Explica varias veces el problema si nota que los estudiantes no comprendieron.'
    ])[floor(random() * 8 + 1)] AS comment,
    true AS is_approved,
    0 AS flagged_count,
    now() - (random() * interval '30 days') AS created_at
FROM public.professor_courses pc
-- Seleccionar una muestra aleatoria de cátedras existentes
ORDER BY random()
LIMIT 25;

-- ==============================================================================
-- 2. Consultas de Verificación y Estadísticas
-- ==============================================================================

-- A) Consultar las 10 cátedras con mejor promedio ponderado y sus métricas
SELECT 
    professor_name,
    course_name,
    role_type,
    avg_teaching_score AS ensenanza,
    avg_difficulty_score AS dificultad_evaluacion,
    avg_dedication_score AS dedicacion,
    total_reviews AS total_resenas
FROM public.view_professor_course_stats
WHERE total_reviews > 0
ORDER BY avg_teaching_score DESC, total_reviews DESC
LIMIT 10;

-- B) Consultar las reseñas más recientes con información de la cátedra
SELECT 
    r.id,
    p.full_name AS profesor,
    c.full_name AS curso,
    pc.role_type AS rol,
    r.author_tag,
    r.teaching_score,
    r.difficulty_score,
    r.dedication_score,
    r.comment,
    r.created_at
FROM public.reviews r
JOIN public.professor_courses pc ON r.professor_course_id = pc.id
JOIN public.professors p ON pc.professor_id = p.id
JOIN public.courses c ON pc.course_id = c.id
ORDER BY r.created_at DESC
LIMIT 15;
