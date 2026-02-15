import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTruck,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export default function DeliveryAreaCard({
  area,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 dark:bg-gray-800/90"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-[#f0f3ff] to-[#d9e0f5] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#4A5DB0]/30 dark:border-gray-500">
              <FaMapMarkerAlt className="text-[#2E3D88] dark:text-[#4A5DB0] text-lg sm:text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg sm:text-xl truncate">
                  {area.areaName}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    area.isActive,
                  )} whitespace-nowrap`}
                >
                  {area.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {area.branchName && `الفرع: ${area.branchName} • `}
                تم الإنشاء{" "}
                {new Date(area.createdAt).toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
              <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-lg flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  تكلفة التوصيل
                </p>
                <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                  ج.م {area.deliveryCost.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <FaTruck className="text-blue-600 dark:text-blue-400 text-lg flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  الوقت المتوقع
                </p>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                  {area.estimatedTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => onToggleActive(area.id, e)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
              area.isActive
                ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-800"
                : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800"
            } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
          >
            {area.isActive ? "تعطيل" : "تفعيل"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(area)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
          >
            <FaEdit className="text-xs sm:text-sm" />
            <span className="whitespace-nowrap">تعديل</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(area.id)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
          >
            <FaTrash className="text-xs sm:text-sm" />
            <span className="whitespace-nowrap">حذف</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
