"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface YTPlayer {
	destroy(): void;
	playVideo(): void;
	pauseVideo(): void;
	seekTo(seconds: number, allowSeekAhead: boolean): void;
	getPlayerState(): number;
	getCurrentTime(): number;
}

interface YTPlayerEvent {
	target: YTPlayer;
	data: number;
}

interface YTWindow {
	Player: new (
		elementId: string,
		options: {
			height: string;
			width: string;
			videoId: string;
			playerVars: {
				autoplay: number;
				controls: number;
				disablekb: number;
				fs: number;
				modestbranding: number;
				rel: number;
				start: number;
			};
			events: {
				onReady?: (event: YTPlayerEvent) => void;
				onStateChange?: (event: YTPlayerEvent) => void;
			};
		},
	) => YTPlayer;
	PlayerState: {
		PLAYING: number;
		PAUSED: number;
	};
}

declare global {
	interface Window {
		YT: YTWindow | undefined;
		onYouTubeIframeAPIReady: (() => void) | undefined;
	}
}

interface YouTubeSyncPlayerProps {
	youtubeId: string;
	isPlaying: boolean;
	playbackPosition: number;
	playbackUpdatedAt: string | null;
	onPlaybackChange: (position: number, isPlaying: boolean) => Promise<void>;
	isOwner: boolean;
	isDemoMode: boolean;
}

export function YouTubeSyncPlayer({
	youtubeId,
	isPlaying,
	playbackPosition,
	playbackUpdatedAt,
	onPlaybackChange,
	isOwner,
	isDemoMode,
}: YouTubeSyncPlayerProps) {
	const containerId = `yt-player-${youtubeId}`;
	const playerRef = useRef<YTPlayer | null>(null);
	const [apiReady, setApiReady] = useState(false);
	const isApplyingStateRef = useRef(false);
	const prevYoutubeIdRef = useRef<string | null>(null);

	// Load YouTube IFrame API
	useEffect(() => {
		if (window.YT?.Player) {
			setApiReady(true);
			return;
		}

		// If script isn't loaded, inject it
		if (
			!document.querySelector(
				'script[src="https://www.youtube.com/iframe_api"]',
			)
		) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			const firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
		}

		const previousCallback = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			if (previousCallback) previousCallback();
			setApiReady(true);
		};
	}, []);

	// Calculate target playback position based on elapsed time since last sync
	const getTargetPosition = useCallback((): number => {
		if (!isPlaying || !playbackUpdatedAt) {
			return playbackPosition;
		}
		const elapsedSeconds =
			(Date.now() - new Date(playbackUpdatedAt).getTime()) / 1000;
		return Math.max(0, playbackPosition + elapsedSeconds);
	}, [isPlaying, playbackPosition, playbackUpdatedAt]);

	// Sync non-owner player to correct server state
	const syncNonOwnerToState = useCallback(() => {
		const player = playerRef.current;
		if (!player?.getPlayerState) return;

		isApplyingStateRef.current = true;
		try {
			const targetPos = getTargetPosition();
			player.seekTo(targetPos, true);

			if (isPlaying) {
				player.playVideo();
			} else {
				player.pauseVideo();
			}
		} catch (err) {
			console.error("Error force-syncing YT player:", err);
		} finally {
			setTimeout(() => {
				isApplyingStateRef.current = false;
			}, 300);
		}
	}, [isPlaying, getTargetPosition]);

	// Initialize or destroy player
	useEffect(() => {
		if (!apiReady || !youtubeId || !window.YT) return;

		// Destroy previous player if the video has changed
		if (playerRef.current && prevYoutubeIdRef.current !== youtubeId) {
			try {
				playerRef.current.destroy();
				playerRef.current = null;
			} catch (err) {
				console.error("Error destroying YT player:", err);
			}
		}

		prevYoutubeIdRef.current = youtubeId;

		if (!playerRef.current) {
			const targetPos = getTargetPosition();
			playerRef.current = new window.YT.Player(containerId, {
				height: "100%",
				width: "100%",
				videoId: youtubeId,
				playerVars: {
					autoplay: isPlaying ? 1 : 0,
					controls: isOwner || isDemoMode ? 1 : 0,
					disablekb: isOwner || isDemoMode ? 0 : 1,
					fs: 1,
					modestbranding: 1,
					rel: 0,
					start: Math.floor(targetPos),
				},
				events: {
					onReady: (event: YTPlayerEvent) => {
						const player = event.target;
						if (isPlaying) {
							player.playVideo();
						} else {
							player.pauseVideo();
						}
						player.seekTo(targetPos, true);
					},
					onStateChange: (event: YTPlayerEvent) => {
						if (isApplyingStateRef.current || !window.YT) return;

						if (!isOwner && !isDemoMode) {
							syncNonOwnerToState();
							return;
						}

						const state = event.data;
						const player = playerRef.current;
						if (!player) return;

						if (state === window.YT.PlayerState.PLAYING) {
							void onPlaybackChange(player.getCurrentTime(), true);
						} else if (state === window.YT.PlayerState.PAUSED) {
							void onPlaybackChange(player.getCurrentTime(), false);
						}
					},
				},
			});
		}
	}, [
		apiReady,
		youtubeId,
		containerId,
		isPlaying,
		isOwner,
		isDemoMode,
		onPlaybackChange,
		getTargetPosition,
		syncNonOwnerToState,
	]);

	// Handle updates to isPlaying and playbackPosition from server/parent
	useEffect(() => {
		const player = playerRef.current;
		if (!player?.getPlayerState || !window.YT) return;

		isApplyingStateRef.current = true;

		try {
			const targetPos = getTargetPosition();
			const currentPos = player.getCurrentTime();
			const isPlayerPlaying =
				player.getPlayerState() === window.YT.PlayerState.PLAYING;

			if (Math.abs(currentPos - targetPos) > 3) {
				player.seekTo(targetPos, true);
			}

			if (isPlaying && !isPlayerPlaying) {
				player.playVideo();
			} else if (!isPlaying && isPlayerPlaying) {
				player.pauseVideo();
			}
		} catch (err) {
			console.error("Error applying sync to YT player:", err);
		} finally {
			setTimeout(() => {
				isApplyingStateRef.current = false;
			}, 300);
		}
	}, [isPlaying, getTargetPosition]);

	// Keep a periodic check to keep non-owners in sync
	useEffect(() => {
		if (isOwner || isDemoMode) return;

		const interval = setInterval(() => {
			const player = playerRef.current;
			if (!player?.getPlayerState || isApplyingStateRef.current) return;

			const targetPos = getTargetPosition();
			const currentPos = player.getCurrentTime();

			if (Math.abs(currentPos - targetPos) > 3) {
				isApplyingStateRef.current = true;
				player.seekTo(targetPos, true);
				setTimeout(() => {
					isApplyingStateRef.current = false;
				}, 300);
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [isOwner, isDemoMode, getTargetPosition]);

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
			}}
		>
			<div id={containerId} style={{ width: "100%", height: "100%" }} />
		</div>
	);
}
