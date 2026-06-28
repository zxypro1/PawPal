import type { AudioEvent, EventSound } from "./types";

export const AUDIO_EVENTS: AudioEvent[] = [
  "break",
  "hydration",
  "focus-warning",
  "focus-complete"
];

export const AUDIO_FILE_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "aac", "flac"] as const;

export type BuiltinAudioPreset = {
  id: string;
  relativePath: string;
};

export const BUILTIN_AUDIO_PRESETS: readonly BuiltinAudioPreset[] = [
  { id: "reminder", relativePath: "pet_assets/sounds/reminder.mp3" }
];

function isAudioEvent(value: unknown): value is AudioEvent {
  return typeof value === "string" && (AUDIO_EVENTS as readonly string[]).includes(value);
}

export function hasAllowedAudioExtension(path: string): boolean {
  const lower = path.toLowerCase();
  return AUDIO_FILE_EXTENSIONS.some((ext) => lower.endsWith(`.${ext}`));
}

function basename(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

function normalizeBuiltinSound(value: Partial<EventSound>): EventSound | null {
  const preset = BUILTIN_AUDIO_PRESETS.find((p) => p.relativePath === value.relativePath);
  if (!preset) return null;
  return {
    source: "builtin",
    relativePath: preset.relativePath,
    originalName: basename(preset.relativePath),
    updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : Date.now()
  };
}

function normalizeCustomSound(value: Partial<EventSound>): EventSound | null {
  if (typeof value.relativePath !== "string") return null;
  if (!value.relativePath.startsWith("custom_sounds/")) return null;
  if (!hasAllowedAudioExtension(value.relativePath)) return null;
  return {
    source: "custom",
    relativePath: value.relativePath,
    originalName:
      typeof value.originalName === "string" && value.originalName.trim()
        ? value.originalName
        : basename(value.relativePath),
    updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : Date.now()
  };
}

export function normalizeEventSound(value: unknown): EventSound | null {
  if (!value || typeof value !== "object") return null;
  const sound = value as Partial<EventSound>;
  if (sound.source === "builtin") return normalizeBuiltinSound(sound);
  if (sound.source === "custom") return normalizeCustomSound(sound);
  return null;
}

export function normalizeAudioSounds(
  value: unknown
): Partial<Record<AudioEvent, EventSound>> {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  const result: Partial<Record<AudioEvent, EventSound>> = {};
  for (const [event, sound] of Object.entries(source)) {
    if (!isAudioEvent(event)) continue;
    const normalized = normalizeEventSound(sound);
    if (normalized) result[event] = normalized;
  }
  return result;
}

export function builtinPresetById(id: string): BuiltinAudioPreset | undefined {
  return BUILTIN_AUDIO_PRESETS.find((preset) => preset.id === id);
}
