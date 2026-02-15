import { motion } from "framer-motion";
import { FaSearch, FaPlus } from "react-icons/fa";

export default function SearchFilterBar({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  handleAddNewArea,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative z-30 dark:bg-gray-800/90"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 dark:text-gray-500" />
          <input
            type="text"
            placeholder="ابحث في مناطق التوصيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Add New Area Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNewArea}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white px-4 sm:px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
          >
            <span className="hidden sm:inline">إضافة منطقة</span>
            <span className="sm:hidden">إضافة</span>
            <FaPlus className="text-sm" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
