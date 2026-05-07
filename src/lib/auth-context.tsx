"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface AuthContextValue {
	user: User | null;
	loading: boolean;
	signInWithGitHub: () => Promise<void>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isSupabaseConfigured()) {
			setLoading(false);
			return;
		}

		let mounted = true;

		void supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return;
			setUser(data.session?.user ?? null);
			setLoading(false);
		});

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);
				setLoading(false);
			},
		);

		return () => {
			mounted = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			loading,
			signInWithGitHub: async () => {
				if (!isSupabaseConfigured()) {
					throw new Error("Supabase не настроен");
				}

				const { error } = await supabase.auth.signInWithOAuth({
					provider: "github",
					options: {
						redirectTo: `${window.location.origin}/auth/callback`,
					},
				});

				if (error) throw error;
			},
			signOut: async () => {
				const { error } = await supabase.auth.signOut();
				if (error) throw error;
				setUser(null);
			},
		}),
		[user, loading],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}

	return context;
}

export function getUserDisplayName(user: User | null) {
	return (
		user?.user_metadata?.user_name ||
		user?.user_metadata?.preferred_username ||
		user?.user_metadata?.name ||
		user?.email ||
		"Пользователь"
	);
}

export function getUserAvatarUrl(user: User | null) {
	return user?.user_metadata?.avatar_url || null;
}
