import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

interface PlaybackHistoryRoom {
	id: string | null;
	name?: string | null;
	is_public?: boolean | null;
}

interface PlaybackHistoryItem {
	track_id: string | null;
	rooms?: PlaybackHistoryRoom[] | null;
}

interface TrackReference {
	id?: string | null;
	artist?: string | null;
}

interface TrackRoomItem {
	room_id: string | null;
	tracks?: TrackReference | null;
}

interface UserArtistItem {
	tracks?: {
		artist?: string | null;
	} | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
	console.error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "userId required" }, { status: 400 });
	}

	if (!supabaseUrl || !supabaseKey) {
		return NextResponse.json({ recommendations: [] });
	}

	try {
		const { data: userHistory } = await supabase
			.from("playback_history")
			.select("track_id, rooms!inner(id, name, is_public)")
			.eq("user_id", userId);
		const typedUserHistory = (userHistory || []) as PlaybackHistoryItem[];

		const userRoomIds = [
			...new Set(
				typedUserHistory.flatMap(
					(item) =>
						item.rooms?.flatMap((room) => (room.id ? [room.id] : [])) || [],
				),
			),
		];
		const userTrackIds = [
			...new Set(
				typedUserHistory.flatMap((item) =>
					item.track_id ? [item.track_id] : [],
				),
			),
		];

		if (userTrackIds.length === 0) {
			const { data: publicRooms } = await supabase
				.from("rooms")
				.select("id, name, description, owner_id, created_at")
				.eq("is_public", true)
				.neq("owner_id", userId)
				.limit(10);

			return NextResponse.json({ recommendations: publicRooms || [] });
		}

		const { data: trackRooms } = await supabase
			.from("playback_history")
			.select("room_id, tracks(id, artist)")
			.in("track_id", userTrackIds)
			.neq("user_id", userId);
		const typedTrackRooms = (trackRooms || []) as TrackRoomItem[];

		const roomScores = new Map<
			string,
			{ roomId: string; score: number; artists: Set<string> }
		>();

		typedTrackRooms.forEach((item) => {
			if (item.tracks && item.room_id && !userRoomIds.includes(item.room_id)) {
				const existing = roomScores.get(item.room_id) || {
					roomId: item.room_id,
					score: 0,
					artists: new Set(),
				};
				existing.score += 1;
				if (item.tracks.artist) {
					existing.artists.add(item.tracks.artist);
				}
				roomScores.set(item.room_id, existing);
			}
		});

		const { data: userArtists } = await supabase
			.from("playback_history")
			.select("tracks(artist)")
			.in("track_id", userTrackIds);
		const typedUserArtists = (userArtists || []) as UserArtistItem[];

		const userArtistSet = new Set<string>();
		typedUserArtists.forEach((item) => {
			if (item.tracks?.artist) {
				userArtistSet.add(item.tracks.artist.toLowerCase());
			}
		});

		roomScores.forEach((value) => {
			value.artists.forEach((artist) => {
				if (userArtistSet.has(artist.toLowerCase())) {
					value.score += 2;
				}
			});
		});

		const sortedRooms = [...roomScores.values()]
			.sort((a, b) => b.score - a.score)
			.slice(0, 10)
			.map((r) => r.roomId);

		if (sortedRooms.length === 0) {
			const { data: fallbackRooms } = await supabase
				.from("rooms")
				.select("id, name, description, owner_id, created_at")
				.eq("is_public", true)
				.neq("owner_id", userId)
				.limit(10);

			return NextResponse.json({ recommendations: fallbackRooms || [] });
		}

		const { data: recommendations } = await supabase
			.from("rooms")
			.select("id, name, description, owner_id, created_at")
			.in("id", sortedRooms)
			.eq("is_public", true)
			.neq("owner_id", userId);

		const sortedRecommendations = sortedRooms
			.map((id) => recommendations?.find((r) => r.id === id))
			.filter(Boolean);

		return NextResponse.json({ recommendations: sortedRecommendations });
	} catch (error) {
		console.error("Recommendations API error:", error);
		return NextResponse.json({ recommendations: [] });
	}
}
