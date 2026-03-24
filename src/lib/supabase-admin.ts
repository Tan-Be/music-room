import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);

export const supabaseAdmin = isAdminConfigured
	? createClient(supabaseUrl, serviceRoleKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		})
	: null;

const formatUuidFromHex = (hex: string) => {
	const normalized = hex.slice(0, 32).split("");
	normalized[12] = "5";
	normalized[16] = ((parseInt(normalized[16] || "0", 16) & 0x3) | 0x8).toString(
		16,
	);

	return `${normalized.slice(0, 8).join("")}-${normalized.slice(8, 12).join("")}-${normalized.slice(12, 16).join("")}-${normalized.slice(16, 20).join("")}-${normalized.slice(20, 32).join("")}`;
};

const stringToDeterministicHex = (value: string) => {
	const rawHex = Array.from(value)
		.map((character) => character.charCodeAt(0).toString(16).padStart(2, "0"))
		.join("");
	const seed = `${rawHex}${value.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
	return seed.padEnd(32, "0").slice(0, 32);
};

export const createDeterministicProfileId = (
	provider: string,
	providerId: string,
) => formatUuidFromHex(stringToDeterministicHex(`${provider}:${providerId}`));

const buildUsernameCandidates = (
	preferredUsername: string | null | undefined,
	providerId: string,
) => {
	const fallbackBase = `github_${providerId}`.toLowerCase();
	const rawBase = preferredUsername?.trim() || fallbackBase;
	const sanitizedBase =
		rawBase
			.toLowerCase()
			.replace(/[^a-z0-9_]/g, "_")
			.replace(/_+/g, "_")
			.replace(/^_+|_+$/g, "")
			.slice(0, 24) || fallbackBase;

	return [
		sanitizedBase,
		`${sanitizedBase}_${providerId}`.slice(0, 30),
		`user_${providerId}`.slice(0, 30),
	];
};

interface EnsureGitHubProfileParams {
	providerAccountId: string;
	username?: string | null;
	avatarUrl?: string | null;
}

export const ensureGitHubProfile = async ({
	providerAccountId,
	username,
	avatarUrl,
}: EnsureGitHubProfileParams) => {
	if (!supabaseAdmin) {
		return null;
	}

	const profileId = createDeterministicProfileId("github", providerAccountId);

	const { data: existingProfile, error: selectError } = await supabaseAdmin
		.from("profiles")
		.select("id, username")
		.eq("id", profileId)
		.maybeSingle();

	if (selectError) {
		throw selectError;
	}

	if (existingProfile) {
		if (avatarUrl) {
			await supabaseAdmin
				.from("profiles")
				.update({
					avatar_url: avatarUrl,
				})
				.eq("id", profileId);
		}

		return profileId;
	}

	const usernameCandidates = buildUsernameCandidates(
		username,
		providerAccountId,
	);

	for (const candidate of usernameCandidates) {
		const { error } = await supabaseAdmin.from("profiles").insert([
			{
				id: profileId,
				username: candidate,
				avatar_url: avatarUrl || null,
			},
		]);

		if (!error) {
			return profileId;
		}

		if (error.code !== "23505") {
			throw error;
		}
	}

	const { error: fallbackError } = await supabaseAdmin.from("profiles").upsert(
		[
			{
				id: profileId,
				username: `user_${providerAccountId}`.slice(0, 30),
				avatar_url: avatarUrl || null,
			},
		],
		{ onConflict: "id" },
	);

	if (fallbackError) {
		throw fallbackError;
	}

	return profileId;
};
