"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { AnimatedBackground } from "@/components/common/animated-background";
import MusicPlayer from "@/components/music-player";
import { isSupabaseConfigured, roomsApi, supabase } from "@/lib/supabase";

interface RoomParticipant {
	id: string;
	user_id: string;
	role: string;
	profiles?: {
		username: string;
		avatar_url: string | null;
	};
}

interface Room {
	id: string;
	name: string;
	description: string | null;
	is_public: boolean;
	owner_id: string;
	max_participants: number;
	current_track_id?: string | null;
	is_playing?: boolean;
	created_at: string;
	profiles?: {
		username: string;
	};
	room_participants?: RoomParticipant[];
}

const isUuid = (value: string) =>
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		value,
	);

export default function RoomPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const { data: session } = useSession();
	const [room, setRoom] = useState<Room | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDemoMode, setIsDemoMode] = useState(false);
	const [isLocallyOwnedRoom, setIsLocallyOwnedRoom] = useState(false);
	const [showQRCode, setShowQRCode] = useState(false);
	const [showChat, setShowChat] = useState(false);
	const [isLeavingRoom, setIsLeavingRoom] = useState(false);

	const roomId = params.id as string;
	const ownerFlag = searchParams.get("owner");
	const roomUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/room/${roomId}`
			: "";
	const userId = session?.user
		? ((session.user as { id?: string }).id ?? null)
		: null;
	const userName = session?.user?.name ?? null;

	useEffect(() => {
		if (ownerFlag !== "1") {
			return;
		}

		const savedOwnedRoomIds = localStorage.getItem("ownedRoomIds");
		try {
			const ownedRoomIds = savedOwnedRoomIds
				? JSON.parse(savedOwnedRoomIds)
				: [];
			const nextOwnedRoomIds = Array.isArray(ownedRoomIds)
				? Array.from(new Set([...ownedRoomIds, roomId]))
				: [roomId];
			localStorage.setItem("ownedRoomIds", JSON.stringify(nextOwnedRoomIds));
			setIsLocallyOwnedRoom(true);
		} catch (error) {
			console.error("Ошибка сохранения ownerFlag:", error);
			localStorage.setItem("ownedRoomIds", JSON.stringify([roomId]));
			setIsLocallyOwnedRoom(true);
		}

		window.history.replaceState({}, "", `/room/${roomId}`);
	}, [ownerFlag, roomId]);

	useEffect(() => {
		const savedOwnedRoomIds = localStorage.getItem("ownedRoomIds");
		if (!savedOwnedRoomIds) {
			setIsLocallyOwnedRoom(false);
			return;
		}

		try {
			const ownedRoomIds = JSON.parse(savedOwnedRoomIds) as string[];
			setIsLocallyOwnedRoom(
				Array.isArray(ownedRoomIds) && ownedRoomIds.includes(roomId),
			);
		} catch (error) {
			console.error("Ошибка загрузки ownedRoomIds:", error);
			setIsLocallyOwnedRoom(false);
		}
	}, [roomId]);

	const loadDemoRoom = () => {
		const savedRooms = localStorage.getItem("demoRooms");
		const fallbackRoom = {
			id: roomId,
			name: `Комната #${roomId.slice(0, 8)}`,
			description: "Демо-комната",
			is_public: true,
			owner_id: "demo",
			max_participants: 10,
			created_at: new Date().toISOString(),
			profiles: { username: "Demo User" },
			room_participants: [],
		};

		if (!savedRooms) {
			setRoom(fallbackRoom);
			setLoading(false);
			return;
		}

		try {
			const parsedRooms = JSON.parse(savedRooms) as Array<{
				id: string;
				name: string;
				description?: string | null;
				is_public?: boolean;
				created_at?: string;
				owner?: string;
				participants?: number;
			}>;
			const localRoom = parsedRooms.find((item) => item.id === roomId);

			if (localRoom) {
				setRoom({
					id: localRoom.id,
					name: localRoom.name,
					description: localRoom.description || "Демо-комната",
					is_public: localRoom.is_public ?? true,
					owner_id: "demo",
					max_participants: Math.max(localRoom.participants || 1, 10),
					created_at: localRoom.created_at || new Date().toISOString(),
					profiles: { username: localRoom.owner || "Demo User" },
					room_participants: [],
				});
			} else {
				setRoom(fallbackRoom);
			}
		} catch (error) {
			console.error("Ошибка загрузки demoRooms:", error);
			setRoom(fallbackRoom);
		}

		setLoading(false);
	};

	const loadRoom = async () => {
		try {
			setLoading(true);
			setError(null);
			setIsDemoMode(false);

			if (!isSupabaseConfigured()) {
				setIsDemoMode(true);
				loadDemoRoom();
				return;
			}

			if (!isUuid(roomId)) {
				setIsDemoMode(true);
				loadDemoRoom();
				return;
			}

			const data = await roomsApi.getRoomById(roomId);
			if (!data) {
				throw new Error("Комната не найдена");
			}

			setRoom(data);
			setLoading(false);
		} catch (loadError) {
			console.error("Room load error:", loadError);
			setIsDemoMode(true);
			loadDemoRoom();
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: loadRoom should rerun only when room id changes.
	useEffect(() => {
		void loadRoom();
	}, [roomId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: realtime subscription is bound to room id and demo mode.
	useEffect(() => {
		if (!roomId || isDemoMode || !isSupabaseConfigured()) {
			return;
		}

		const channel = supabase
			.channel(`room-page:${roomId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "room_participants",
					filter: `room_id=eq.${roomId}`,
				},
				() => {
					void loadRoom();
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
					void loadRoom();
				},
			)
			.subscribe();

		return () => {
			void supabase.removeChannel(channel);
		};
	}, [isDemoMode, roomId]);

	const handleDeleteRoom = async () => {
		if (!room) return;
		if (!confirm(`Удалить комнату "${room.name}"?`)) return;

		if (!isDemoMode && isSupabaseConfigured()) {
			try {
				await supabase.from("rooms").delete().eq("id", room.id);
			} catch (deleteError) {
				console.error("Delete error:", deleteError);
			}
		}

		window.location.href = "/rooms";
	};

	const handleLeaveRoom = async () => {
		if (!room || !userId || isDemoMode) {
			return;
		}

		if (!confirm(`Покинуть комнату "${room.name}"?`)) {
			return;
		}

		try {
			setIsLeavingRoom(true);
			await roomsApi.leaveRoom(room.id, userId);
			window.location.href = "/rooms";
		} catch (leaveError) {
			console.error("Leave error:", leaveError);
			alert("Не удалось покинуть комнату.");
		} finally {
			setIsLeavingRoom(false);
		}
	};

	const isOwner =
		isLocallyOwnedRoom ||
		(userId !== null && userId === room?.owner_id) ||
		(userName !== null && userName === room?.profiles?.username);
	const isParticipant =
		isOwner ||
		(room?.room_participants?.some(
			(participant) => participant.user_id === userId,
		) ??
			false);

	if (loading) {
		return (
			<main
				style={{ position: "relative", minHeight: "100vh", padding: "2rem" }}
			>
				<AnimatedBackground />
				<div
					style={{
						position: "relative",
						zIndex: 10,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "100vh",
					}}
				>
					<div style={{ textAlign: "center", color: "#e2e8f0" }}>
						<div
							style={{
								width: "50px",
								height: "50px",
								border: "3px solid rgba(139, 92, 246, 0.3)",
								borderTop: "3px solid #8b5cf6",
								borderRadius: "50%",
								animation: "spin 1s linear infinite",
								margin: "0 auto 1rem",
							}}
						/>
						<p style={{ fontSize: "1.2rem" }}>Загрузка комнаты...</p>
					</div>
				</div>
				<style jsx>{`
					@keyframes spin {
						0% {
							transform: rotate(0deg);
						}
						100% {
							transform: rotate(360deg);
						}
					}
				`}</style>
			</main>
		);
	}

	if (error || !room) {
		return (
			<main
				style={{ position: "relative", minHeight: "100vh", padding: "2rem" }}
			>
				<AnimatedBackground />
				<div
					style={{
						position: "relative",
						zIndex: 10,
						maxWidth: "800px",
						margin: "0 auto",
						textAlign: "center",
						paddingTop: "20vh",
					}}
				>
					<h1
						style={{
							fontSize: "2.5rem",
							marginBottom: "1rem",
							color: "#ef4444",
						}}
					>
						Ошибка
					</h1>
					<p
						style={{
							fontSize: "1.2rem",
							color: "#a1a1aa",
							marginBottom: "2rem",
						}}
					>
						{error || "Комната не найдена"}
					</p>
					<a
						href="/rooms"
						style={{
							display: "inline-block",
							padding: "1rem 2rem",
							background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
							color: "white",
							borderRadius: "12px",
							textDecoration: "none",
							fontSize: "1.1rem",
						}}
					>
						← Назад к комнатам
					</a>
				</div>
			</main>
		);
	}

	return (
		<main style={{ position: "relative", minHeight: "100vh", padding: "2rem" }}>
			<AnimatedBackground />
			<div
				style={{
					position: "relative",
					zIndex: 10,
					maxWidth: "1200px",
					margin: "0 auto",
				}}
			>
				{isDemoMode && (
					<div
						style={{
							background:
								"linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)",
							border: "2px solid rgba(245, 158, 11, 0.5)",
							borderRadius: "12px",
							padding: "1rem 1.5rem",
							marginBottom: "1.5rem",
							display: "flex",
							alignItems: "center",
							gap: "0.75rem",
							backdropFilter: "blur(10px)",
						}}
					>
						<span style={{ fontSize: "1.5rem" }}>⚠️</span>
						<div>
							<p
								style={{
									color: "#f59e0b",
									fontWeight: "bold",
									margin: "0 0 0.25rem 0",
								}}
							>
								Демо-режим
							</p>
							<p style={{ color: "#d97706", margin: 0, fontSize: "0.9rem" }}>
								Supabase не подключен. Данные сохраняются только локально.
							</p>
						</div>
					</div>
				)}

				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						gap: "1rem",
						flexWrap: "wrap",
						marginBottom: "2rem",
					}}
				>
					<div>
						<h1
							style={{
								fontSize: "2.5rem",
								marginBottom: "0.5rem",
								color: "#8b5cf6",
								textShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
							}}
						>
							🎵 {room.name}
						</h1>
						<p style={{ fontSize: "1.1rem", color: "#a1a1aa" }}>
							{room.description || "Нет описания"}
						</p>
					</div>

					<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
						{!isOwner && !isParticipant && !isDemoMode && session && (
							<button
								type="button"
								onClick={async () => {
									if (!userId || isDemoMode) return;
									try {
										await roomsApi.joinRoom(room.id, userId);
										void loadRoom();
									} catch (joinError) {
										console.error("Join error:", joinError);
									}
								}}
								style={{
									padding: "0.75rem 2rem",
									background:
										"linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
									border: "none",
									borderRadius: "12px",
									color: "white",
									cursor: "pointer",
								}}
							>
								🎯 Присоединиться
							</button>
						)}
						{!isOwner && isParticipant && !isDemoMode && session && (
							<button
								type="button"
								onClick={() => void handleLeaveRoom()}
								disabled={isLeavingRoom}
								style={{
									padding: "0.75rem 1.5rem",
									border: "2px solid rgba(239, 68, 68, 0.3)",
									borderRadius: "12px",
									backgroundColor: "rgba(239, 68, 68, 0.1)",
									color: "#ef4444",
									cursor: isLeavingRoom ? "not-allowed" : "pointer",
									opacity: isLeavingRoom ? 0.7 : 1,
								}}
							>
								{isLeavingRoom ? "Выходим..." : "↩ Покинуть комнату"}
							</button>
						)}
						<button
							type="button"
							onClick={() => setShowQRCode((value) => !value)}
							style={{
								padding: "0.75rem 1.5rem",
								border: "2px solid rgba(34, 197, 94, 0.3)",
								borderRadius: "12px",
								backgroundColor: "rgba(34, 197, 94, 0.1)",
								color: "#22c55e",
								cursor: "pointer",
							}}
						>
							📱 {showQRCode ? "Скрыть QR" : "Пригласить"}
						</button>
						<a
							href="/rooms"
							style={{
								padding: "0.75rem 1.5rem",
								border: "2px solid rgba(139, 92, 246, 0.3)",
								borderRadius: "12px",
								textDecoration: "none",
								color: "#8b5cf6",
								backgroundColor: "rgba(139, 92, 246, 0.05)",
							}}
						>
							← Назад
						</a>
						{isOwner && (
							<button
								type="button"
								onClick={handleDeleteRoom}
								style={{
									padding: "0.75rem 1.5rem",
									border: "2px solid rgba(239, 68, 68, 0.3)",
									borderRadius: "12px",
									backgroundColor: "rgba(239, 68, 68, 0.1)",
									color: "#ef4444",
									cursor: "pointer",
								}}
							>
								🗑 Удалить
							</button>
						)}
					</div>
				</div>

				{showQRCode && (
					<div
						style={{
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							borderRadius: "16px",
							padding: "2rem",
							marginBottom: "2rem",
							textAlign: "center",
						}}
					>
						<h3 style={{ color: "#1f2937", marginBottom: "1rem" }}>
							Сканируйте QR-код для входа в комнату
						</h3>
						<div
							style={{
								display: "inline-block",
								padding: "1rem",
								backgroundColor: "white",
								borderRadius: "12px",
								marginBottom: "1rem",
							}}
						>
							<QRCodeSVG value={roomUrl} size={200} level="M" includeMargin />
						</div>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								justifyContent: "center",
								alignItems: "center",
								flexWrap: "wrap",
							}}
						>
							<code
								style={{
									backgroundColor: "#f3f4f6",
									padding: "0.5rem 1rem",
									borderRadius: "8px",
									fontSize: "0.85rem",
									color: "#374151",
									wordBreak: "break-all",
								}}
							>
								{roomUrl}
							</code>
							<button
								type="button"
								onClick={() => {
									void navigator.clipboard.writeText(roomUrl);
									alert("Ссылка скопирована!");
								}}
								style={{
									padding: "0.5rem 1rem",
									backgroundColor: "#8b5cf6",
									color: "white",
									border: "none",
									borderRadius: "8px",
									cursor: "pointer",
								}}
							>
								Копировать
							</button>
						</div>
					</div>
				)}

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
						gap: "1.5rem",
					}}
				>
					<div
						style={{
							gridColumn: "span 2",
							borderRadius: "16px",
							padding: "2rem",
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							backdropFilter: "blur(10px)",
							minHeight: "400px",
						}}
					>
						<h2 style={{ color: "#e2e8f0", marginBottom: "1.5rem" }}>
							🎶 Музыкальный плеер
						</h2>
						<MusicPlayer
							roomId={roomId}
							isDemoMode={isDemoMode}
							roomParticipants={room.room_participants}
							roomOwnerId={room.owner_id}
						/>
					</div>

					<div
						style={{
							border: "2px solid rgba(139, 92, 246, 0.2)",
							borderRadius: "16px",
							padding: "1.5rem",
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							backdropFilter: "blur(10px)",
						}}
					>
						<h3 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>
							👥 Участники ({room.room_participants?.length || 0}/
							{room.max_participants})
						</h3>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "0.75rem",
							}}
						>
							{room.room_participants?.map((participant) => (
								<div
									key={participant.id}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.75rem",
										padding: "0.75rem",
										backgroundColor: "rgba(139, 92, 246, 0.1)",
										borderRadius: "8px",
									}}
								>
									<span style={{ fontSize: "1.5rem" }}>
										{participant.profiles?.avatar_url || "👤"}
									</span>
									<div>
										<p style={{ color: "#e2e8f0", margin: 0 }}>
											{participant.profiles?.username || "Неизвестно"}
										</p>
										<p
											style={{
												color: "#8b5cf6",
												fontSize: "0.8rem",
												margin: 0,
											}}
										>
											{participant.role === "owner"
												? "👑 Создатель"
												: "👤 Участник"}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{isParticipant ? (
						showChat ? (
							<div
								style={{
									border: "2px solid rgba(139, 92, 246, 0.2)",
									borderRadius: "16px",
									padding: "1.5rem",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									backdropFilter: "blur(10px)",
									minHeight: "400px",
								}}
							>
								<Chat roomId={roomId} isOpen />
							</div>
						) : (
							<button
								type="button"
								onClick={() => setShowChat(true)}
								style={{
									border: "2px solid rgba(139, 92, 246, 0.2)",
									borderRadius: "16px",
									padding: "1.5rem",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									backdropFilter: "blur(10px)",
									minHeight: "100px",
									cursor: "pointer",
									color: "#8b5cf6",
									fontSize: "1.1rem",
								}}
							>
								💬 Открыть чат
							</button>
						)
					) : (
						<div
							style={{
								border: "2px solid rgba(139, 92, 246, 0.2)",
								borderRadius: "16px",
								padding: "1.5rem",
								backgroundColor: "rgba(255, 255, 255, 0.05)",
								backdropFilter: "blur(10px)",
								textAlign: "center",
								color: "#a1a1aa",
							}}
						>
							🔒 Присоединитесь к комнате, чтобы видеть чат
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
