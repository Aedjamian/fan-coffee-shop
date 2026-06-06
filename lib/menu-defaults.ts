import type { MenuCategory } from "./content-types";

export const defaultExtrasCategory: MenuCategory = {
  id: "extras",
  title: "Extras",
  subtitle: "Add-ons — update names and prices to match your board.",
  items: [
    { id: "ex-bacon", "name": "Extra Bacon", "price": "$2.00" },
    { id: "ex-ham", "name": "Extra Ham", "price": "$2.00" },
    { id: "ex-sausage", "name": "Extra Sausage", "price": "$2.00" },
    { id: "ex-cheese", "name": "Extra Cheese", "price": "$1.50" },
    { id: "ex-egg", "name": "Extra Egg", "price": "$1.50" },
    { id: "ex-homefries", "name": "Side Homefries", "price": "$3.00" },
    { id: "ex-toast", "name": "Extra Toast", "price": "$1.50" },
  ],
};

export function withDefaultExtrasCategory(
  categories: MenuCategory[],
): MenuCategory[] {
  if (categories.some((c) => c.id === "extras")) {
    return categories;
  }

  const drinksIndex = categories.findIndex((c) => c.id === "drinks");
  if (drinksIndex === -1) {
    return [...categories, defaultExtrasCategory];
  }

  const next = [...categories];
  next.splice(drinksIndex, 0, defaultExtrasCategory);
  return next;
}
