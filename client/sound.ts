import { getMuteLS, setMuteLS } from "./local-storage";

/**
 * Code here runs on both the client and the server, so be careful!
 * You can't use context here.
 */

let BULLET_HIT_AUDIO: HTMLAudioElement;

const setupMuteBtn = () => {
  const muteBtn = document.getElementById("muteBtn") as HTMLDivElement;
  const muteBtnImg = muteBtn.querySelector("img") as HTMLImageElement;
  const audio = document.getElementById("musicAudio") as HTMLAudioElement;

  if (!muteBtn || !muteBtnImg) {
    console.error("missing mute btn");
    return;
  }
  if (!audio) {
    console.error("missing audio element");
    return;
  }

  const isMuted = getMuteLS();
  audio.muted = isMuted;
  muteBtnImg.src = isMuted ? "/mute_on.gif" : "/mute.gif";

  muteBtn.addEventListener("click", () => {
    const isMuted = getMuteLS();
    setMuteLS(!isMuted);

    muteBtnImg.src = !isMuted ? "/mute_on.gif" : "/mute.gif";

    if (audio) {
      audio.muted = !isMuted;
    }
  });
};

export const playBulletHitOtherPlayer = () => {
  if (typeof window === "undefined") return;
  if (!BULLET_HIT_AUDIO) return;
  if (!BULLET_HIT_AUDIO.paused) return;
  if (getMuteLS()) return;
  console.log("play");

  BULLET_HIT_AUDIO.play();
};

export const setupSound = () => {
  if (typeof window === "undefined") {
    return;
  }

  BULLET_HIT_AUDIO = new Audio("/drum07.wav");
  BULLET_HIT_AUDIO.volume = 0.2;

  setupMuteBtn();
};
