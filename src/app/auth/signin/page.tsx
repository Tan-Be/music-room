"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GitHubButton } from "@/components/auth/github-button";
import { AnimatedBackground } from "@/components/common/animated-background";
import { useAuth } from "@/lib/auth-context";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.push("/");
      return;
    }
    setIsLoading(false);
  }, [loading, router, user]);

  if (isLoading) {
    return (
      <main style={{ position: "relative", minHeight: "100vh" }}>
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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              color: "#e2e8f0",
            }}
          >
            <span className="spinner spinner-lg" style={{ color: "#8b5cf6" }} />
            <span style={{ fontSize: "1.1rem" }}>Загрузка...</span>
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "2.5rem 2rem",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "24px",
                padding: "3px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "22px",
                  overflow: "hidden",
                  backgroundColor: "rgba(15, 23, 42, 0.96)",
                }}
              >
                <Image
                  src="/music-room-logo.jpg"
                  alt="Music Room"
                  width={90}
                  height={90}
                  priority
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>

          <h1
            style={{
              fontSize: "1.85rem",
              marginBottom: "0.4rem",
              color: "#e2e8f0",
              fontWeight: 700,
            }}
          >
            Вход в Music Room
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              marginBottom: "2rem",
              color: "#71717a",
            }}
          >
            Войдите в аккаунт для доступа к музыкальным комнатам
          </p>

          <GitHubButton mode="login" />

          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                color: "#71717a",
                fontSize: "0.88rem",
                marginBottom: "1rem",
              }}
            >
              Нет аккаунта?
            </p>
            <a
              href="/register"
              className="btn btn-secondary"
              style={{ width: "100%" }}
            >
              Зарегистрироваться
            </a>
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <a href="/" className="btn btn-ghost btn-sm">
              ← На главную
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
