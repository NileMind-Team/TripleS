import React from "react";
import { motion } from "framer-motion";

export default function WaitingConfirmation({
  forgetMode,
  email,
  timer,
  resendDisabled,
  onResendEmail,
  onBackToLogin,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-8 space-y-6 max-w-md mx-auto w-full"
    >
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2E3D88] dark:border-[#4A5DB0]"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4A5DB0] dark:border-[#2E3D88] opacity-75"></div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center">
        {forgetMode
          ? "تم إرسال رمز إعادة التعيين"
          : "في انتظار تأكيد البريد الإلكتروني"}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
        {forgetMode
          ? `لقد أرسلنا رمز إعادة التعيين إلى بريدك الإلكتروني ${email}. يرجى التحقق من صندوق الوارد لإعادة تعيين كلمة المرور.`
          : `لقد أرسلنا بريد تأكيد إلى ${email}. يرجى التحقق من صندوق الوارد وتأكيد حسابك.`}
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onResendEmail}
        disabled={resendDisabled}
        className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
          resendDisabled
            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-xl hover:shadow-[#2E3D88]/25 dark:hover:shadow-[#4A5DB0]/25"
        }`}
      >
        {resendDisabled
          ? `إعادة الإرسال بعد ${timer} ثانية`
          : `إعادة إرسال ${forgetMode ? "رمز إعادة التعيين" : "بريد التأكيد"}`}
        {!resendDisabled && (
          <div className="absolute inset-0 bg-white/20 translate-x-full hover:translate-x-0 transition-transform duration-700"></div>
        )}
      </motion.button>

      <button
        onClick={onBackToLogin}
        className="text-[#2E3D88] dark:text-[#4A5DB0] hover:text-[#4A5DB0] dark:hover:text-[#2E3D88] underline font-medium transition-colors duration-200 text-sm"
      >
        العودة إلى تسجيل الدخول
      </button>
    </motion.div>
  );
}
