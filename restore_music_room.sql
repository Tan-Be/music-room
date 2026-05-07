-- Music Room Database Restore Script
-- Generated: 2026-05-07 13:02:13
-- Source: db_cluster-12-11-2025@23-05-41.backup

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.track_votes CASCADE;
DROP TABLE IF EXISTS public.room_queue CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.room_participants CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.tracks CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create tables
CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid,
    user_id uuid,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.chat_messages OWNER TO postgres;

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username character varying NOT NULL,
    avatar_url text,
    spotify_id character varying,
    tracks_added_today integer DEFAULT 0,
    last_track_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.profiles OWNER TO postgres;

CREATE TABLE public.room_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid,
    user_id uuid,
    role character varying DEFAULT 'member'::character varying,
    joined_at timestamp without time zone DEFAULT now(),
    CONSTRAINT room_participants_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'moderator'::character varying, 'member'::character varying])::text[])))
);

ALTER TABLE public.room_participants OWNER TO postgres;

CREATE TABLE public.room_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid,
    track_id uuid,
    added_by uuid,
    "position" integer NOT NULL,
    votes_up integer DEFAULT 0,
    votes_down integer DEFAULT 0,
    added_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.room_queue OWNER TO postgres;

CREATE TABLE public.rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    is_public boolean DEFAULT false,
    password_hash character varying,
    max_participants integer DEFAULT 10,
    owner_id uuid NOT NULL,
    current_track_id uuid,
    is_playing boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.rooms OWNER TO postgres;

CREATE TABLE public.track_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    room_id uuid,
    track_id uuid,
    vote_value integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT track_votes_vote_value_check CHECK ((vote_value = ANY (ARRAY[1, '-1'::integer])))
);

ALTER TABLE public.track_votes OWNER TO postgres;

CREATE TABLE public.tracks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    artist character varying NOT NULL,
    duration integer NOT NULL,
    thumbnail_url text,
    spotify_id character varying,
    youtube_id character varying,
    added_by uuid,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.tracks OWNER TO postgres;

-- Add primary keys and unique constraints
ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_room_id_user_id_key UNIQUE (room_id, user_id);

ALTER TABLE ONLY public.room_queue
    ADD CONSTRAINT room_queue_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.track_votes
    ADD CONSTRAINT track_votes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.track_votes
    ADD CONSTRAINT track_votes_user_id_room_id_track_id_key UNIQUE (user_id, room_id, track_id);

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);

-- Add foreign keys
ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.room_queue
    ADD CONSTRAINT room_queue_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.room_queue
    ADD CONSTRAINT room_queue_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.room_queue
    ADD CONSTRAINT room_queue_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);

ALTER TABLE ONLY public.track_votes
    ADD CONSTRAINT track_votes_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.track_votes
    ADD CONSTRAINT track_votes_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.track_votes
    ADD CONSTRAINT track_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.profiles(id);

-- Insert data
INSERT INTO public.profiles (id, username, avatar_url, spotify_id, tracks_added_today, last_track_date, created_at, updated_at) 
VALUES ('bf5a1228-9ca8-4209-92f1-96ef463a1de3', 'Веркин Андрей', NULL, NULL, 0, '2025-11-06', '2025-11-06 13:20:47.991015', '2025-11-06 13:20:47.991015');
