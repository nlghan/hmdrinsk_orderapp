import funnyDrinkGroupNames from "../theme/funnyGroupNames";

export const getRandomGroupName = () => {
  const index = Math.floor(Math.random() * funnyDrinkGroupNames.length);
  return funnyDrinkGroupNames[index];
};