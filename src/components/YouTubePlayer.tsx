"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { extractYouTubeId } from "@/lib/youtube";

export type YouTubePlayerHandle = {
  seekTo: (seconds: number) => void;
  playVideo: () => void;
  getCurrentTime: () => number;
};

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiReadyPromise: Promise<void> | null = null;

function loadYouTubeAPI() {
  if (apiReadyPromise) return apiReadyPromise;
  apiReadyPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
  return apiReadyPromise;
}

type Props = {
  videoUrl: string;
  className?: string;
};

const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(
  ({ videoUrl, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YT.Player | null>(null);
    const [ready, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds) => {
        playerRef.current?.seekTo(seconds, true);
      },
      playVideo: () => {
        playerRef.current?.playVideo();
      },
      getCurrentTime: () => {
        const player = playerRef.current;
        if (!player || typeof player.getCurrentTime !== "function") {
          return 0;
        }
        return player.getCurrentTime();
      },
    }));

    useEffect(() => {
      let isMounted = true;
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId || !containerRef.current) return;

      loadYouTubeAPI().then(() => {
        if (!isMounted || !containerRef.current) return;
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: () => setReady(true),
          },
        });
      });

      return () => {
        isMounted = false;
        playerRef.current?.destroy();
        playerRef.current = null;
      };
    }, [videoUrl]);

    return (
      <div className={className}>
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <div ref={containerRef} className="h-full w-full" />
        </div>
        {!ready && (
          <div className="mt-2 text-sm text-muted-foreground">Loading video…</div>
        )}
      </div>
    );
  }
);

YouTubePlayer.displayName = "YouTubePlayer";

export default YouTubePlayer;
