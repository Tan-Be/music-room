"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface RecommendedRoom {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

export function RoomRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedRoom[]>([]);
  const [loading, setLoading] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: recommendations are refreshed when authenticated user changes.
  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userId = user.id;

      const response = await fetch(`/api/recommendations?userId=${userId}`);
      const data = await response.json();

      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (loading) return null;
  if (recommendations.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderRadius: "16px",
        border: "1px solid rgba(139, 92, 246, 0.3)",
      }}
    >
      <h3
        style={{
          color: "#8b5cf6",
          fontSize: "1.2rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        ✨ Рекомендации для вас
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {recommendations.slice(0, 4).map((room) => (
          <button
            type="button"
            key={room.id}
            onClick={() => (window.location.href = `/room/${room.id}`)}
            className="btn btn-secondary"
            style={{
              textAlign: "left",
              padding: "1rem",
              width: "100%",
              display: "block",
            }}
          >
            <h4 style={{ color: "#e2e8f0", margin: "0 0 0.5rem 0" }}>
              {room.name}
            </h4>
            <p
              style={{
                color: "#a1a1aa",
                margin: 0,
                fontSize: "0.9rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {room.description || "Нет описания"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
