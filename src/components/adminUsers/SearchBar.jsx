import { motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  searchUsers,
  isSearching,
}) {
  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchUsers();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-6 sm:mb-8"
    >
      <div className="max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative group" style={{ direction: "ltr" }}>
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88] text-sm transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-gray-200 bg-white text-black rounded-xl sm:rounded-2xl pr-10 pl-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-lg"
                placeholder="...البحث بالبريد الإلكتروني"
                style={{ textAlign: "right" }}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    if (searchTerm.trim()) {
                      setTimeout(() => searchUsers(), 100);
                    }
                  }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#2E3D88] transition-colors duration-200"
                >
                  <FaTimes size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-center justify-center sm:justify-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className={`px-6 py-3 rounded-xl font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 flex items-center gap-2 ${
                isSearching || !searchTerm.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-xl"
              }`}
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>جاري البحث...</span>
                </>
              ) : (
                <>
                  <FaSearch className="text-sm" />
                  <span>بحث</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
