"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
	isSupabaseConfigured,
	queueApi,
	type RoomQueueItem,
	roomsApi,
	supabase,
} from "@/lib/supabase";
import { YouTubeSyncPlayer } from "./youtube-sync-player";

interface Comment {
	id: string;
	text: string;
	author: string;
	createdAt: string;
}

interface SyncedComment {
	id: string;
	room_id: string;
	track_id: string;
	user_id: string;
	comment: string;
	created_at: string;
	profiles?: {
		username: string;
		avatar_url: string | null;
	};
}

interface DemoTrack {
	id: string;
	title: string;
	artist: string;
	sourceType: "youtube" | "audio_url";
	youtubeId: string | null;
	audioUrl: string | null;
	addedBy: string;
	addedAt: string;
	comments?: Comment[];
}

interface TrackSourceInfo {
	sourceType: "youtube" | "audio_url";
	youtubeId: string;
	audioUrl: string;
}

interface MusicPlayerProps {
	roomId: string;
	isDemoMode: boolean;
	roomParticipants?: Array<{
		user_id: string;
	}>;
	roomOwnerId?: string;
}

const extractYoutubeId = (url: string): string | null => {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
		/youtube\.com\/watch\?.*v=([^&\s]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}

	return null;
};

const isDirectAudioUrl = (url: string): boolean => {
	try {
		const parsedUrl = new URL(url);
		return /\.(mp3|ogg|wav|m4a|aac|flac)(\?.*)?$/i.test(parsedUrl.pathname);
	} catch {
		return false;
	}
};

const resolveTrackSource = (url: string): TrackSourceInfo | null => {
	const trimmedUrl = url.trim();
	const youtubeId = extractYoutubeId(trimmedUrl);

	if (youtubeId) {
		return {
			sourceType: "youtube",
			youtubeId,
			audioUrl: "",
		};
	}

	if (isDirectAudioUrl(trimmedUrl)) {
		return {
			sourceType: "audio_url",
			youtubeId: "",
			audioUrl: trimmedUrl,
		};
	}

	return null;
};

const getTrackLabel = (item: RoomQueueItem | DemoTrack) => {
	if ("tracks" in item) {
		return {
			title: item.tracks?.title || "Без названия",
			artist: item.tracks?.artist || "Неизвестен",
			sourceType: item.tracks?.source_type || "youtube",
			youtubeId: item.tracks?.youtube_id || "",
			audioUrl: item.tracks?.audio_url || "",
			addedAt: item.added_at,
		};
	}

	return {
		title: item.title,
		artist: item.artist,
		sourceType: item.sourceType,
		youtubeId: item.youtubeId || "",
		audioUrl: item.audioUrl || "",
		addedAt: item.addedAt,
	};
};

export default function MusicPlayer({
	roomId,
	isDemoMode,
	roomParticipants,
	roomOwnerId,
}: MusicPlayerProps) {
	const { user } = useAuth();
	const [queueItems, setQueueItems] = useState<RoomQueueItem[]>([]);
	const [demoTracks, setDemoTracks] = useState<DemoTrack[]>([]);
	const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackPosition, setPlaybackPosition] = useState(0);
	const [playbackUpdatedAt, setPlaybackUpdatedAt] = useState<string | null>(
		null,
	);
	const [showAddForm, setShowAddForm] = useState(false);
	const [newTrack, setNewTrack] = useState({ title: "", artist: "", url: "" });
	const [commentText, setCommentText] = useState("");
	const [activeCommentTrack, setActiveCommentTrack] = useState<string | null>(
		null,
	);
	const [syncedComments, setSyncedComments] = useState<
		Record<string, SyncedComment[]>
	>({});
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [submittingCommentTrackId, setSubmittingCommentTrackId] = useState<
		string | null
	>(null);

	const userId = user?.id ?? null;
	const isOwner = userId === roomOwnerId;
	const isParticipant =
		!roomParticipants ||
		roomParticipants.some((participant) => participant.user_id === userId);
	const canAddTrack = isDemoMode || isParticipant || isOwner;
	const canComment = isDemoMode || isParticipant || isOwner;
	const syncedMode = !isDemoMode && isSupabaseConfigured();

	// biome-ignore lint/correctness/useExhaustiveDependencies: room sync subscriptions are recreated only when room or mode changes.
	useEffect(() => {
		if (syncedMode) {
			void loadSyncedRoomState();
			const channel = supabase
				.channel(`room-sync:${roomId}`)
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "room_queue",
						filter: `room_id=eq.${roomId}`,
					},
					() => {
						void loadQueue();
					},
				)
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "track_comments",
						filter: `room_id=eq.${roomId}`,
					},
					() => {
						void loadTrackComments();
					},
				)
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "rooms",
						filter: `id=eq.${roomId}`,
					},
					() => {
						void loadPlaybackState();
					},
				)
				.subscribe();

			return () => {
				void supabase.removeChannel(channel);
			};
		}

		const saved = localStorage.getItem(`roomTracks-${roomId}`);
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as DemoTrack[];
				setDemoTracks(parsed);
			} catch (error) {
				console.error("Ошибка загрузки локальных треков:", error);
			}
		} else {
			setDemoTracks([]);
		}

		setCurrentTrackId(null);
		setSyncedComments({});
	}, [roomId, syncedMode]);

	useEffect(() => {
		if (!isDemoMode) {
			return;
		}

		if (demoTracks.length > 0) {
			localStorage.setItem(`roomTracks-${roomId}`, JSON.stringify(demoTracks));
			if (!currentTrackId) {
				setCurrentTrackId(demoTracks[0].id);
			}
			return;
		}

		localStorage.removeItem(`roomTracks-${roomId}`);
		setCurrentTrackId(null);
	}, [currentTrackId, demoTracks, isDemoMode, roomId]);

	const loadSyncedRoomState = async () => {
		setLoading(true);

		try {
			const [queueResult, playbackResult] = await Promise.allSettled([
				queueApi.getQueue(roomId),
				roomsApi.getPlaybackState(roomId),
			]);

			// Загружаем комментарии независимо — не блокируем основной поток
			void loadTrackComments().catch((err: unknown) => {
				console.warn(
					"Комментарии недоступны:",
					err instanceof Error ? err.message : String(err),
				);
			});

			const items = queueResult.status === "fulfilled" ? queueResult.value : [];
			const playback =
				playbackResult.status === "fulfilled"
					? playbackResult.value
					: {
							current_track_id: null,
							is_playing: false,
							playback_position: 0,
							playback_updated_at: null,
						};

			if (queueResult.status === "rejected") {
				const err = queueResult.reason as Error;
				console.warn("Очередь недоступна:", err?.message ?? String(err));
			}
			if (playbackResult.status === "rejected") {
				const err = playbackResult.reason as Error;
				console.warn(
					"Состояние воспроизведения недоступно:",
					err?.message ?? String(err),
				);
			}

			setQueueItems(items);
			setCurrentTrackId(playback.current_track_id);
			setIsPlaying(playback.is_playing);
			setPlaybackPosition(playback.playback_position);
			setPlaybackUpdatedAt(playback.playback_updated_at);

			if (!playback.current_track_id && items.length > 0) {
				await roomsApi.setPlaybackState(roomId, {
					current_track_id: items[0].track_id,
					is_playing: true,
				});
			}
		} catch (error) {
			const msg =
				error instanceof Error ? error.message : JSON.stringify(error);
			console.error("Ошибка синхронизации комнаты:", msg);
		} finally {
			setLoading(false);
		}
	};

	const loadQueue = async () => {
		const items = await queueApi.getQueue(roomId);
		setQueueItems(items);

		if (items.length === 0) {
			setCurrentTrackId(null);
		}
	};

	const loadPlaybackState = async () => {
		const playback = await roomsApi.getPlaybackState(roomId);
		setCurrentTrackId(playback.current_track_id);
		setIsPlaying(playback.is_playing);
		setPlaybackPosition(playback.playback_position);
		setPlaybackUpdatedAt(playback.playback_updated_at);
	};

	const loadTrackComments = async () => {
		const response = await fetch(`/api/track-comments?roomId=${roomId}`);
		const data = (await response.json()) as { comments?: SyncedComment[] };
		const groupedComments = (data.comments || []).reduce<
			Record<string, SyncedComment[]>
		>((accumulator, item) => {
			if (!accumulator[item.track_id]) {
				accumulator[item.track_id] = [];
			}
			accumulator[item.track_id].push(item);
			return accumulator;
		}, {});
		setSyncedComments(groupedComments);
		return groupedComments;
	};

	const handleAddTrack = async () => {
		if (!newTrack.title.trim() || !newTrack.url.trim()) {
			alert("Введите название трека и ссылку на YouTube или аудиофайл");
			return;
		}

		const trackSource = resolveTrackSource(newTrack.url);
		if (!trackSource) {
			alert(
				"Поддерживаются ссылки на YouTube и прямые аудиофайлы (.mp3, .ogg, .wav, .m4a, .aac, .flac).",
			);
			return;
		}

		setSubmitting(true);

		try {
			if (syncedMode) {
				const createdTrack = await queueApi.addTrack(roomId, {
					title: newTrack.title.trim(),
					artist: newTrack.artist.trim() || "Неизвестен",
					sourceType: trackSource.sourceType,
					youtubeId: trackSource.youtubeId || null,
					audioUrl: trackSource.audioUrl || null,
					userId,
				});

				if (!currentTrackId) {
					await roomsApi.setPlaybackState(roomId, {
						current_track_id: createdTrack.id,
						is_playing: true,
					});
				}
			} else {
				const track: DemoTrack = {
					id: Date.now().toString(),
					title: newTrack.title.trim(),
					artist: newTrack.artist.trim() || "Неизвестен",
					sourceType: trackSource.sourceType,
					youtubeId: trackSource.youtubeId || null,
					audioUrl: trackSource.audioUrl || null,
					addedBy: "Вы",
					addedAt: new Date().toISOString(),
				};

				setDemoTracks((previous) => [...previous, track]);
				if (!currentTrackId) {
					setCurrentTrackId(track.id);
				}
			}

			setNewTrack({ title: "", artist: "", url: "" });
			setShowAddForm(false);
		} catch (error) {
			console.error("Ошибка добавления трека:", error);
			alert(
				"Не удалось добавить трек. Проверьте настройки комнаты и Supabase.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const playTrack = async (trackId: string) => {
		if (syncedMode) {
			try {
				await roomsApi.setPlaybackState(roomId, {
					current_track_id: trackId,
					is_playing: true,
				});
			} catch (error) {
				console.error("Ошибка обновления текущего трека:", error);
			}
			return;
		}

		setCurrentTrackId(trackId);
	};

	const removeTrack = async (trackId: string, queueItemId?: string) => {
		if (syncedMode && queueItemId) {
			try {
				await queueApi.removeTrack(queueItemId);

				if (currentTrackId === trackId) {
					const remainingItems = queueItems.filter(
						(item) => item.id !== queueItemId,
					);
					const nextTrackId = remainingItems[0]?.track_id ?? null;
					await roomsApi.setPlaybackState(roomId, {
						current_track_id: nextTrackId,
						is_playing: Boolean(nextTrackId),
					});
				}
			} catch (error) {
				console.error("Ошибка удаления трека:", error);
				alert("Не удалось удалить трек из очереди.");
			}
			return;
		}

		const updatedTracks = demoTracks.filter((track) => track.id !== trackId);
		setDemoTracks(updatedTracks);

		if (currentTrackId === trackId) {
			setCurrentTrackId(updatedTracks[0]?.id ?? null);
		}
	};

	const handlePlaybackChange = async (
		position: number,
		isPlayingVal: boolean,
	) => {
		if (syncedMode) {
			try {
				await roomsApi.setPlaybackState(roomId, {
					current_track_id: currentTrackId,
					is_playing: isPlayingVal,
					playback_position: position,
				});
			} catch (error) {
				console.error("Ошибка обновления воспроизведения:", error);
			}
		} else {
			setIsPlaying(isPlayingVal);
		}
	};

	const handleAddComment = async (trackId: string) => {
		if (!commentText.trim()) {
			return;
		}

		if (syncedMode) {
			if (!userId || !canComment) {
				return;
			}

			try {
				setSubmittingCommentTrackId(trackId);
				const { data: createdComment, error } = await supabase
					.from("track_comments")
					.insert([
						{
							room_id: roomId,
							track_id: trackId,
							user_id: userId,
							comment: commentText.trim(),
						},
					])
					.select("*, profiles(username, avatar_url)")
					.single();

				if (error) throw error;

				if (createdComment) {
					setSyncedComments((previous) => ({
						...previous,
						[trackId]: [...(previous[trackId] || []), createdComment],
					}));
				}

				setCommentText("");
				setActiveCommentTrack(null);
			} catch (error) {
				console.error("Ошибка отправки комментария:", error);
				alert("Не удалось отправить комментарий.");
			} finally {
				setSubmittingCommentTrackId(null);
			}
			return;
		}

		const updatedTracks = demoTracks.map((track) => {
			if (track.id !== trackId) {
				return track;
			}

			return {
				...track,
				comments: [
					...(track.comments || []),
					{
						id: Date.now().toString(),
						text: commentText,
						author: "Вы",
						createdAt: new Date().toISOString(),
					},
				],
			};
		});

		setDemoTracks(updatedTracks);
		setCommentText("");
		setActiveCommentTrack(null);
	};

	const currentSyncedTrack =
		queueItems.find((item) => item.track_id === currentTrackId) ?? null;
	const currentDemoTrack =
		demoTracks.find((track) => track.id === currentTrackId) ?? null;
	const currentTrack = syncedMode ? currentSyncedTrack : currentDemoTrack;
	const visibleTracks = syncedMode ? queueItems : demoTracks;

	const getCommentCount = (track: RoomQueueItem | DemoTrack) => {
		if ("tracks" in track) {
			return syncedComments[track.track_id]?.length || 0;
		}

		return track.comments?.length || 0;
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
			{loading && (
				<div
					style={{
						padding: "0.75rem 1rem",
						borderRadius: "12px",
						backgroundColor: "rgba(139, 92, 246, 0.12)",
						color: "#c4b5fd",
						fontSize: "0.9rem",
					}}
				>
					Синхронизация состояния комнаты...
				</div>
			)}

			{currentTrack && (
				<div
					style={{
						background:
							"linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
						border: "2px solid rgba(139, 92, 246, 0.3)",
						borderRadius: "16px",
						padding: "1.5rem",
						backdropFilter: "blur(10px)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "1rem",
							marginBottom: "1rem",
						}}
					>
						<div
							style={{
								width: "60px",
								height: "60px",
								background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
								borderRadius: "12px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "1.5rem",
							}}
						>
							🎵
						</div>
						<div style={{ flex: 1 }}>
							<h3
								style={{
									color: "#e2e8f0",
									margin: "0 0 0.25rem 0",
									fontSize: "1.2rem",
								}}
							>
								{getTrackLabel(currentTrack).title}
							</h3>
							<p style={{ color: "#a1a1aa", margin: 0, fontSize: "0.9rem" }}>
								{getTrackLabel(currentTrack).artist}
							</p>
						</div>
						{syncedMode && (
							<span
								style={{
									color: "#22c55e",
									fontSize: "0.8rem",
									backgroundColor: "rgba(34, 197, 94, 0.14)",
									borderRadius: "999px",
									padding: "0.4rem 0.75rem",
								}}
							>
								Комната синхронизирована
							</span>
						)}
					</div>

					<div
						style={{
							position: "relative",
							borderRadius: "12px",
							overflow: "hidden",
							backgroundColor: "rgba(15, 23, 42, 0.92)",
						}}
					>
						{getTrackLabel(currentTrack).sourceType === "audio_url" ? (
							<div
								style={{
									padding: "1.5rem",
									display: "flex",
									flexDirection: "column",
									gap: "1rem",
								}}
							>
								<p style={{ color: "#a1a1aa", margin: 0, fontSize: "0.9rem" }}>
									Прямое аудио
								</p>
								{/* biome-ignore lint/a11y/useMediaCaption: music tracks are played as standalone audio sources without caption tracks. */}
								<audio
									controls
									autoPlay
									src={getTrackLabel(currentTrack).audioUrl}
									style={{ width: "100%" }}
								>
									Ваш браузер не поддерживает воспроизведение аудио.
								</audio>
							</div>
						) : (
							<div
								style={{
									position: "relative",
									paddingBottom: "56.25%",
									height: 0,
								}}
							>
								<YouTubeSyncPlayer
									youtubeId={getTrackLabel(currentTrack).youtubeId}
									isPlaying={syncedMode ? isPlaying : true}
									playbackPosition={syncedMode ? playbackPosition : 0}
									playbackUpdatedAt={syncedMode ? playbackUpdatedAt : null}
									onPlaybackChange={handlePlaybackChange}
									isOwner={isOwner}
									isDemoMode={isDemoMode}
								/>
							</div>
						)}
					</div>
				</div>
			)}

			<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
				{canAddTrack ? (
					<button
						type="button"
						onClick={() => setShowAddForm((value) => !value)}
						className="btn btn-danger"
					>
						➕ Добавить трек
					</button>
				) : (
					<div
						style={{
							padding: "0.75rem 1.5rem",
							backgroundColor: "rgba(107, 114, 128, 0.3)",
							borderRadius: "12px",
							color: "#9ca3af",
							fontSize: "0.9rem",
						}}
					>
						🔒 Присоединитесь к комнате, чтобы добавлять треки
					</div>
				)}
				{syncedMode && (
					<div
						style={{
							padding: "0.75rem 1rem",
							backgroundColor: "rgba(34, 197, 94, 0.12)",
							border: "1px solid rgba(34, 197, 94, 0.2)",
							borderRadius: "12px",
							color: "#86efac",
							fontSize: "0.85rem",
						}}
					>
						Очередь и выбранный трек общие для всех участников комнаты.
					</div>
				)}
			</div>

			{showAddForm && (
				<div
					style={{
						backgroundColor: "rgba(30, 30, 30, 0.8)",
						border: "2px solid rgba(239, 68, 68, 0.3)",
						borderRadius: "12px",
						padding: "1.5rem",
					}}
				>
					<h4 style={{ color: "#e2e8f0", marginBottom: "0.5rem" }}>
						Добавить трек
					</h4>
					<p
						style={{
							color: "#a1a1aa",
							fontSize: "0.85rem",
							marginBottom: "1rem",
						}}
					>
						Вставьте ссылку на YouTube или прямую ссылку на аудиофайл. Примеры:
						<br />
						https://www.youtube.com/watch?v=ABC123
						<br />
						https://youtu.be/ABC123
						<br />
						https://example.com/song.mp3
					</p>
					<div
						style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
					>
						<input
							type="text"
							placeholder="Название трека *"
							value={newTrack.title}
							onChange={(event) =>
								setNewTrack({ ...newTrack, title: event.target.value })
							}
							className="form-input"
							style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
						/>
						<input
							type="text"
							placeholder="Исполнитель"
							value={newTrack.artist}
							onChange={(event) =>
								setNewTrack({ ...newTrack, artist: event.target.value })
							}
							className="form-input"
							style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
						/>
						<input
							type="text"
							placeholder="Ссылка на YouTube или аудиофайл *"
							value={newTrack.url}
							onChange={(event) =>
								setNewTrack({ ...newTrack, url: event.target.value })
							}
							className="form-input"
							style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
						/>
						<div style={{ display: "flex", gap: "1rem" }}>
							<button
								type="button"
								onClick={() => setShowAddForm(false)}
								className="btn btn-ghost"
								style={{ flex: 1 }}
							>
								Отмена
							</button>
							<button
								type="button"
								onClick={() => void handleAddTrack()}
								disabled={
									submitting || !newTrack.title.trim() || !newTrack.url.trim()
								}
								className="btn btn-danger"
								style={{ flex: 1 }}
							>
								{submitting ? "Добавление..." : "Добавить"}
							</button>
						</div>
					</div>
				</div>
			)}

			<div>
				<h4 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>
					📋 Плейлист ({visibleTracks.length})
				</h4>
				{visibleTracks.length === 0 ? (
					<div
						style={{ color: "#a1a1aa", textAlign: "center", padding: "2rem" }}
					>
						<p style={{ marginBottom: "0.5rem" }}>🎵 Пока нет треков</p>
						<p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
							Нажмите "Добавить трек" и вставьте ссылку на YouTube или аудиофайл
						</p>
					</div>
				) : (
					<div
						style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
					>
						{visibleTracks.map((track, index) => {
							const label = getTrackLabel(track);
							const isCurrent =
								"tracks" in track
									? currentTrackId === track.track_id
									: currentTrackId === track.id;
							const itemId = "tracks" in track ? track.id : track.id;
							const trackId = "tracks" in track ? track.track_id : track.id;

							return (
								<div key={itemId}>
									{/* biome-ignore lint/a11y/useSemanticElements: this container also includes nested action buttons, so a semantic button would be invalid here. */}
									<div
										role="button"
										tabIndex={0}
										style={{
											display: "flex",
											alignItems: "center",
											gap: "1rem",
											padding: "1rem",
											backgroundColor: isCurrent
												? "rgba(239, 68, 68, 0.2)"
												: "rgba(255, 255, 255, 0.05)",
											border: `2px solid ${isCurrent ? "rgba(239, 68, 68, 0.5)" : "transparent"}`,
											borderRadius: "12px",
											cursor: "pointer",
											transition: "all 0.2s ease",
										}}
										onClick={() => void playTrack(trackId)}
										onKeyDown={(event) => {
											if (event.key === "Enter" || event.key === " ") {
												event.preventDefault();
												void playTrack(trackId);
											}
										}}
									>
										<span
											style={{
												color: "#ef4444",
												fontWeight: "bold",
												minWidth: "24px",
											}}
										>
											{index + 1}
										</span>
										<div style={{ flex: 1 }}>
											<p
												style={{
													color: "#e2e8f0",
													margin: "0 0 0.25rem 0",
													fontWeight: 500,
												}}
											>
												{label.title}
											</p>
											<p
												style={{
													color: "#a1a1aa",
													margin: 0,
													fontSize: "0.85rem",
												}}
											>
												{label.artist} • добавлен{" "}
												{new Date(label.addedAt).toLocaleDateString("ru-RU")}
											</p>
										</div>
										{isCurrent && <span style={{ color: "#ef4444" }}>▶</span>}
										{"tracks" in track && (
											<span
												style={{
													padding: "0.4rem 0.6rem",
													background: "rgba(34, 197, 94, 0.14)",
													borderRadius: "6px",
													color: "#86efac",
													fontSize: "0.75rem",
												}}
											>
												Общий трек
											</span>
										)}
										<span
											style={{
												padding: "0.4rem 0.6rem",
												background:
													label.sourceType === "audio_url"
														? "rgba(245, 158, 11, 0.16)"
														: "rgba(59, 130, 246, 0.16)",
												borderRadius: "6px",
												color:
													label.sourceType === "audio_url"
														? "#fcd34d"
														: "#93c5fd",
												fontSize: "0.75rem",
											}}
										>
											{label.sourceType === "audio_url"
												? "Аудио URL"
												: "YouTube"}
										</span>
										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation();
												setActiveCommentTrack(
													activeCommentTrack === trackId ? null : trackId,
												);
											}}
											className="btn btn-sm"
											style={{
												background: "rgba(59, 130, 246, 0.2)",
												color: "#3b82f6",
												border: "none",
											}}
										>
											💬 {getCommentCount(track)}
										</button>
										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation();
												void removeTrack(
													trackId,
													"tracks" in track ? track.id : undefined,
												);
											}}
											className="btn btn-danger btn-icon btn-sm"
										>
											🗑
										</button>
									</div>
									{activeCommentTrack === trackId && (
										<div
											style={{
												marginTop: "0.5rem",
												padding: "1rem",
												backgroundColor: "rgba(30, 30, 30, 0.8)",
												border: "2px solid rgba(59, 130, 246, 0.3)",
												borderRadius: "12px",
											}}
										>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													marginBottom: "0.75rem",
												}}
											>
												<h5
													style={{
														color: "#e2e8f0",
														margin: 0,
														fontSize: "0.9rem",
													}}
												>
													💬 Комментарии ({getCommentCount(track)})
												</h5>
												<span
													style={{
														color: syncedMode ? "#86efac" : "#f59e0b",
														fontSize: "0.75rem",
														backgroundColor: syncedMode
															? "rgba(34, 197, 94, 0.14)"
															: "rgba(245, 158, 11, 0.2)",
														padding: "0.25rem 0.5rem",
														borderRadius: "4px",
													}}
												>
													{syncedMode
														? "Синхронизируется в комнате"
														: "Только локально"}
												</span>
											</div>
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													gap: "0.5rem",
													marginBottom: "1rem",
												}}
											>
												{syncedMode
													? (syncedComments[trackId] || []).map((comment) => (
															<div
																key={comment.id}
																style={{
																	padding: "0.5rem 0.75rem",
																	backgroundColor: "rgba(59, 130, 246, 0.1)",
																	borderRadius: "8px",
																	border: "1px solid rgba(59, 130, 246, 0.2)",
																}}
															>
																<p
																	style={{
																		color: "#e2e8f0",
																		margin: "0 0 0.25rem 0",
																		fontSize: "0.9rem",
																	}}
																>
																	{comment.comment}
																</p>
																<p
																	style={{
																		color: "#6b7280",
																		margin: 0,
																		fontSize: "0.75rem",
																	}}
																>
																	{comment.profiles?.username || "Пользователь"}{" "}
																	•{" "}
																	{new Date(
																		comment.created_at,
																	).toLocaleDateString("ru-RU")}
																</p>
															</div>
														))
													: ("tracks" in track ? [] : track.comments || []).map(
															(comment: Comment) => (
																<div
																	key={comment.id}
																	style={{
																		padding: "0.5rem 0.75rem",
																		backgroundColor: "rgba(59, 130, 246, 0.1)",
																		borderRadius: "8px",
																		border: "1px solid rgba(59, 130, 246, 0.2)",
																	}}
																>
																	<p
																		style={{
																			color: "#e2e8f0",
																			margin: "0 0 0.25rem 0",
																			fontSize: "0.9rem",
																		}}
																	>
																		{comment.text}
																	</p>
																	<p
																		style={{
																			color: "#6b7280",
																			margin: 0,
																			fontSize: "0.75rem",
																		}}
																	>
																		{comment.author} •{" "}
																		{new Date(
																			comment.createdAt,
																		).toLocaleDateString("ru-RU")}
																	</p>
																</div>
															),
														)}
												{getCommentCount(track) === 0 && (
													<p
														style={{
															color: "#6b7280",
															fontSize: "0.85rem",
															fontStyle: "italic",
														}}
													>
														Пока нет комментариев. Будьте первым!
													</p>
												)}
											</div>
											{canComment ? (
												<div style={{ display: "flex", gap: "0.5rem" }}>
													<input
														type="text"
														placeholder="Напишите комментарий..."
														value={commentText}
														onChange={(event) =>
															setCommentText(event.target.value)
														}
														className="form-input"
														style={{
															flex: 1,
															borderColor: "rgba(59, 130, 246, 0.3)",
														}}
													/>
													<button
														type="button"
														onClick={() => void handleAddComment(trackId)}
														disabled={
															!commentText.trim() ||
															submittingCommentTrackId === trackId
														}
														className="btn btn-primary btn-sm"
													>
														{submittingCommentTrackId === trackId
															? "..."
															: "Отправить"}
													</button>
												</div>
											) : (
												<div
													style={{
														color: "#9ca3af",
														fontSize: "0.85rem",
													}}
												>
													Присоединитесь к комнате, чтобы писать комментарии.
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
