import { Socket } from "socket.io-client";

import { GetSuggestedNameResponse, IOMessagePlayerJoin } from "../game/types";
import { startMusic } from "./sound";

const setupJoinGameForm = async (socket: Socket) => {
  const joinForm = document.getElementById("joinForm") as HTMLDivElement;
  const nameInput = document.getElementById(
    "nameInput"
  ) as HTMLInputElement | null;

  if (!joinForm || !nameInput) {
    console.error("missing join form");
    return;
  }

  try {
    const resp = await fetch("/api/suggest-name");
    const data = (await resp.json()) as GetSuggestedNameResponse;
    nameInput.value = data.name;
  } catch (e) {
    console.error(e, "failed to get suggested name");
  }

  // Make form visible.
  joinForm?.classList.add("active");

  joinForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    if (!name) return;

    socket.emit("playerJoin", { name } satisfies IOMessagePlayerJoin);

    startMusic();

    joinForm.classList.remove("active");
  });
};

const setupDeathModal = (socket: Socket) => {
  const deathModal = document.getElementById("deathModal") as HTMLDivElement;
  const rejoinButton = document.getElementById(
    "rejoinButton"
  ) as HTMLDivElement;
  const nameInput = document.getElementById("nameInput") as HTMLInputElement;

  rejoinButton?.addEventListener("click", () => {
    const name = nameInput?.value.trim();
    if (!name) return;

    socket.emit("playerJoin", { name } satisfies IOMessagePlayerJoin);
    deathModal?.classList.remove("active");
  });
};

export const showDeathModal = () => {
  const deathModal = document.getElementById("deathModal") as HTMLDivElement;
  deathModal?.classList.add("active");
};

export const setupModals = (socket: Socket) => {
  setupDeathModal(socket);
  setupJoinGameForm(socket);
};
