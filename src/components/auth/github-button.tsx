"use client";

import { useState } from "react";
import { getUserDisplayName, useAuth } from "@/lib/auth-context";

interface GitHubButtonProps {
  mode: "login" | "register";
  className?: string;
}

const GitHubIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export function GitHubButton({ mode, className = "" }: GitHubButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, signInWithGitHub } = useAuth();

  const isGitHubConfigured =
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID &&
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID !== "demo_client_id";

  const handleGitHubAuth = async () => {
    if (!isGitHubConfigured) {
      alert("GitHub OAuth не настроен. Создайте GitHub OAuth приложение.");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error("GitHub auth error:", error);
      alert("Ошибка при подключении к GitHub");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div
        className="badge badge-green"
        style={{
          padding: "0.6rem 1rem",
          fontSize: "0.9rem",
          borderRadius: "10px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        ✅ Вы вошли как {getUserDisplayName(user)}
      </div>
    );
  }

  if (!isGitHubConfigured) {
    return (
      <div
        className="badge badge-yellow"
        style={{
          padding: "0.6rem 1rem",
          fontSize: "0.85rem",
          borderRadius: "10px",
          width: "100%",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <span>⚠️ GitHub OAuth требует настройки</span>
        <span style={{ color: "#a1a1aa", fontSize: "0.78rem" }}>
          Создайте GitHub OAuth App для активации
        </span>
      </div>
    );
  }

  const buttonText =
    mode === "login" ? "Войти через GitHub" : "Зарегистрироваться через GitHub";

  return (
    <button
      type="button"
      onClick={handleGitHubAuth}
      disabled={isLoading}
      className={`btn btn-github btn-lg ${className}`}
      style={{ width: "100%" }}
      aria-label={buttonText}
    >
      {isLoading ? (
        <>
          <span className="spinner" />
          <span>Подключение...</span>
        </>
      ) : (
        <>
          <GitHubIcon />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
