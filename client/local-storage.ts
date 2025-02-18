const LS_KEY_NAME = "my_saved_player_name";

export const savePlayerNameLS = (name: string) => {
  localStorage.setItem(LS_KEY_NAME, name);
};

export const getPlayerNameLS = () => {
  return localStorage.getItem(LS_KEY_NAME);
};
