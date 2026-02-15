import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginForm({
  email,
  password,
  showPassword,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onToggleShowPassword,
  onForgotPassword,
  onSubmit,
}) {
  const isDisabled = !email || !password || isLoading;

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="space-y-6 max-w-md mx-auto w-full"
    >
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] bg-clip-text text-transparent">
          مرحباً بعودتك
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          سجل الدخول إلى حسابك في Triple-S
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaEnvelope className="text-[#2E3D88] dark:text-[#4A5DB0] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="البريد الإلكتروني"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3D88] dark:focus:ring-[#4A5DB0] focus:border-transparent transition-all duration-200 group-hover:border-[#2E3D88]/50 dark:group-hover:border-[#4A5DB0]/50 text-right"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaLock className="text-[#2E3D88] dark:text-[#4A5DB0] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-12 py-3.5 outline-none focus:ring-2 focus:ring-[#2E3D88] dark:focus:ring-[#4A5DB0] focus:border-transparent transition-all duration-200 group-hover:border-[#2E3D88]/50 dark:group-hover:border-[#4A5DB0]/50 text-right"
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <div
              onClick={onToggleShowPassword}
              className="text-gray-500 dark:text-gray-400 hover:text-[#2E3D88] dark:hover:text-[#4A5DB0] cursor-pointer transition-all duration-200 hover:scale-110"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[#2E3D88] dark:text-[#4A5DB0] hover:text-[#4A5DB0] dark:hover:text-[#2E3D88] underline text-sm font-medium transition-all duration-200"
        >
          نسيت كلمة المرور؟
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isDisabled}
        className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
          !isDisabled
            ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-xl hover:shadow-[#2E3D88]/25 dark:hover:shadow-[#4A5DB0]/25"
            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
            جاري تسجيل الدخول...
          </div>
        ) : (
          <>
            تسجيل الدخول
            <div className="absolute inset-0 bg-white/20 translate-x-full hover:translate-x-0 transition-transform duration-700"></div>
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
