import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const badWords = ["плохое", "ужасное", "отстой", " garbage ", "damn", "shit"];

function filterComment(comment: string): string {
	let filtered = comment;
	for (const word of badWords) {
		const regex = new RegExp(word, "gi");
		filtered = filtered.replace(regex, "***");
	}
	return filtered;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const roomId = searchParams.get("roomId");

	if (!roomId) {
		return NextResponse.json({ error: "roomId required" }, { status: 400 });
	}

	if (!supabaseUrl || !supabaseKey) {
		return NextResponse.json({ comments: [] });
	}

	try {
		const { data: comments, error } = await supabase
			.from("track_comments")
			.select("*, profiles(username, avatar_url)")
			.eq("room_id", roomId)
			.order("created_at", { ascending: true });

		if (error) {
			throw error;
		}

		return NextResponse.json({ comments: comments || [] });
	} catch (error) {
		console.error("Track comments GET error:", error);
		return NextResponse.json({ comments: [] });
	}
}

export async function POST(request: Request) {
	const body = await request.json();
	const { roomId, trackId, userId, comment } = body;

	if (!roomId || !trackId || !userId || !comment?.trim()) {
		return NextResponse.json(
			{ error: "roomId, trackId, userId and comment required" },
			{ status: 400 },
		);
	}

	if (!supabaseUrl || !supabaseKey) {
		return NextResponse.json(
			{ error: "Supabase not configured" },
			{ status: 500 },
		);
	}

	try {
		const filteredComment = filterComment(comment.trim());

		const { data: newComment, error } = await supabase
			.from("track_comments")
			.insert([
				{
					room_id: roomId,
					track_id: trackId,
					user_id: userId,
					comment: filteredComment,
				},
			])
			.select("*, profiles(username, avatar_url)")
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json({ comment: newComment });
	} catch (error) {
		console.error("Track comments POST error:", error);
		return NextResponse.json(
			{ error: "Failed to create track comment" },
			{ status: 500 },
		);
	}
}
