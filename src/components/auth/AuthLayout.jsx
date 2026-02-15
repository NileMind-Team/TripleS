import { forwardRef } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaGoogle } from "react-icons/fa";

const AuthLayout = forwardRef(
  (
    {
      children,
      activeTab,
      onTabChange,
      onBack,
      showWelcome,
      isProcessingGoogle,
      onGoogleLogin,
      isGoogleLoading,
      onLoginTabClick,
      onRegisterTabClick,
    },
    ref,
  ) => {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#f0f3ff] to-[#d9e0f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4 relative font-sans overflow-hidden transition-colors duration-300`}
        dir="rtl"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-r from-[#2E3D88]/10 to-[#4A5DB0]/10 dark:from-[#2E3D88]/20 dark:to-[#4A5DB0]/20 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-r from-[#4A5DB0]/10 to-[#2E3D88]/10 dark:from-[#4A5DB0]/20 dark:to-[#2E3D88]/20 rounded-full blur-3xl"></div>
        </div>

        {!showWelcome && !isProcessingGoogle && (
          <button
            onClick={onBack}
            className="fixed top-6 left-6 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-[#2E3D88] hover:text-white rounded-full p-3 text-[#2E3D88] dark:text-gray-300 border border-[#2E3D88]/30 dark:border-gray-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
            style={{ left: "1.5rem", right: "auto" }}
          >
            <FaArrowLeft size={18} />
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300"
          ref={ref}
        >
          {/* Form Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#2E3D88]/5 to-transparent rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#4A5DB0]/5 to-transparent rounded-tr-3xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[600px]">
            {/* Left Side - Brand Section with Tabs - Hide during Google processing */}
            {!isProcessingGoogle && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-1 bg-gradient-to-br from-[#f0f3ff] to-[#d9e0f5] dark:from-gray-800 dark:to-gray-700 rounded-l-3xl p-8 flex flex-col transition-colors duration-300"
              >
                {/* Brand Content */}
                <div className="space-y-6 mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight text-right">
                    مرحباً بك في{" "}
                    <span className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] bg-clip-text text-transparent">
                      Triple-S
                    </span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-right">
                    انضم إلى مجتمعنا واستمتع بأفضل الخدمات مع نظام أمان متكامل.
                  </p>
                </div>

                {/* Tabs Navigation - Vertical */}
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onTabChange("login");
                      if (window.innerWidth < 1024 && onLoginTabClick) {
                        onLoginTabClick();
                      }
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      activeTab === "login"
                        ? "bg-white dark:bg-gray-800 text-[#2E3D88] dark:text-[#4A5DB0] shadow-lg border border-[#2E3D88]/20 dark:border-[#4A5DB0]/30"
                        : "text-gray-600 dark:text-gray-400 hover:text-[#2E3D88] dark:hover:text-[#4A5DB0] hover:bg-white/50 dark:hover:bg-gray-700/50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-2 h-8 rounded-full ${
                        activeTab === "login"
                          ? "bg-[#2E3D88] dark:bg-[#4A5DB0]"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    ></div>
                    <span className="flex-1 text-right">تسجيل الدخول</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onTabChange("register");
                      if (window.innerWidth < 1024 && onRegisterTabClick) {
                        onRegisterTabClick();
                      }
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      activeTab === "register"
                        ? "bg-white dark:bg-gray-800 text-[#2E3D88] dark:text-[#4A5DB0] shadow-lg border border-[#2E3D88]/20 dark:border-[#4A5DB0]/30"
                        : "text-gray-600 dark:text-gray-400 hover:text-[#2E3D88] dark:hover:text-[#4A5DB0] hover:bg-white/50 dark:hover:bg-gray-700/50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-2 h-8 rounded-full ${
                        activeTab === "register"
                          ? "bg-[#2E3D88] dark:bg-[#4A5DB0]"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    ></div>
                    <span className="flex-1 text-right">إنشاء حساب</span>
                  </motion.button>
                </div>

                {/* Google Login Button - Now in Layout */}
                <div className="mt-6 mb-6">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-gradient-to-br from-[#f0f3ff] to-[#d9e0f5] dark:from-gray-800 dark:to-gray-700 text-gray-500 dark:text-gray-400">
                        أو تابع باستخدام
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={isGoogleLoading}
                    className={`w-full flex items-center justify-center gap-3 font-semibold py-3.5 rounded-xl transition-all duration-300 border ${
                      isGoogleLoading
                        ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg"
                    }`}
                  >
                    {isGoogleLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#DB4437]"></div>
                        <span className="text-gray-700 dark:text-gray-300">
                          جاري التوجيه...
                        </span>
                      </div>
                    ) : (
                      <>
                        <FaGoogle className="text-[#DB4437]" size={20} />
                        <span className="text-gray-700 dark:text-gray-300">
                          {activeTab === "login"
                            ? "تسجيل الدخول عبر Google"
                            : "إنشاء حساب عبر Google"}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Animated Dots */}
                <div className="flex justify-center mt-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="w-3 h-3 bg-[#2E3D88] dark:bg-[#4A5DB0] rounded-full animate-bounce"></div>
                    <div
                      className="w-3 h-3 bg-[#4A5DB0] dark:bg-[#2E3D88] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-[#2E3D88] dark:bg-[#4A5DB0] rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Right Side - Auth Form - Full width during Google processing */}
            <div
              className={`${
                isProcessingGoogle ? "lg:col-span-3" : "lg:col-span-2"
              } flex flex-col justify-center px-6 py-6 md:px-8 md:py-8`}
            >
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
);

AuthLayout.displayName = "AuthLayout";

export default AuthLayout;
