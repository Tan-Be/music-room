import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import {
	createDeterministicProfileId,
	ensureGitHubProfile,
} from "@/lib/supabase-admin";

const githubClientId = process.env.GITHUB_CLIENT_ID || "";
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || "";

const handler = NextAuth({
	providers: [
		GitHubProvider({
			clientId: githubClientId,
			clientSecret: githubClientSecret,
		}),
	],
	callbacks: {
		async jwt({ token, account, profile }) {
			if (account) {
				token.accessToken = account.access_token;

				const providerAccountId =
					account.providerAccountId ||
					String((profile as { id?: string })?.id || "");
				const providerProfile = profile as {
					login?: string;
					name?: string;
					avatar_url?: string;
				} | null;

				if (providerAccountId) {
					token.id = createDeterministicProfileId("github", providerAccountId);

					try {
						const profileId = await ensureGitHubProfile({
							providerAccountId,
							username: providerProfile?.login || providerProfile?.name,
							avatarUrl: providerProfile?.avatar_url,
						});

						token.id = profileId || token.id;
					} catch (error) {
						console.error(
							"Failed to sync GitHub profile with Supabase:",
							error,
						);
					}
				}
			}
			return token;
		},
		async session({ session, token }) {
			(session as { accessToken?: string }).accessToken = token.accessToken as
				| string
				| undefined;

			if (session.user) {
				(session.user as { id?: string }).id =
					typeof token.id === "string" ? token.id : undefined;
			}

			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
	},
});

export { handler as GET, handler as POST };
