import { AutocompleteListItem } from "../types";

interface UseKeyboardProps {
  showAutocomplete: boolean;
  allItems: AutocompleteListItem[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  setQuery: (query: string) => void;
  handleSelect: (item: AutocompleteListItem) => void;
  handleSubmit: () => void;
  hideAndBlur: () => void;
}

export const useSearchKeyboard = ({
  showAutocomplete,
  allItems,
  selectedIndex,
  setSelectedIndex,
  setQuery,
  handleSelect,
  handleSubmit,
  hideAndBlur,
}: UseKeyboardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || !allItems.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    const total = allItems.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(selectedIndex < total - 1 ? selectedIndex + 1 : 0);
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : total - 1);
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          handleSelect(allItems[selectedIndex]);
        } else {
          handleSubmit();
        }
        break;

      case "Escape":
        hideAndBlur();
        break;

      case "Tab":
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          e.preventDefault();
          const item = allItems[selectedIndex].item;
          let name: string;
          if (typeof item === "string") {
            name = item;
          } else if ('name' in item) {
            name = item.name;
          } else {
            name = item.text;
          }
          setQuery(name);
        }
        break;
    }
  };

  return { handleKeyDown };
};