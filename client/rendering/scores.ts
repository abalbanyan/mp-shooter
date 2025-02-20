import { GameState } from "../../game/types";

type ScoreToDisplay = { name: string; score: number };

/**
 * This avoids adding new elements to the list when no new players are added, which avoids excessive reflows.
 */
const updateList = (listEl: HTMLElement, scores: ScoreToDisplay[]) => {
  const listItems = listEl.children;
  const filteredScores = scores
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  filteredScores.forEach(({ name, score }, i) => {
    if (listItems[i]) {
      const nameSpan = listItems[i].querySelector(".name") as HTMLSpanElement;
      const scoreSpan = listItems[i].querySelector(".score") as HTMLSpanElement;

      if (nameSpan) nameSpan.textContent = name;
      if (scoreSpan) scoreSpan.textContent = score.toString();
    } else {
      const li = document.createElement("li");

      const nameSpan = document.createElement("span");
      nameSpan.className = "name";
      nameSpan.textContent = name;

      const scoreSpan = document.createElement("span");
      scoreSpan.className = "score";
      scoreSpan.textContent = score.toString();

      li.appendChild(nameSpan);
      li.appendChild(scoreSpan);
      listEl.appendChild(li);
    }
  });

  while (listEl.children.length > filteredScores.length) {
    listEl.removeChild(listEl.lastChild!);
  }
};

export const renderScoreboard = (gameState: GameState) => {
  // TODO: probably a smarter/more extensible way we can do this
  const scoreboard = document.getElementById("scoreboard");
  const deathsBoard = document.getElementById("scoreboardDeaths");
  const killsBoard = document.getElementById("scoreboardKills");
  const damageBoard = document.getElementById("scoreboardDamage");
  const deathsList = document.getElementById("scoreboardDeathsList");
  const killsList = document.getElementById("scoreboardKillsList");
  const damageList = document.getElementById("scoreboardDamageList");

  if (
    !scoreboard ||
    !deathsBoard ||
    !killsBoard ||
    !deathsList ||
    !killsList ||
    !damageList ||
    !damageBoard
  ) {
    console.error("missing scoreboard, deaths, or kills elements");
    return;
  }

  scoreboard.classList.remove("hide");

  const deathsToDisplay: ScoreToDisplay[] = [];
  const killsToDisplay: ScoreToDisplay[] = [];
  const damageToDisplay: ScoreToDisplay[] = [];

  Object.entries(gameState.scores).forEach(
    ([name, { deaths, kills, damage }]) => {
      deathsToDisplay.push({ name, score: deaths });
      killsToDisplay.push({ name, score: kills });
      damageToDisplay.push({ name, score: damage });
    }
  );

  updateList(deathsList, deathsToDisplay);
  updateList(killsList, killsToDisplay);
  updateList(damageList, damageToDisplay);
};
