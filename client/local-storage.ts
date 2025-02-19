const LS_KEY_NAME = "my_saved_player_name";
const LS_KEY_MUTE = "mute";

export const savePlayerNameLS = (name: string) => {
  localStorage.setItem(LS_KEY_NAME, name);
};

export const getPlayerNameLS = () => {
  return localStorage.getItem(LS_KEY_NAME);
};

export const getMuteLS = () => {
  return localStorage.getItem(LS_KEY_MUTE) === "1";
};
export const setMuteLS = (mute: boolean) => {
  localStorage.setItem(LS_KEY_MUTE, mute ? "1" : "0");
};
