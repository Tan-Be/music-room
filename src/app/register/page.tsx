"use client";

import { AnimatedBackground } from "@/components/common/animated-background";
import { GitHubButton } from "@/components/auth/github-button";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    const newErrors: string[] = [];
    if (formData.username.length < 3)
      newErrors.push("Имя пользователя должно содержать минимум 3 символа");
    if (formData.password.length < 6)
      newErrors.push("Пароль должен содержать минимум 6 символов");
    if (formData.password !== formData.confirmPassword)
      newErrors.push("Пароли не совпадают");
    if (!formData.email.includes("@"))
      newErrors.push("Введите корректный email адрес");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Регистрация:", formData);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch {
      setErrors(["Произошла ошибка при регистрации. Попробуйте еще раз."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
            maxWidth: "440px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            border: "1.5px solid rgba(34, 197, 94, 0.2)",
          }}
        >
          <h1
            style={{
              fontSize: "1.85rem",
              marginBottom: "0.4rem",
              color: "#22c55e",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            ✨ Регистрация
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              marginBottom: "1.75rem",
              color: "#71717a",
              textAlign: "center",
            }}
          >
            Создайте аккаунт для Music Room
          </p>

          {errors.length > 0 && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1.5px solid rgba(239,68,68,0.25)",
                borderRadius: "10px",
                padding: "0.9rem 1rem",
                marginBottom: "1.25rem",
              }}
            >
              {errors.map((error, i) => (
                <p
                  key={i}
                  style={{
                    color: "#ef4444",
                    fontSize: "0.88rem",
                    margin: "0.2rem 0",
                  }}
                >
                  • {error}
                </p>
              ))}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1.5px solid rgba(34,197,94,0.25)",
                borderRadius: "10px",
                padding: "0.9rem 1rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#22c55e", fontWeight: 600, margin: 0 }}>
                ✅ Аккаунт успешно создан!
              </p>
              <p
                style={{
                  color: "#71717a",
                  fontSize: "0.88rem",
                  margin: "0.4rem 0 0",
                }}
              >
                Перенаправляем на страницу входа...
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {[
              { label: "Имя пользователя", name: "username", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Пароль", name: "password", type: "password" },
              {
                label: "Подтвердите пароль",
                name: "confirmPassword",
                type: "password",
              },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.4rem",
                    color: "#a1a1aa",
                    fontSize: "0.88rem",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name as keyof typeof formData]}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading || success}
              className="btn btn-success btn-lg"
              style={{ marginTop: "0.5rem", width: "100%" }}
            >
              {isLoading && <span className="spinner" />}
              {isLoading
                ? "Создаем аккаунт..."
                : success
                  ? "Аккаунт создан!"
                  : "Создать аккаунт"}
            </button>
          </form>

          <div
            style={{
              marginTop: "1.75rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                color: "#71717a",
                fontSize: "0.88rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Или зарегистрируйтесь через GitHub
            </p>
            <GitHubButton mode="register" />
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <a
              href="/login"
              className="btn btn-ghost"
              style={{ width: "100%", maxWidth: "220px" }}
            >
              Уже есть аккаунт? Войти
            </a>
            <a href="/" className="btn btn-ghost btn-sm">
              ← На главную
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
