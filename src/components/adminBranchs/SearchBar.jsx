import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="relative group">
        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88] text-sm transition-all duration-300 group-focus-within:scale-110" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl sm:rounded-2xl pr-10 pl-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-lg"
          placeholder={placeholder}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#2E3D88] transition-colors duration-200"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
