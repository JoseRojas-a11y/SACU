-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.faculties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT faculties_pkey PRIMARY KEY (id)
);
CREATE TABLE public.library_books (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  physical_location text,
  file_size_mb numeric,
  access_condition USER-DEFINED NOT NULL DEFAULT 'FREE'::access_type,
  price integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  faculty_id uuid NOT NULL,
  CONSTRAINT library_books_pkey PRIMARY KEY (id),
  CONSTRAINT fk_library_books_faculty FOREIGN KEY (faculty_id) REFERENCES public.faculties(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL,
  course_code character varying NOT NULL,
  full_name character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id)
);
CREATE TABLE public.course_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL,
  course_id uuid NOT NULL,
  content_type USER-DEFINED NOT NULL,
  name character varying NOT NULL,
  physical_location text,
  file_size_mb numeric,
  access_condition USER-DEFINED NOT NULL DEFAULT 'FREE'::access_type,
  price integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT course_materials_pkey PRIMARY KEY (id),
  CONSTRAINT course_materials_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id),
  CONSTRAINT course_materials_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exploration_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  category_id uuid NOT NULL,
  item_type character varying NOT NULL,
  course_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT exploration_items_pkey PRIMARY KEY (id),
  CONSTRAINT exploration_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT exploration_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.professor_course_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL,
  course_id uuid NOT NULL,
  evaluated_teachers_count integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT professor_course_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT professor_course_reviews_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id),
  CONSTRAINT professor_course_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.professors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL,
  course_review_id uuid NOT NULL,
  full_name character varying NOT NULL,
  score numeric NOT NULL CHECK (score >= 0::numeric AND score <= 5::numeric),
  evaluation_method text,
  key_information text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT professors_pkey PRIMARY KEY (id),
  CONSTRAINT professors_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id),
  CONSTRAINT professors_course_review_id_fkey FOREIGN KEY (course_review_id) REFERENCES public.professor_course_reviews(id)
);
CREATE TABLE public.professor_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT professor_tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.professor_tag_assignments (
  professor_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  CONSTRAINT professor_tag_assignments_pkey PRIMARY KEY (professor_id, tag_id),
  CONSTRAINT professor_tag_assignments_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id),
  CONSTRAINT professor_tag_assignments_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.professor_tags(id)
);
CREATE TABLE public.professor_positives (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL,
  description text NOT NULL,
  CONSTRAINT professor_positives_pkey PRIMARY KEY (id),
  CONSTRAINT professor_positives_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id)
);
CREATE TABLE public.professor_negatives (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL,
  description text NOT NULL,
  CONSTRAINT professor_negatives_pkey PRIMARY KEY (id),
  CONSTRAINT professor_negatives_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id)
);
CREATE TABLE public.professor_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL,
  author_name character varying,
  is_anonymous boolean NOT NULL DEFAULT false,
  comment_text text NOT NULL,
  likes integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT professor_comments_pkey PRIMARY KEY (id),
  CONSTRAINT professor_comments_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  event_date date NOT NULL,
  event_time time without time zone NOT NULL,
  location text NOT NULL,
  event_type character varying NOT NULL,
  image_url text,
  organizer character varying,
  description text,
  community_link text,
  registration_link text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.event_speakers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  name character varying NOT NULL,
  short_description text,
  CONSTRAINT event_speakers_pkey PRIMARY KEY (id),
  CONSTRAINT event_speakers_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.notices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  course_id uuid NOT NULL,
  deadline timestamp without time zone NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notices_pkey PRIMARY KEY (id),
  CONSTRAINT notices_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.planchas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo character varying,
  ciclo character varying,
  profesor character varying,
  es_premium boolean,
  costo_monedas integer,
  pdf_url text,
  CONSTRAINT planchas_pkey PRIMARY KEY (id),
  CONSTRAINT planchas_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.courses_alerts (
  course_id character varying NOT NULL,
  section character varying NOT NULL,
  alerts ARRAY NOT NULL,
  CONSTRAINT courses_alerts_pkey PRIMARY KEY (course_id, section)
);
CREATE TABLE public.delegates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id text NOT NULL,
  section text DEFAULT 'U'::text,
  unicode text,
  CONSTRAINT delegates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profesores_documentos (
  doc_id character varying NOT NULL,
  file_name character varying NOT NULL,
  periodo character varying NOT NULL DEFAULT 'General'::character varying,
  ciclo character varying NOT NULL DEFAULT 'General'::character varying,
  total_pages integer NOT NULL DEFAULT 0,
  file_size_bytes bigint DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profesores_documentos_pkey PRIMARY KEY (doc_id)
);
CREATE TABLE public.profesores_paginas (
  page_id bigint NOT NULL DEFAULT nextval('profesores_paginas_page_id_seq'::regclass),
  doc_id character varying NOT NULL,
  page_number integer NOT NULL,
  texto_contenido text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profesores_paginas_pkey PRIMARY KEY (page_id),
  CONSTRAINT profesores_paginas_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES public.profesores_documentos(doc_id)
);
CREATE TABLE public.profesores_indice_invertido (
  termino character varying NOT NULL,
  n_gram integer NOT NULL DEFAULT 1,
  documentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_apariciones integer NOT NULL DEFAULT 1,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profesores_indice_invertido_pkey PRIMARY KEY (termino)
);