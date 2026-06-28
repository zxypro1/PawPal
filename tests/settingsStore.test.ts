import assert from "node:assert/strict";
import { DEFAULT_SETTINGS } from "../src/shared/constants";
import { normalizeSettings } from "../src/main/settingsStore";

export const tests = [
  {
    name: "normalizeSettings fills missing values from defaults",
    run(): void {
      assert.deepEqual(normalizeSettings(), DEFAULT_SETTINGS);
    }
  },
  {
    name: "normalizeSettings falls back from invalid language and pet appearance",
    run(): void {
      const settings = normalizeSettings({
        language: "fr" as never,
        petAppearanceId: "cat" as never
      });

      assert.equal(settings.language, DEFAULT_SETTINGS.language);
      assert.equal(settings.petAppearanceId, DEFAULT_SETTINGS.petAppearanceId);
    }
  },
  {
    name: "normalizeSettings preserves valid stored values",
    run(): void {
      const settings = normalizeSettings({
        language: "en",
        petAppearanceId: "lovartPuppy",
        launchAtLoginEnabled: true,
        checkUpdatesOnLaunchEnabled: true,
        breakRunDurationSeconds: 90
      });

      assert.equal(settings.language, "en");
      assert.equal(settings.petAppearanceId, "lovartPuppy");
      assert.equal(settings.launchAtLoginEnabled, true);
      assert.equal(settings.checkUpdatesOnLaunchEnabled, true);
      assert.equal(settings.breakRunDurationSeconds, 90);
    }
  },
  {
    name: "normalizeSettings enforces break run duration minimum only",
    run(): void {
      assert.equal(normalizeSettings({ breakRunDurationSeconds: 5 }).breakRunDurationSeconds, 10);
      assert.equal(normalizeSettings({ breakRunDurationSeconds: 1200 }).breakRunDurationSeconds, 1200);
      assert.equal(
        normalizeSettings({ breakRunDurationSeconds: Number.NaN }).breakRunDurationSeconds,
        DEFAULT_SETTINGS.breakRunDurationSeconds
      );
    }
  },
  {
    name: "normalizeSettings preserves valid custom pet settings",
    run(): void {
      const settings = normalizeSettings({
        petAppearanceId: "custom",
        customPetAppearance: {
          name: "My Pet",
          assets: {
            idle: {
              relativePath: "custom_pet_assets/idle/my-pet.gif",
              originalName: "my-pet.gif",
              updatedAt: 1
            }
          }
        }
      });

      assert.equal(settings.petAppearanceId, "custom");
      assert.equal(settings.customPetAppearance?.assets.idle?.relativePath, "custom_pet_assets/idle/my-pet.gif");
    }
  },
  {
    name: "normalizeSettings falls back from custom pet when required assets are missing",
    run(): void {
      const settings = normalizeSettings({
        petAppearanceId: "custom",
        customPetAppearance: {
          name: "My Pet",
          assets: {
            happy: {
              relativePath: "custom_pet_assets/happy/my-pet.gif",
              originalName: "my-pet.gif",
              updatedAt: 1
            }
          }
        }
      });

      assert.equal(settings.petAppearanceId, DEFAULT_SETTINGS.petAppearanceId);
    }
  },
  {
    name: "normalizeSettings defaults audio sounds to empty",
    run(): void {
      assert.deepEqual(normalizeSettings().audioSounds, {});
    }
  },
  {
    name: "normalizeSettings preserves valid audio sounds and drops invalid ones",
    run(): void {
      const settings = normalizeSettings({
        audioSounds: {
          break: {
            source: "custom",
            relativePath: "custom_sounds/break/break-1-bell.mp3",
            originalName: "bell.mp3",
            updatedAt: 5
          },
          "focus-complete": {
            source: "builtin",
            relativePath: "pet_assets/sounds/reminder.mp3",
            originalName: "reminder.mp3",
            updatedAt: 6
          },
          hydration: {
            source: "custom",
            relativePath: "custom_sounds/hydration/water.txt",
            originalName: "water.txt",
            updatedAt: 7
          },
          "focus-warning": {
            source: "custom",
            relativePath: "pet_assets/sounds/reminder.mp3",
            originalName: "reminder.mp3",
            updatedAt: 8
          },
          "unknown-event": {
            source: "custom",
            relativePath: "custom_sounds/x/y.mp3",
            originalName: "y.mp3",
            updatedAt: 9
          }
        } as never
      });

      assert.equal(settings.audioSounds.break?.source, "custom");
      assert.equal(settings.audioSounds.break?.relativePath, "custom_sounds/break/break-1-bell.mp3");
      assert.equal(settings.audioSounds["focus-complete"]?.source, "builtin");
      assert.equal(settings.audioSounds.hydration, undefined);
      assert.equal(settings.audioSounds["focus-warning"], undefined);
      assert.equal(Object.keys(settings.audioSounds).length, 2);
    }
  }
];
