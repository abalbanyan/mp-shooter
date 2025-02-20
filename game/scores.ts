import { GameState, PlayerEntity } from "./types";

const getOrInitPlayerScores = (gameState: GameState, player: PlayerEntity) => {
  if (!gameState.scores[player.name]) {
    gameState.scores[player.name] = { kills: 0, deaths: 0, damage: 0 };
  }
  return gameState.scores[player.name];
};

export const incPlayerKillScore = (
  gameState: GameState,
  player: PlayerEntity,
  amount = 1
) => {
  const scores = getOrInitPlayerScores(gameState, player);
  scores.kills += amount;
};

export const incPlayerDeathScore = (
  gameState: GameState,
  player: PlayerEntity,
  amount = 1
) => {
  const scores = getOrInitPlayerScores(gameState, player);
  scores.deaths += amount;
};

export const incPlayerDamageScore = (
  gameState: GameState,
  player: PlayerEntity,
  amount = 1
) => {
  const scores = getOrInitPlayerScores(gameState, player);
  scores.damage += amount;
};

export const resetScoresForPlayer = (
  gameState: GameState,
  playerName: string
) => {
  delete gameState.scores[playerName];
};

export const resetScores = (gameState: GameState) => {
  gameState.scores = {};
};
