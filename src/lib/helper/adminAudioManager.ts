let audioEl: HTMLAudioElement | null = null;
let unlocked = false;

const AUDIO_URL = "/sounds/new-order-created.mp3";

export function initAdminAudio() {
  if (typeof window === "undefined") return;

  if (!audioEl) {
    audioEl = new Audio(AUDIO_URL);
    audioEl.preload = "auto";
    audioEl.setAttribute("playsinline", "true");
  }
}

export async function unlockAdminAudio() {
  if (!audioEl) initAdminAudio();
  if (!audioEl) return false;

  try {
    const prev = audioEl.volume;
    audioEl.volume = 0;

    audioEl.currentTime = 0;
    await audioEl.play();
    audioEl.pause();
    audioEl.currentTime = 0;

    audioEl.volume = prev;

    unlocked = true;
    console.log("[audio] unlocked");
    return true;
  } catch (e) {
    console.warn("[audio] unlock failed", e);
    unlocked = false;
    return false;
  }
}

export async function playAdminSound() {
  if (!audioEl || !unlocked) return false;

  try {
    audioEl.currentTime = 0;
    await audioEl.play();
    return true;
  } catch (e) {
    console.warn("[audio] play failed", e);
    unlocked = false;
    return false;
  }
}

export function isAdminAudioUnlocked() {
  return unlocked;
}
