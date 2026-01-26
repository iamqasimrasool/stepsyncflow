"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import YouTubePlayer, { YouTubePlayerHandle } from "@/components/YouTubePlayer";
import HeaderSetter from "@/components/layout/HeaderSetter";
import { cn } from "@/lib/utils";
import SopComments from "@/components/sop/SopComments";

type Step = {
  id: string;
  order: number;
  heading: string;
  body: string | null;
  timestamp: number;
};

type Sop = {
  id: string;
  title: string;
  summary: string | null;
  videoUrl: string;
  steps: Step[];
};

export default function SopViewer({
  sop,
  enableComments = true,
}: {
  sop: Sop;
  enableComments?: boolean;
}) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(
    sop.steps[0]?.id ?? null
  );
  const lastActiveRef = useRef<string | null>(sop.steps[0]?.id ?? null);
  const stepRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  const sortedSteps = useMemo(
    () => [...sop.steps].sort((a, b) => a.order - b.order),
    [sop.steps]
  );

  useEffect(() => {
    if (!activeStepId) return;
    const el = stepRefs.current[activeStepId];
    if (el && window.innerWidth < 768) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeStepId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime();
      if (currentTime === undefined) return;

      const reversedSteps = [...sortedSteps].reverse();
      const matched =
        reversedSteps.find((step) => currentTime + 0.5 >= step.timestamp) ??
        sortedSteps[0];

      if (matched && matched.id !== lastActiveRef.current) {
        lastActiveRef.current = matched.id;
        setActiveStepId(matched.id);
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, [sortedSteps]);

  const handleStepClick = (step: Step) => {
    playerRef.current?.seekTo(step.timestamp);
    playerRef.current?.playVideo();
    setActiveStepId(step.id);
  };

  const getCurrentTime = () =>
    Math.floor(playerRef.current?.getCurrentTime() ?? 0);

  return (
    <div className="grid h-full gap-6 overflow-hidden md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
      <HeaderSetter title={sop.title} subtitle={sop.summary} />
      <div className="order-2 flex h-full flex-col gap-4 overflow-y-auto px-1 pb-6 md:order-1 md:pr-2">
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
          <h2 className="text-lg font-semibold">{sop.title}</h2>
          {sop.summary && (
            <p className="mt-1 text-sm text-muted-foreground">{sop.summary}</p>
          )}
        </div>
        {enableComments && (
          <SopComments
            sopId={sop.id}
            getCurrentTime={getCurrentTime}
            onSeek={(seconds) => {
              playerRef.current?.seekTo(seconds);
              playerRef.current?.playVideo();
            }}
            listVisible={commentsExpanded}
            onToggleList={() => setCommentsExpanded((prev) => !prev)}
          />
        )}
        <div className="pt-2 text-sm font-semibold text-muted-foreground">
          Workflow Steps
        </div>
        {sortedSteps.map((step) => (
          <button
            key={step.id}
            ref={(el) => {
              stepRefs.current[step.id] = el;
            }}
            onClick={() => handleStepClick(step)}
            className={cn(
              "soft-shadow w-full rounded-2xl border border-white/60 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-200",
              activeStepId === step.id && "ring-2 ring-primary/40"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">{step.heading}</h3>
              <span className="text-xs text-muted-foreground">
                {step.timestamp}s
              </span>
            </div>
            {step.body && (
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            )}
          </button>
        ))}
      </div>
      <div className="order-1 flex h-full flex-col gap-4 md:order-2 md:pr-2">
        <div className="glass-panel sticky top-20 rounded-2xl p-3 md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          <YouTubePlayer ref={playerRef} videoUrl={sop.videoUrl} />
        </div>
      </div>
    </div>
  );
}
