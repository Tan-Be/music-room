"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface Message {
	id: string;
	room_id: string;
	user_id: string;
	message: string;
	created_at: string;
	profiles?: {
		username: string;
		avatar_url: string | null;
	};
}

interface ChatProps {
	roomId: string;
	isOpen?: boolean;
}

export function Chat({ roomId, isOpen = true }: ChatProps) {
	const { data: session } = useSession();
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [visible] = useState(isOpen);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: subscription depends only on room id in this component lifecycle.
	useEffect(() => {
		if (!roomId || !isSupabaseConfigured()) {
			return;
		}

		void loadMessages();

		const channel = supabase
			.channel(`chat:${roomId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "chat_messages",
					filter: `room_id=eq.${roomId}`,
				},
				() => {
					void loadMessages(false);
				},
			)
			.subscribe();

		return () => {
			void supabase.removeChannel(channel);
		};
	}, [roomId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: effect intentionally runs after message list updates.
	useEffect(() => {
		const chatContainer = messagesEndRef.current?.parentElement;
		if (!chatContainer) return;

		const isAtBottom =
			chatContainer.scrollHeight - chatContainer.scrollTop <=
			chatContainer.clientHeight + 100;
		if (isAtBottom) {
			messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
		}
	}, [messages]);

	const loadMessages = async (showLoading = true) => {
		if (!roomId || !isSupabaseConfigured()) return;

		try {
			if (showLoading) setLoading(true);

			const response = await fetch(`/api/chat?roomId=${roomId}&limit=50`);
			const data = (await response.json()) as { messages?: Message[] };

			if (data.messages) {
				setMessages(data.messages);
			}
		} catch (error) {
			console.error("Failed to load messages:", error);
		} finally {
			if (showLoading) setLoading(false);
		}
	};

	const sendMessage = async () => {
		if (!newMessage.trim() || !session?.user) return;

		const userId = (session.user as { id?: string }).id;
		if (!userId) return;

		try {
			setSending(true);

			await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					roomId,
					userId,
					message: newMessage,
				}),
			});

			setNewMessage("");
		} catch (error) {
			console.error("Failed to send message:", error);
		} finally {
			setSending(false);
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void sendMessage();
		}
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (!visible) {
		return null;
	}

	if (!isSupabaseConfigured()) {
		return (
			<div
				style={{
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "#a1a1aa",
					fontSize: "0.9rem",
				}}
			>
				Чат недоступен (Supabase не настроен)
			</div>
		);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				backgroundColor: "rgba(30, 30, 30, 0.8)",
				borderRadius: "12px",
				border: "1px solid rgba(139, 92, 246, 0.2)",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					padding: "0.75rem 1rem",
					borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
					backgroundColor: "rgba(139, 92, 246, 0.1)",
				}}
			>
				<h3
					style={{
						margin: 0,
						color: "#e2e8f0",
						fontSize: "1rem",
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					💬 Чат
					<span
						style={{
							color: "#86efac",
							fontSize: "0.75rem",
							backgroundColor: "rgba(34, 197, 94, 0.14)",
							borderRadius: "999px",
							padding: "0.2rem 0.55rem",
						}}
					>
						realtime
					</span>
				</h3>
			</div>

			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "1rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.5rem",
				}}
			>
				{loading ? (
					<div
						style={{ textAlign: "center", color: "#a1a1aa", padding: "2rem" }}
					>
						Загрузка сообщений...
					</div>
				) : messages.length === 0 ? (
					<div
						style={{
							textAlign: "center",
							color: "#a1a1aa",
							padding: "2rem",
							fontSize: "0.9rem",
						}}
					>
						Пока нет сообщений. Будьте первым!
					</div>
				) : (
					messages.map((message) => {
						const isOwnMessage =
							session?.user &&
							(session.user as { id?: string }).id === message.user_id;

						return (
							<div
								key={message.id}
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: isOwnMessage ? "flex-end" : "flex-start",
									gap: "0.25rem",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.5rem",
										marginBottom: "0.25rem",
									}}
								>
									<span
										style={{
											color: "#8b5cf6",
											fontSize: "0.8rem",
											fontWeight: "bold",
										}}
									>
										{message.profiles?.username || "Пользователь"}
									</span>
									<span style={{ color: "#6b7280", fontSize: "0.7rem" }}>
										{formatTime(message.created_at)}
									</span>
								</div>
								<div
									style={{
										maxWidth: "80%",
										padding: "0.5rem 0.75rem",
										borderRadius: "12px",
										backgroundColor: isOwnMessage
											? "rgba(139, 92, 246, 0.3)"
											: "rgba(255, 255, 255, 0.1)",
										color: "#e2e8f0",
										fontSize: "0.9rem",
										wordBreak: "break-word",
									}}
								>
									{message.message}
								</div>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			{session ? (
				<div
					style={{
						padding: "0.75rem",
						borderTop: "1px solid rgba(139, 92, 246, 0.2)",
						display: "flex",
						gap: "0.5rem",
					}}
				>
					<input
						type="text"
						value={newMessage}
						onChange={(event) => setNewMessage(event.target.value)}
						onKeyDown={handleKeyPress}
						placeholder="Введите сообщение..."
						disabled={sending}
						style={{
							flex: 1,
							padding: "0.5rem 0.75rem",
							borderRadius: "8px",
							border: "1px solid rgba(139, 92, 246, 0.3)",
							backgroundColor: "rgba(255, 255, 255, 0.1)",
							color: "#e2e8f0",
							fontSize: "0.9rem",
							outline: "none",
						}}
					/>
					<button
						type="button"
						onClick={() => void sendMessage()}
						disabled={sending || !newMessage.trim()}
						style={{
							padding: "0.5rem 1rem",
							borderRadius: "8px",
							border: "none",
							backgroundColor:
								sending || !newMessage.trim()
									? "rgba(139, 92, 246, 0.3)"
									: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
							color: "white",
							cursor: sending || !newMessage.trim() ? "not-allowed" : "pointer",
							fontSize: "0.9rem",
							transition: "all 0.2s ease",
						}}
					>
						{sending ? "..." : "→"}
					</button>
				</div>
			) : (
				<div
					style={{
						padding: "0.75rem",
						borderTop: "1px solid rgba(139, 92, 246, 0.2)",
						textAlign: "center",
						color: "#a1a1aa",
						fontSize: "0.85rem",
					}}
				>
					Войдите, чтобы писать в чат
				</div>
			)}
		</div>
	);
}
