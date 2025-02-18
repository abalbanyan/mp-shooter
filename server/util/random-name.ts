import { uniqueNamesGenerator, Config, starWars } from "unique-names-generator";

const uniqueNamesConfig: Config = {
  dictionaries: [starWars],
};

export const getRandomName = () => uniqueNamesGenerator(uniqueNamesConfig);
