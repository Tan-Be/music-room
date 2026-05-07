"use client";

import { useEffect, useState } from "react";
import { AnimatedBackground } from "@/components/common/animated-background";
import { getUserDisplayName, useAuth } from "@/lib/auth-context";
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

interface PublicRoomRecord {
  id: string;
  name: string;
  description: string | null;
  room_participants?: unknown[] | null;
  is_public: boolean;
  profiles?: { username?: string | null } | null;
  created_at: string;
}

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoReason, setDemoReason] = useState<string | null>(null);
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial room load should run once on mount.
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
      setDemoReason(null);

      // Проверяем, настроен ли Supabase
      if (!isSupabaseConfigured()) {
        setIsDemoMode(true);
        setDemoReason(
          "NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY не загружены в клиент.",
        );
        loadDemoRooms();
        return;
      }

      // Пробуем загрузить из Supabase
      let data: PublicRoomRecord[];
      try {
        data = await roomsApi.getPublicRooms();
      } catch (supabaseError) {
        setIsDemoMode(true);
        setDemoReason(
          supabaseError instanceof Error
            ? supabaseError.message
            : "Не удалось загрузить комнаты из Supabase.",
        );
        loadDemoRooms();
        return;
      }

      // Преобразуем данные в нужный формат
      const formattedRooms: Room[] = data.map((room) => ({
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
    } catch (error) {
      setIsDemoMode(true);
      setDemoReason(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить комнаты из Supabase.",
      );
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

    if (!user) {
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
        owner_id: user.id,
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
        owner: getUserDisplayName(user),
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
                {demoReason
                  ? `Не удалось работать с Supabase: ${demoReason}`
                  : "Supabase недоступен. Данные сохраняются только локально."}
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
            type="button"
            onClick={() => setShowCreateDialog(true)}
            disabled={!user}
            className="btn btn-primary btn-lg"
          >
            {user ? "✨ Создать комнату" : "🔒 Войдите для создания"}
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
            {user && (
              <button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                className="btn btn-primary btn-lg"
              >
                ✨ Создать первую комнату
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            {getSortedRooms().map((room, index) => {
              const cardGradients = [
                "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
                "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                "linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)",
              ];
              const gradient = cardGradients[index % cardGradients.length];
              const medalIcon =
                index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : null;
              const isOwner = getUserDisplayName(user) === room.owner;

              return (
                // biome-ignore lint/a11y/useSemanticElements: card contains nested interactive buttons — button-in-button is invalid HTML
                <div
                  role="button"
                  tabIndex={0}
                  key={room.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    overflow: "hidden",
                    background: "rgba(15, 15, 30, 0.7)",
                    border: "1.5px solid rgba(139, 92, 246, 0.18)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                    cursor: "pointer",
                    transition:
                      "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 50px rgba(139, 92, 246, 0.35)";
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 32px rgba(0,0,0,0.35)";
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.18)";
                  }}
                  onClick={() => (window.location.href = `/room/${room.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      window.location.href = `/room/${room.id}`;
                    }
                  }}
                >
                  {/* Card cover */}
                  <div
                    style={{
                      background: gradient,
                      height: "90px",
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                    }}
                  >
                    {/* Medal / rank */}
                    <div style={{ fontSize: "1.6rem", lineHeight: 1 }}>
                      {medalIcon ?? (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.7)",
                            background: "rgba(0,0,0,0.25)",
                            borderRadius: "20px",
                            padding: "0.2rem 0.55rem",
                            letterSpacing: "0.03em",
                          }}
                        >
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Top-right badges */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.9)",
                          background: room.is_public
                            ? "rgba(34,197,94,0.35)"
                            : "rgba(239,68,68,0.35)",
                          border: `1px solid ${room.is_public ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"}`,
                          borderRadius: "20px",
                          padding: "0.2rem 0.6rem",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {room.is_public ? "🌍 Публичная" : "🔒 Приватная"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room.id, room.name);
                        }}
                        title="Удалить комнату"
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "8px",
                          color: "rgba(255,255,255,0.7)",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(239,68,68,0.5)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(0,0,0,0.3)";
                          e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                        }}
                      >
                        🗑
                      </button>
                    </div>

                    {/* Music icon watermark */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-18px",
                        left: "1.25rem",
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "rgba(15,15,30,0.85)",
                        border: "2px solid rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      🎵
                    </div>
                  </div>

                  {/* Card body */}
                  <div
                    style={{
                      padding: "1.25rem 1.25rem 0",
                      paddingTop: "1.6rem",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "#f1f5f9",
                        margin: "0 0 0.35rem 0",
                        letterSpacing: "0.01em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {room.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#71717a",
                        margin: "0 0 1rem 0",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "2.55rem",
                      }}
                    >
                      {room.description || "Описание отсутствует"}
                    </p>

                    {/* Meta row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        fontSize: "0.82rem",
                        color: "#52525b",
                        marginBottom: "1rem",
                      }}
                    >
                      <span>👥 {room.participants} участников</span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "120px",
                        }}
                      >
                        👑 {room.owner}
                      </span>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div
                    style={{
                      marginTop: "auto",
                      padding: "0.9rem 1.25rem",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    {/* Rating + votes */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "#fbbf24",
                        }}
                      >
                        ⭐ {room.rating || 0}
                      </span>
                      {!isOwner && (
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(room.id, "like");
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.3rem 0.6rem",
                              borderRadius: "7px",
                              border: "none",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "background 0.15s",
                              backgroundColor:
                                userVotes[room.id] === "like"
                                  ? "rgba(34,197,94,0.45)"
                                  : "rgba(34,197,94,0.15)",
                              color: "#4ade80",
                            }}
                          >
                            👍 {room.likes || 0}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(room.id, "dislike");
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.3rem 0.6rem",
                              borderRadius: "7px",
                              border: "none",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "background 0.15s",
                              backgroundColor:
                                userVotes[room.id] === "dislike"
                                  ? "rgba(239,68,68,0.45)"
                                  : "rgba(239,68,68,0.15)",
                              color: "#f87171",
                            }}
                          >
                            👎 {room.dislikes || 0}
                          </button>
                        </div>
                      )}
                      {isOwner && (
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "#f59e0b",
                            fontWeight: 600,
                          }}
                        >
                          👑 Ваша
                        </span>
                      )}
                    </div>

                    {/* Join button */}
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/room/${room.id}`;
                      }}
                    >
                      Войти →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to Home */}
        <div style={{ textAlign: "center" }}>
          <a href="/" className="btn btn-outline">
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
                htmlFor="room-name"
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
                id="room-name"
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
                htmlFor="room-description"
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
                id="room-description"
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
                type="button"
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={creating}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {creating ? "Создание..." : "Создать комнату"}
              </button>
            </div>
          </div>
        </div>
      )}

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
