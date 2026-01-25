const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function extractYouTubeId(input: string) {
  const trimmed = input.trim();
  const match = trimmed.match(YOUTUBE_ID_REGEX);
  if (match?.[1]) return match[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}
