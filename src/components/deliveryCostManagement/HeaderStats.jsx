import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

export default function HeaderStats({ deliveryAreasCount, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
    >
      <div className="text-right self-end sm:self-auto">
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#2E3D88]">
          {deliveryAreasCount} منطقة
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          الإجمالي
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4" dir="ltr">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#2E3D88] hover:bg-[#2E3D88] hover:text-white transition-all duration-300 shadow-lg dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#2E3D88]"
        >
          <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
        <div dir="rtl" className="text-right">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
            إدارة تكاليف التوصيل
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            إدارة مناطق وتكاليف التوصيل
          </p>
        </div>
      </div>
    </motion.div>
  );
}
