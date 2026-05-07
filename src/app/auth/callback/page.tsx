"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnimatedBackground } from "@/components/common/animated-background";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
	const router = useRouter();

	useEffect(() => {
		void supabase.auth.getSession().finally(() => {
			router.replace("/");
		});
	}, [router]);

	return (
		<main style={{ position: "relative", minHeight: "100vh", padding: "2rem" }}>
			<AnimatedBackground />
			<div
				style={{
					position: "relative",
					zIndex: 10,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					color: "#e2e8f0",
					fontSize: "1.2rem",
				}}
			>
				Завершаем вход через GitHub...
			</div>
		</main>
	);
}
