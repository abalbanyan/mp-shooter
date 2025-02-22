import { getMuteLS, setMuteLS } from "./local-storage";

/**
 * Code here runs on both the client and the server, so be careful!
 * You can't use client or server context here.
 */

type Sound = { audio: HTMLAudioElement; volume: number };
let SOUNDS: Record<string, Sound> = {};
if (typeof window !== "undefined") {
  SOUNDS = {
    BULLET_HIT: {
      audio: new Audio("/sound/380291__rhodesmas__ui-04.wav"),
      volume: 0.1,
    },
    BULLET_HIT_ME: {
      audio: new Audio("/sound/350925__cabled_mess__hurt_c_08.wav"),
      volume: 0.3,
    },
    PLAYER_DEATH: {
      audio: new Audio("/sound/773737__qubodup__punch-1.wav"),
      volume: 0.4,
    },
    TELEPORT: {
      audio: new Audio(
        "/sound/270428__littlerobotsoundfactory__footstep_water_05.wav"
      ),
      volume: 0.4,
    },
  };
}

/**
 * Hack needed since we can't import the normal context.
 */
export const soundContext: {
  playerId?: string;
} = {
  playerId: undefined,
};

/**
 * Chrome only allows music to play after user interaction, so run this after the user clicks join game.
 */
export const startMusic = () => {
  const audio = document.getElementById("musicAudio") as HTMLAudioElement;

  if (!audio) {
    console.error("missing audio element");
    return;
  }

  audio.muted = getMuteLS();
  audio.play();
};

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

  muteBtn.classList.remove("hide");

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

const playSound = (sound?: Sound, waitForPause = true) => {
  if (typeof window === "undefined") return;
  if (getMuteLS()) return;
  if (!sound || !sound.audio || !sound.volume) return;
  if (!sound.audio.paused && waitForPause) return;
  sound.audio.play();
};

export const playTeleportSound = (playerId: string) => {
  if (playerId === soundContext.playerId) {
    playSound(SOUNDS.TELEPORT);
  }
};

export const playDeathSound = () => {
  playSound(SOUNDS.PLAYER_DEATH);
};

export const playBulletHit = (attackerId: string, attackedId: string) => {
  if (attackerId === soundContext.playerId) {
    playSound(SOUNDS.BULLET_HIT);
  }
  if (attackedId === soundContext.playerId) {
    playSound(SOUNDS.BULLET_HIT_ME);
  }
};

export const playBulletFire = () => {
  // decided to disable this because it was sounding monotonous and annoying
  // I think I need to take the same sound file and modify it slightly and randomize
  // which variation is played each bullet to make it sound less grating
  // playSound(BULLET_FIRE);
};

export const setupSound = () => {
  if (typeof window === "undefined") {
    return;
  }

  Object.values(SOUNDS).forEach(({ audio: sound, volume }) => {
    sound.volume = volume;
  });

  setupMuteBtn();
};
