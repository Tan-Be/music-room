"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AnimatedBackground } from "@/components/common/animated-background";
import { isSupabaseConfigured, roomsApi, supabase } from "@/lib/supabase";

interface Room {
	id: string;
	name: string;
	description: string | null;
	participants: number;
	is_public: boolean;
	owner: string;
	created_at: string;
	rating?: number;
	likes?: number;
	dislikes?: number;
}

export default function RoomsPage() {
	const { data: session } = useSession();
	const [rooms, setRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [creating, setCreating] = useState(false);
	const [isDemoMode, setIsDemoMode] = useState(false);
	const [userVotes, setUserVotes] = useState<
		Record<string, "like" | "dislike">
	>({});
	const [newRoom, setNewRoom] = useState({
		name: "",
		description: "",
		is_public: true,
		password: "",
	});

	const rememberOwnedRoom = (roomId: string) => {
		const savedOwnedRoomIds = localStorage.getItem("ownedRoomIds");

		try {
			const ownedRoomIds = savedOwnedRoomIds
				? JSON.parse(savedOwnedRoomIds)
				: [];
			const nextOwnedRoomIds = Array.isArray(ownedRoomIds)
				? Array.from(new Set([...ownedRoomIds, roomId]))
				: [roomId];

			localStorage.setItem("ownedRoomIds", JSON.stringify(nextOwnedRoomIds));
		} catch (error) {
			console.error("Ошибка сохранения ownedRoomIds:", error);
			localStorage.setItem("ownedRoomIds", JSON.stringify([roomId]));
		}
	};

	// Загрузка комнат и голосов при монтировании компонента
	useEffect(() => {
		// Загружаем голоса пользователя
		const savedVotes = localStorage.getItem("userVotes");
		if (savedVotes) {
			try {
				setUserVotes(JSON.parse(savedVotes));
			} catch (e) {
				console.error("Ошибка загрузки голосов:", e);
			}
		}

		// Проверяем localStorage для демо-режима
		const savedRooms = localStorage.getItem("demoRooms");
		if (savedRooms && !isSupabaseConfigured()) {
			try {
				const parsed = JSON.parse(savedRooms);
				setRooms(parsed);
				setIsDemoMode(true);
				setLoading(false);
				return;
			} catch (e) {
				console.error("Ошибка загрузки из localStorage:", e);
			}
		}
		loadRooms();
	}, []);

	const loadRooms = async () => {
		try {
			setLoading(true);
			setIsDemoMode(false);

			// Проверяем, настроен ли Supabase
			if (!isSupabaseConfigured()) {
				setIsDemoMode(true);
				loadDemoRooms();
				return;
			}

			// Пробуем загрузить из Supabase
			let data;
			try {
				data = await roomsApi.getPublicRooms();
			} catch (supabaseError: any) {
				setIsDemoMode(true);
				loadDemoRooms();
				return;
			}

			// Преобразуем данные в нужный формат
			const formattedRooms: Room[] = data.map((room: any) => ({
				id: room.id,
				name: room.name,
				description: room.description,
				participants: room.room_participants?.length || 0,
				is_public: room.is_public,
				owner: room.profiles?.username || "Неизвестно",
				created_at: room.created_at,
			}));

			setRooms(formattedRooms);
			setLoading(false);
		} catch (error: any) {
			setIsDemoMode(true);
			loadDemoRooms();
		}
	};

	const loadDemoRooms = () => {
		// Начинаем с пустого списка - пользователь создаст свои комнаты
		setRooms([]);
		setLoading(false);
	};

	// Функция голосования
	const handleVote = (roomId: string, voteType: "like" | "dislike") => {
		const currentVote = userVotes[roomId];

		setRooms((prevRooms) => {
			const updatedRooms = prevRooms.map((room) => {
				if (room.id !== roomId) return room;

				let newLikes = room.likes || 0;
				let newDislikes = room.dislikes || 0;

				// Если уже голосовали - убираем предыдущий голос
				if (currentVote === "like") {
					newLikes = Math.max(0, newLikes - 1);
				} else if (currentVote === "dislike") {
					newDislikes = Math.max(0, newDislikes - 1);
				}

				// Добавляем новый голос
				if (currentVote !== voteType) {
					if (voteType === "like") {
						newLikes += 1;
					} else {
						newDislikes += 1;
					}
				}

				return {
					...room,
					likes: newLikes,
					dislikes: newDislikes,
					rating: newLikes - newDislikes,
				};
			});

			// Сохраняем в localStorage
			if (isDemoMode) {
				localStorage.setItem("demoRooms", JSON.stringify(updatedRooms));
			}

			return updatedRooms;
		});

		// Обновляем голоса пользователя
		const newVotes = { ...userVotes };
		if (currentVote === voteType) {
			delete newVotes[roomId]; // Убираем голос если кликнули тот же
		} else {
			newVotes[roomId] = voteType;
		}
		setUserVotes(newVotes);
		localStorage.setItem("userVotes", JSON.stringify(newVotes));
	};

	// Сортировка комнат по рейтингу (по убыванию)
	const getSortedRooms = () => {
		return [...rooms].sort((a, b) => (b.rating || 0) - (a.rating || 0));
	};

	// Удаление комнаты
	const handleDeleteRoom = async (roomId: string, roomName: string) => {
		if (confirm(`Вы уверены, что хотите удалить комнату "${roomName}"?`)) {
			// Удаляем из Supabase если настроен
			if (isSupabaseConfigured() && !isDemoMode) {
				try {
					await supabase.from("rooms").delete().eq("id", roomId);
				} catch (error) {
					console.error("Failed to delete room:", error);
				}
			}

			const updatedRooms = rooms.filter((room) => room.id !== roomId);
			setRooms(updatedRooms);

			// Удаляем из localStorage
			if (isDemoMode) {
				localStorage.setItem("demoRooms", JSON.stringify(updatedRooms));
			}

			// Удаляем голоса пользователя за эту комнату
			const newVotes = { ...userVotes };
			delete newVotes[roomId];
			setUserVotes(newVotes);
			localStorage.setItem("userVotes", JSON.stringify(newVotes));
		}
	};

	const handleCreateRoom = async () => {
		if (!newRoom.name.trim()) {
			alert("Введите название комнаты");
			return;
		}

		if (!session?.user) {
			alert("Необходимо войти в систему для создания комнаты");
			return;
		}

		try {
			setCreating(true);

			const roomData = {
				name: newRoom.name,
				description: newRoom.description || undefined,
				is_public: newRoom.is_public,
				password: newRoom.password || undefined,
				owner_id: (session.user as any).id || "demo-user",
			};

			const createdRoom = await roomsApi.createRoom(roomData);

			// Обновляем список комнат
			await loadRooms();

			// Очищаем форму
			setNewRoom({ name: "", description: "", is_public: true, password: "" });
			setShowCreateDialog(false);
			rememberOwnedRoom(createdRoom.id);

			// Переход в созданную комнату
			window.location.href = `/room/${createdRoom.id}?owner=1`;
		} catch (error) {
			console.error("Ошибка создания комнаты:", error);

			// Fallback - создаем комнату локально
			const room: Room = {
				id: Date.now().toString(),
				name: newRoom.name,
				description: newRoom.description,
				participants: 1,
				is_public: newRoom.is_public,
				owner: session.user?.name || "Вы",
				rating: 0,
				likes: 0,
				dislikes: 0,
				created_at: new Date().toISOString(),
			};

			const updatedRooms = [room, ...rooms];
			setRooms(updatedRooms);

			// Сохраняем в localStorage для демо-режима
			if (isDemoMode) {
				localStorage.setItem("demoRooms", JSON.stringify(updatedRooms));
			}
			rememberOwnedRoom(room.id);

			setNewRoom({ name: "", description: "", is_public: true, password: "" });
			setShowCreateDialog(false);

			// Переход в созданную комнату
			window.location.href = `/room/${room.id}?owner=1`;
		} finally {
			setCreating(false);
		}
	};

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
					<div
						style={{
							textAlign: "center",
							color: "#e2e8f0",
						}}
					>
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
						<p style={{ fontSize: "1.2rem" }}>Загрузка комнат...</p>
					</div>
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
				{/* Demo Mode Banner */}
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
									fontSize: "1rem",
								}}
							>
								Демо-режим
							</p>
							<p
								style={{
									color: "#d97706",
									margin: 0,
									fontSize: "0.9rem",
								}}
							>
								Supabase не подключен. Данные сохраняются только локально.
							</p>
						</div>
					</div>
				)}

				{/* Header */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
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
							🎵 Музыкальные комнаты
						</h1>
						<p
							style={{
								fontSize: "1.1rem",
								color: "#a1a1aa",
							}}
						>
							Найдите комнату или создайте свою • {rooms.length} комнат доступно
						</p>
					</div>

					<button
						onClick={() => setShowCreateDialog(true)}
						disabled={!session}
						style={{
							background: session
								? "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)"
								: "rgba(107, 114, 128, 0.5)",
							color: "white",
							border: "none",
							padding: "1rem 2rem",
							borderRadius: "12px",
							fontSize: "1.1rem",
							cursor: session ? "pointer" : "not-allowed",
							boxShadow: session
								? "0 8px 25px rgba(139, 92, 246, 0.4)"
								: "none",
							transition: "all 0.3s ease",
							opacity: session ? 1 : 0.6,
						}}
						onMouseEnter={(e) => {
							if (session) {
								e.currentTarget.style.transform = "translateY(-3px)";
								e.currentTarget.style.boxShadow =
									"0 12px 35px rgba(139, 92, 246, 0.6)";
							}
						}}
						onMouseLeave={(e) => {
							if (session) {
								e.currentTarget.style.transform = "translateY(0)";
								e.currentTarget.style.boxShadow =
									"0 8px 25px rgba(139, 92, 246, 0.4)";
							}
						}}
					>
						{session ? "✨ Создать комнату" : "🔒 Войдите для создания"}
					</button>
				</div>

				{/* Rating Header */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
						backgroundColor: "rgba(139, 92, 246, 0.1)",
						padding: "0.75rem 1.5rem",
						borderRadius: "20px",
						border: "1px solid rgba(139, 92, 246, 0.3)",
						marginBottom: "1.5rem",
						width: "fit-content",
					}}
				>
					<span style={{ fontSize: "1.2rem" }}>🏆</span>
					<span style={{ color: "#e2e8f0", fontWeight: "bold" }}>
						Рейтинговое соревнование по популярности
					</span>
				</div>

				{/* Rooms Grid */}
				{rooms.length === 0 ? (
					<div
						style={{
							textAlign: "center",
							padding: "4rem 2rem",
							backgroundColor: "rgba(255, 255, 255, 0.05)",
							backdropFilter: "blur(10px)",
							border: "2px solid rgba(139, 92, 246, 0.2)",
							borderRadius: "16px",
						}}
					>
						<h3
							style={{
								color: "#8b5cf6",
								fontSize: "1.5rem",
								marginBottom: "1rem",
							}}
						>
							🎵 Пока нет активных комнат
						</h3>
						<p style={{ color: "#a1a1aa", marginBottom: "2rem" }}>
							Станьте первым, кто создаст музыкальную комнату!
						</p>
						{session && (
							<button
								onClick={() => setShowCreateDialog(true)}
								style={{
									background:
										"linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
									color: "white",
									border: "none",
									padding: "1rem 2rem",
									borderRadius: "12px",
									fontSize: "1.1rem",
									cursor: "pointer",
									boxShadow: "0 8px 25px rgba(139, 92, 246, 0.4)",
								}}
							>
								✨ Создать первую комнату
							</button>
						)}
					</div>
				) : (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
							gap: "1.5rem",
							marginBottom: "2rem",
						}}
					>
						{getSortedRooms().map((room, index) => (
							<div
								key={room.id}
								style={{
									border: "2px solid rgba(139, 92, 246, 0.2)",
									borderRadius: "16px",
									padding: "1.5rem",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									backdropFilter: "blur(10px)",
									boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
									cursor: "pointer",
									transition: "all 0.3s ease",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform =
										"translateY(-5px) scale(1.02)";
									e.currentTarget.style.boxShadow =
										"0 15px 45px rgba(139, 92, 246, 0.4)";
									e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.6)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = "translateY(0) scale(1)";
									e.currentTarget.style.boxShadow =
										"0 8px 32px rgba(0,0,0,0.3)";
									e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)";
								}}
								onClick={() => (window.location.href = `/room/${room.id}`)}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
										marginBottom: "1rem",
									}}
								>
									<h3
										style={{
											fontSize: "1.4rem",
											color: "#e2e8f0",
											margin: 0,
										}}
									>
										{room.name}
									</h3>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "0.5rem",
										}}
									>
										<div
											style={{
												padding: "0.25rem 0.75rem",
												borderRadius: "20px",
												fontSize: "0.8rem",
												backgroundColor: room.is_public
													? "rgba(34, 197, 94, 0.2)"
													: "rgba(239, 68, 68, 0.2)",
												color: room.is_public ? "#22c55e" : "#ef4444",
												border: `1px solid ${room.is_public ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
											}}
										>
											{room.is_public ? "🌍 Публичная" : "🔒 Приватная"}
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteRoom(room.id, room.name);
											}}
											style={{
												padding: "0.25rem 0.5rem",
												backgroundColor: "rgba(239, 68, 68, 0.2)",
												border: "1px solid rgba(239, 68, 68, 0.3)",
												borderRadius: "6px",
												color: "#ef4444",
												cursor: "pointer",
												fontSize: "0.8rem",
											}}
											title="Удалить комнату"
										>
											🗑
										</button>
									</div>
								</div>

								<p
									style={{
										color: "#a1a1aa",
										marginBottom: "1rem",
										lineHeight: "1.5",
									}}
								>
									{room.description || "Описание отсутствует"}
								</p>

								{/* Rating & Voting */}
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										marginBottom: "1rem",
										padding: "0.75rem",
										backgroundColor: "rgba(139, 92, 246, 0.1)",
										borderRadius: "12px",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "0.5rem",
										}}
									>
										{index < 3 && (
											<span style={{ fontSize: "1.5rem" }}>
												{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
											</span>
										)}
										<span
											style={{
												color: "#fbbf24",
												fontWeight: "bold",
												fontSize: "1.1rem",
											}}
										>
											⭐ {room.rating || 0}
										</span>
									</div>

									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "0.5rem",
										}}
									>
										{session?.user?.name === room.owner ? (
											<span
												style={{
													padding: "0.5rem 0.75rem",
													color: "#f59e0b",
													fontSize: "0.9rem",
													fontStyle: "italic",
												}}
											>
												👑 Ваша комната
											</span>
										) : (
											<>
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleVote(room.id, "like");
													}}
													style={{
														padding: "0.5rem 0.75rem",
														borderRadius: "8px",
														border: "none",
														backgroundColor:
															userVotes[room.id] === "like"
																? "rgba(34, 197, 94, 0.5)"
																: "rgba(34, 197, 94, 0.2)",
														color: "#22c55e",
														cursor: "pointer",
														fontSize: "1rem",
														display: "flex",
														alignItems: "center",
														gap: "0.25rem",
													}}
												>
													👍 {room.likes || 0}
												</button>

												<button
													onClick={(e) => {
														e.stopPropagation();
														handleVote(room.id, "dislike");
													}}
													style={{
														padding: "0.5rem 0.75rem",
														borderRadius: "8px",
														border: "none",
														backgroundColor:
															userVotes[room.id] === "dislike"
																? "rgba(239, 68, 68, 0.5)"
																: "rgba(239, 68, 68, 0.2)",
														color: "#ef4444",
														cursor: "pointer",
														fontSize: "1rem",
														display: "flex",
														alignItems: "center",
														gap: "0.25rem",
													}}
												>
													👎 {room.dislikes || 0}
												</button>
											</>
										)}
									</div>
								</div>

								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "1rem",
										}}
									>
										<span style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>
											👥 {room.participants} участников
										</span>
										<span style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>
											👑 {room.owner}
										</span>
									</div>

									<button
										style={{
											background:
												"linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
											color: "white",
											border: "none",
											padding: "0.5rem 1.5rem",
											borderRadius: "8px",
											cursor: "pointer",
											fontSize: "0.9rem",
											boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
											transition: "all 0.2s ease",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "translateY(-2px)";
											e.currentTarget.style.boxShadow =
												"0 6px 20px rgba(34, 197, 94, 0.6)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "translateY(0)";
											e.currentTarget.style.boxShadow =
												"0 4px 15px rgba(34, 197, 94, 0.4)";
										}}
										onClick={(e) => {
											e.stopPropagation();
											window.location.href = `/room/${room.id}`;
										}}
									>
										Присоединиться
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Back to Home */}
				<div style={{ textAlign: "center" }}>
					<a
						href="/"
						style={{
							display: "inline-block",
							padding: "1rem 2rem",
							border: "2px solid rgba(139, 92, 246, 0.3)",
							borderRadius: "12px",
							textDecoration: "none",
							color: "#8b5cf6",
							backgroundColor: "rgba(139, 92, 246, 0.05)",
							backdropFilter: "blur(10px)",
							transition: "all 0.3s ease",
							boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-3px)";
							e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.1)";
							e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.6)";
							e.currentTarget.style.boxShadow =
								"0 8px 30px rgba(139, 92, 246, 0.3)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.backgroundColor =
								"rgba(139, 92, 246, 0.05)";
							e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
							e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
						}}
					>
						← Вернуться на главную
					</a>
				</div>
			</div>

			{/* Create Room Dialog */}
			{showCreateDialog && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0, 0, 0, 0.7)",
						backdropFilter: "blur(5px)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
						padding: "2rem",
					}}
				>
					<div
						style={{
							backgroundColor: "rgba(30, 30, 30, 0.95)",
							backdropFilter: "blur(20px)",
							border: "2px solid rgba(139, 92, 246, 0.3)",
							borderRadius: "20px",
							padding: "2rem",
							width: "100%",
							maxWidth: "500px",
							boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
						}}
					>
						<h2
							style={{
								fontSize: "1.8rem",
								marginBottom: "1.5rem",
								color: "#8b5cf6",
								textAlign: "center",
							}}
						>
							✨ Создать новую комнату
						</h2>

						<div style={{ marginBottom: "1.5rem" }}>
							<label
								style={{
									display: "block",
									marginBottom: "0.5rem",
									color: "#e2e8f0",
									fontSize: "1rem",
								}}
							>
								Название комнаты *
							</label>
							<input
								type="text"
								value={newRoom.name}
								onChange={(e) =>
									setNewRoom({ ...newRoom, name: e.target.value })
								}
								placeholder="Например: Chill Vibes"
								style={{
									width: "100%",
									padding: "0.75rem",
									borderRadius: "8px",
									border: "2px solid rgba(139, 92, 246, 0.3)",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									color: "#e2e8f0",
									fontSize: "1rem",
									outline: "none",
									transition: "border-color 0.2s ease",
								}}
								onFocus={(e) => {
									e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.6)";
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
								}}
							/>
						</div>

						<div style={{ marginBottom: "1.5rem" }}>
							<label
								style={{
									display: "block",
									marginBottom: "0.5rem",
									color: "#e2e8f0",
									fontSize: "1rem",
								}}
							>
								Описание
							</label>
							<textarea
								value={newRoom.description}
								onChange={(e) =>
									setNewRoom({ ...newRoom, description: e.target.value })
								}
								placeholder="Расскажите о вашей комнате..."
								rows={3}
								style={{
									width: "100%",
									padding: "0.75rem",
									borderRadius: "8px",
									border: "2px solid rgba(139, 92, 246, 0.3)",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									color: "#e2e8f0",
									fontSize: "1rem",
									outline: "none",
									resize: "vertical",
									transition: "border-color 0.2s ease",
								}}
								onFocus={(e) => {
									e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.6)";
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
								}}
							/>
						</div>

						<div style={{ marginBottom: "2rem" }}>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									color: "#e2e8f0",
									fontSize: "1rem",
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									checked={newRoom.is_public}
									onChange={(e) =>
										setNewRoom({ ...newRoom, is_public: e.target.checked })
									}
									style={{
										width: "18px",
										height: "18px",
										accentColor: "#8b5cf6",
									}}
								/>
								🌍 Публичная комната (видна всем)
							</label>
						</div>

						<div style={{ display: "flex", gap: "1rem" }}>
							<button
								onClick={() => setShowCreateDialog(false)}
								disabled={creating}
								style={{
									flex: 1,
									padding: "0.75rem",
									borderRadius: "8px",
									border: "2px solid rgba(239, 68, 68, 0.3)",
									backgroundColor: "rgba(239, 68, 68, 0.1)",
									color: "#ef4444",
									cursor: creating ? "not-allowed" : "pointer",
									fontSize: "1rem",
									transition: "all 0.2s ease",
									opacity: creating ? 0.6 : 1,
								}}
								onMouseEnter={(e) => {
									if (!creating) {
										e.currentTarget.style.backgroundColor =
											"rgba(239, 68, 68, 0.2)";
										e.currentTarget.style.borderColor =
											"rgba(239, 68, 68, 0.5)";
									}
								}}
								onMouseLeave={(e) => {
									if (!creating) {
										e.currentTarget.style.backgroundColor =
											"rgba(239, 68, 68, 0.1)";
										e.currentTarget.style.borderColor =
											"rgba(239, 68, 68, 0.3)";
									}
								}}
							>
								Отмена
							</button>

							<button
								onClick={handleCreateRoom}
								disabled={creating}
								style={{
									flex: 1,
									padding: "0.75rem",
									borderRadius: "8px",
									border: "none",
									background: creating
										? "rgba(107, 114, 128, 0.5)"
										: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
									color: "white",
									cursor: creating ? "not-allowed" : "pointer",
									fontSize: "1rem",
									boxShadow: creating
										? "none"
										: "0 4px 15px rgba(139, 92, 246, 0.4)",
									transition: "all 0.2s ease",
									opacity: creating ? 0.6 : 1,
								}}
								onMouseEnter={(e) => {
									if (!creating) {
										e.currentTarget.style.transform = "translateY(-2px)";
										e.currentTarget.style.boxShadow =
											"0 6px 20px rgba(139, 92, 246, 0.6)";
									}
								}}
								onMouseLeave={(e) => {
									if (!creating) {
										e.currentTarget.style.transform = "translateY(0)";
										e.currentTarget.style.boxShadow =
											"0 4px 15px rgba(139, 92, 246, 0.4)";
									}
								}}
							>
								{creating ? "Создание..." : "Создать комнату"}
							</button>
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
		</main>
	);
}
