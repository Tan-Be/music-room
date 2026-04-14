import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
	return !!(
		supabaseUrl &&
		supabaseAnonKey &&
		supabaseUrl !== "your_supabase_url" &&
		supabaseUrl !== "https://your-project.supabase.co" &&
		supabaseUrl.startsWith("https://")
	);
};

if (!isSupabaseConfigured()) {
	console.warn(
		"Supabase не настроен. Установите NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local",
	);
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export interface Room {
	id: string;
	name: string;
	description: string | null;
	is_public: boolean;
	password_hash: string | null;
	max_participants: number;
	owner_id: string;
	current_track_id: string | null;
	is_playing: boolean;
	created_at: string;
	updated_at: string;
}

export interface Profile {
	id: string;
	username: string;
	avatar_url: string | null;
	spotify_id: string | null;
	tracks_added_today: number;
	last_track_date: string;
	created_at: string;
	updated_at: string;
}

export interface TrackRecord {
	id: string;
	title: string;
	artist: string;
	duration: number | null;
	spotify_id: string | null;
	source_type: "youtube" | "audio_url";
	youtube_id: string | null;
	audio_url: string | null;
	thumbnail_url: string | null;
	added_by: string | null;
	created_at: string;
}

export interface RoomQueueItem {
	id: string;
	room_id: string;
	track_id: string;
	added_by: string | null;
	position: number;
	votes_up: number;
	votes_down: number;
	added_at: string;
	tracks: TrackRecord | null;
}

export interface RoomPlaybackState {
	current_track_id: string | null;
	is_playing: boolean;
}

interface RoomQueueRow {
	id: string;
	room_id: string;
	track_id: string;
	added_by: string | null;
	position: number;
	votes_up: number;
	votes_down: number;
	added_at: string;
	tracks: TrackRecord[] | TrackRecord | null;
}

export const roomsApi = {
	async getPublicRooms() {
		if (!isSupabaseConfigured()) {
			throw new Error(
				"Supabase не настроен. Проверьте переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY",
			);
		}

		const { data, error } = await supabase
			.from("rooms")
			.select(`
          *,
          profiles:owner_id (username),
          room_participants (id)
        `)
			.eq("is_public", true)
			.order("created_at", { ascending: false });

		if (error) {
			throw new Error(
				error.message || error.code || "Ошибка при загрузке комнат",
			);
		}

		return data || [];
	},

	async createRoom(roomData: {
		name: string;
		description?: string;
		is_public: boolean;
		password?: string;
		owner_id: string;
	}) {
		const { data, error } = await supabase
			.from("rooms")
			.insert([
				{
					name: roomData.name,
					description: roomData.description || null,
					is_public: roomData.is_public,
					password_hash: roomData.password || null,
					owner_id: roomData.owner_id,
					max_participants: 10,
				},
			])
			.select()
			.single();

		if (error) throw error;

		await supabase.from("room_participants").insert([
			{
				room_id: data.id,
				user_id: roomData.owner_id,
				role: "owner",
			},
		]);

		return data;
	},

	async getRoomById(roomId: string) {
		const { data, error } = await supabase
			.from("rooms")
			.select(`
          *,
          profiles:owner_id (username),
          room_participants (
            id,
            user_id,
            role,
            joined_at,
            profiles:user_id (username, avatar_url)
          )
        `)
			.eq("id", roomId)
			.single();

		if (error) {
			throw new Error(error.message || "Ошибка базы данных");
		}

		return data;
	},

	async joinRoom(roomId: string, userId: string) {
		const { data, error } = await supabase
			.from("room_participants")
			.insert([
				{
					room_id: roomId,
					user_id: userId,
					role: "member",
				},
			])
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	async leaveRoom(roomId: string, userId: string) {
		const { error } = await supabase
			.from("room_participants")
			.delete()
			.eq("room_id", roomId)
			.eq("user_id", userId);

		if (error) throw error;
	},

	async getPlaybackState(roomId: string): Promise<RoomPlaybackState> {
		const { data, error } = await supabase
			.from("rooms")
			.select("current_track_id, is_playing")
			.eq("id", roomId)
			.single();

		if (error) throw error;

		return {
			current_track_id: data?.current_track_id ?? null,
			is_playing: Boolean(data?.is_playing),
		};
	},

	async setPlaybackState(roomId: string, state: RoomPlaybackState) {
		const { error } = await supabase
			.from("rooms")
			.update({
				current_track_id: state.current_track_id,
				is_playing: state.is_playing,
				updated_at: new Date().toISOString(),
			})
			.eq("id", roomId);

		if (error) throw error;
	},
};

export const queueApi = {
	async getQueue(roomId: string): Promise<RoomQueueItem[]> {
		const { data, error } = await supabase
			.from("room_queue")
			.select(`
        id,
        room_id,
        track_id,
        added_by,
        position,
        votes_up,
        votes_down,
        added_at,
        tracks (
          id,
          title,
          artist,
          duration,
          spotify_id,
          source_type,
          youtube_id,
          audio_url,
          thumbnail_url,
          added_by,
          created_at
        )
      `)
			.eq("room_id", roomId)
			.order("position", { ascending: true });

		if (error) throw error;

		const rows = (data || []) as RoomQueueRow[];

		return rows.map((item) => ({
			id: item.id,
			room_id: item.room_id,
			track_id: item.track_id,
			added_by: item.added_by,
			position: item.position,
			votes_up: item.votes_up,
			votes_down: item.votes_down,
			added_at: item.added_at,
			tracks: Array.isArray(item.tracks)
				? (item.tracks[0] ?? null)
				: (item.tracks ?? null),
		}));
	},

	async addTrack(
		roomId: string,
		input: {
			title: string;
			artist: string;
			sourceType: "youtube" | "audio_url";
			youtubeId?: string | null;
			audioUrl?: string | null;
			userId?: string | null;
		},
	) {
		const { data: positionData, error: positionError } = await supabase
			.from("room_queue")
			.select("position")
			.eq("room_id", roomId)
			.order("position", { ascending: false })
			.limit(1);

		if (positionError) throw positionError;

		const nextPosition = (positionData?.[0]?.position ?? -1) + 1;

		const { data: trackData, error: trackError } = await supabase
			.from("tracks")
			.insert([
				{
					title: input.title,
					artist: input.artist,
					source_type: input.sourceType,
					youtube_id: input.youtubeId ?? null,
					audio_url: input.audioUrl ?? null,
					// Client uses anon Supabase access, so nullable author keeps inserts
					// compatible with current RLS until full Supabase Auth adoption.
					added_by: null,
				},
			])
			.select()
			.single();

		if (trackError) throw trackError;

		const { error: queueError } = await supabase.from("room_queue").insert([
			{
				room_id: roomId,
				track_id: trackData.id,
				added_by: null,
				position: nextPosition,
			},
		]);

		if (queueError) throw queueError;

		return trackData;
	},

	async removeTrack(queueItemId: string) {
		const { error } = await supabase
			.from("room_queue")
			.delete()
			.eq("id", queueItemId);

		if (error) throw error;
	},
};

export const profilesApi = {
	async getProfile(userId: string) {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single();

		if (error) throw error;
		return data;
	},

	async createProfile(profileData: {
		id: string;
		username: string;
		avatar_url?: string;
	}) {
		const { data, error } = await supabase
			.from("profiles")
			.insert([
				{
					id: profileData.id,
					username: profileData.username,
					avatar_url: profileData.avatar_url || null,
				},
			])
			.select()
			.single();

		if (error) throw error;
		return data;
	},
};
