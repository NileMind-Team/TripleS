import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaUserCircle } from "react-icons/fa";

export default function WelcomeAnimation({ userName, userImage }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("data:")
    ) {
      return imagePath;
    }

    if (imagePath.startsWith("/")) {
      return `https://restaurant-template.runasp.net${imagePath}`;
    }

    return `https://restaurant-template.runasp.net/${imagePath}`;
  };

  const fullImageUrl = getFullImageUrl(userImage);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center z-50"
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", damping: 15 }}
            className="max-w-md w-full mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block p-4 bg-white/20 rounded-full backdrop-blur-sm"
              >
                {fullImageUrl ? (
                  <img
                    src={fullImageUrl}
                    alt={userName}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white/30"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<FaUserCircle class="text-white" size="64" />';
                    }}
                  />
                ) : (
                  <FaUserCircle className="text-white" size={64} />
                )}
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 text-center">
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl font-bold text-gray-800 dark:text-white"
              >
                مرحباً بك، {userName}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="flex items-center justify-center gap-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  <span>تم تسجيل الدخول بنجاح</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    <FaCheckCircle className="text-green-500" size={24} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.9, duration: 2 }}
                className="h-1 bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] rounded-full"
              />
            </div>
          </motion.div>

          {/* Subtle background pattern */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#2E3D88]/5 to-[#4A5DB0]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-[#4A5DB0]/5 to-[#2E3D88]/5 rounded-full blur-3xl"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
