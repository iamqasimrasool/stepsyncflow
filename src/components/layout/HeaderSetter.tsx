"use client";

import { useEffect } from "react";
import { useHeader } from "@/components/layout/HeaderContext";

export default function HeaderSetter({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string | null;
}) {
  const { setHeader, clearHeader } = useHeader();

  useEffect(() => {
    if (title) {
      setHeader({ title, subtitle: subtitle ?? undefined });
    }
    return () => clearHeader();
  }, [title, subtitle, setHeader, clearHeader]);

  return null;
}
