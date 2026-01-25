declare namespace YT {
  type PlayerVars = {
    modestbranding?: number;
    rel?: number;
    playsinline?: number;
  };

  type PlayerEvent = {
    target: Player;
  };

  type PlayerEvents = {
    onReady?: (event: PlayerEvent) => void;
  };

  type PlayerOptions = {
    videoId?: string;
    playerVars?: PlayerVars;
    events?: PlayerEvents;
  };

  class Player {
    constructor(elementId: string | HTMLElement, options?: PlayerOptions);
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    playVideo(): void;
    getCurrentTime(): number;
    destroy(): void;
  }
}

