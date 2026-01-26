import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { BiSearch } from "react-icons/bi";

export const SearchDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <BiSearch className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setIsOpen(false)}
            />
            <div className="inline-block w-full max-w-md  my-24 text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-sm">
              <SearchBar showSuggestions />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
