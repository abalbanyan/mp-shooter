import { Socket } from "socket.io-client";

import { GetSuggestedNameResponse, IOMessagePlayerJoin } from "../game/types";

export const setupJoinGameForm = async (socket: Socket) => {
  const joinForm = document.getElementById("joinForm") as HTMLDivElement;
  const nameInput = document.getElementById("nameInput") as HTMLInputElement;

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
  joinForm.classList.add("active");

  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    if (!name) return;

    socket.emit("playerJoin", { name } satisfies IOMessagePlayerJoin);

    // Hide form again.
    joinForm.classList.remove("active");
  });
};
