import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from "react-helmet-async";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // دالة لعرض رسائل النجاح والفشل على الموبايل باستخدام toast
  const showMobileMessage = (type, title, text) => {
    if (window.innerWidth < 768) {
      // عرض رسائل النجاح والفشل العادية (بدون أزرار) باستخدام toast
      if (type === "success") {
        toast.success(text, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            width: "70%",
            margin: "10px",
            borderRadius: "8px",
            textAlign: "right",
            fontSize: "14px",
            direction: "rtl",
          },
        });
      } else if (type === "error") {
        toast.error(text, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            width: "70%",
            margin: "10px",
            borderRadius: "8px",
            textAlign: "right",
            fontSize: "14px",
            direction: "rtl",
          },
        });
      } else if (type === "info") {
        toast.info(text, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            width: "70%",
            margin: "10px",
            borderRadius: "8px",
            textAlign: "right",
            fontSize: "14px",
            direction: "rtl",
          },
        });
      }
      return true;
    }
    return false;
  };

  const passwordValidations = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    specialChar: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword !== "" && newPassword === confirmPassword,
  };

  const allFieldsFilled =
    newPassword.trim() !== "" && confirmPassword.trim() !== "";
  const allPasswordValid = Object.values(passwordValidations).every(Boolean);
  const isFormValid = allFieldsFilled && allPasswordValid;

  const getValidationItem = (condition, label) => (
    <div className="flex items-center gap-2 text-sm">
      {condition ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-gray-400" />
      )}
      <span className={condition ? "text-green-600" : "text-gray-500"}>
        {label}
      </span>
    </div>
  );

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      // استخدام toast للموبايل بدلاً من Swal
      const isMobile = showMobileMessage(
        "error",
        "كلمة المرور لا تلبي المتطلبات",
        "يرجى التأكد من استيفاء جميع شروط كلمة المرور",
      );

      if (!isMobile) {
        Swal.fire({
          icon: "error",
          title: "كلمة المرور لا تلبي المتطلبات",
          text: "يرجى التأكد من استيفاء جميع شروط كلمة المرور",
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/api/Auth/ResetPassword",
        { email, code, newPassword },
        { headers: { "Content-Type": "application/json" } },
      );

      setMessage(res.data.message || "تم إعادة تعيين كلمة المرور بنجاح.");
      setSuccess(true);

      // استخدام toast للموبايل بدلاً من Swal
      const isMobile = showMobileMessage(
        "success",
        "تم إعادة تعيين كلمة المرور بنجاح",
        res.data.message || "تم إعادة تعيين كلمة المرور بنجاح.",
      );

      if (!isMobile) {
        Swal.fire({
          icon: "success",
          title: "تم إعادة تعيين كلمة المرور بنجاح",
          text: res.data.message || "تم إعادة تعيين كلمة المرور بنجاح.",
          showConfirmButton: false,
          timer: 2000,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور.";
      setMessage(errorMsg);
      setSuccess(false);

      // استخدام toast للموبايل بدلاً من Swal
      const isMobile = showMobileMessage(
        "error",
        "فشل إعادة تعيين كلمة المرور",
        errorMsg,
      );

      if (!isMobile) {
        Swal.fire({
          icon: "error",
          title: "فشل إعادة تعيين كلمة المرور",
          text: errorMsg,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Triple-S | تريبل اس</title>
        <meta
          name="description"
          content="تريبل اس شركة برمجيات تقدم تطوير مواقع وتطبيقات وأنظمة إدارة حديثة، بحلول رقمية احترافية تعزز حضورك الرقمي وتدعم نمو أعمالك."
        />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4 relative font-sans overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 dark:from-[#E41E26]/20 dark:to-[#FDB913]/20 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 dark:from-[#FDB913]/20 dark:to-[#E41E26]/20 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E41E26]/5 to-transparent rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#FDB913]/5 to-transparent rounded-tr-3xl"></div>

          <div className="p-8">
            {!loading && message ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                <div
                  className={`rounded-full p-4 ${
                    success
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {success ? (
                    <svg
                      className="w-16 h-16 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-16 h-16 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent text-center">
                  {success
                    ? "تم إعادة تعيين كلمة المرور بنجاح"
                    : "فشل إعادة التعيين"}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 text-center text-lg leading-relaxed">
                  {message}
                </p>

                {success && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/login")}
                    className="mt-4 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-[#E41E26]/25 transition-all duration-300"
                  >
                    العودة لتسجيل الدخول
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent">
                    إعادة تعيين كلمة المرور
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
                    أدخل كلمة المرور الجديدة أدناه
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                      <FaLock className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] cursor-pointer transition-all duration-200 hover:scale-110"
                      >
                        {showPassword ? (
                          <FaEyeSlash size={18} />
                        ) : (
                          <FaEye size={18} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
                      <FaLock className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="تأكيد كلمة المرور الجديدة"
                      className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
                      <div
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] cursor-pointer transition-all duration-200 hover:scale-110"
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash size={18} />
                        ) : (
                          <FaEye size={18} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl border border-[#FDB913]/30 dark:border-gray-600 space-y-2 transition-colors duration-300">
                    <p className="text-sm font-semibold text-[#E41E26] dark:text-[#FDB913]">
                      متطلبات كلمة المرور:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {getValidationItem(
                        passwordValidations.length,
                        "8 أحرف على الأقل",
                      )}
                      {getValidationItem(
                        passwordValidations.lowercase,
                        "حرف صغير واحد على الأقل",
                      )}
                      {getValidationItem(
                        passwordValidations.uppercase,
                        "حرف كبير واحد على الأقل",
                      )}
                      {getValidationItem(
                        passwordValidations.specialChar,
                        "رمز خاص واحد على الأقل",
                      )}
                      {getValidationItem(
                        passwordValidations.match,
                        "كلمتا المرور متطابقتان",
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!isFormValid || loading}
                    className={`w-full font-semibold py-4 rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
                      isFormValid
                        ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 dark:hover:shadow-[#FDB913]/25"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري إعادة تعيين كلمة المرور...
                      </div>
                    ) : (
                      <>
                        إعادة تعيين كلمة المرور
                        <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="flex space-x-2 justify-center mt-8">
                  <div className="w-3 h-3 bg-[#E41E26] rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-[#FDB913] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-[#E41E26] rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
