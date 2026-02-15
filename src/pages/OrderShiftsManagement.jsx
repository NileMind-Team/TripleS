import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaPlay,
  FaStop,
  FaPause,
  FaPlayCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from "react-helmet-async";

const isMobile = () => {
  return window.innerWidth < 768;
};

const showMessage = (type, title, text, options = {}) => {
  if (isMobile() && !options.forceSwal) {
    const toastOptions = {
      position: "top-right",
      autoClose: options.timer || 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        width: "70vw",
        maxWidth: "none",
        minWidth: "200px",
        fontSize: "14px",
        borderRadius: "8px",
        right: "0",
        top: "0",
        margin: "0",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        zIndex: 9999,
      },
      bodyStyle: {
        padding: "12px 16px",
        textAlign: "right",
        direction: "rtl",
        width: "100%",
        overflow: "hidden",
        margin: 0,
      },
    };

    switch (type) {
      case "success":
        toast.success(text, toastOptions);
        break;
      case "error":
        toast.error(text, toastOptions);
        break;
      case "warning":
        toast.warning(text, toastOptions);
        break;
      case "info":
        toast.info(text, toastOptions);
        break;
      default:
        toast(text, toastOptions);
    }
  } else {
    Swal.fire({
      icon: type,
      title: title,
      text: text,
      confirmButtonColor: options.confirmButtonColor || "#2E3D88",
      timer: options.timer || 2500,
      showConfirmButton:
        options.showConfirmButton !== undefined
          ? options.showConfirmButton
          : false,
      ...options,
    });
  }
};

const translateErrorMessage = (errorData) => {
  if (!errorData) return "حدث خطأ غير معروف";

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (errorData.errors.Name) {
      errorData.errors.Name.forEach((msg) => {
        if (msg.includes("مطلوب") || msg.includes("required")) {
          errorMessages.push("اسم الوردية مطلوب");
        } else if (msg.includes("مستخدم") || msg.includes("already used")) {
          errorMessages.push("اسم الوردية مستخدم بالفعل");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorMessages.length > 0) {
      return errorMessages.join("، ");
    }
  }

  if (typeof errorData.message === "string") {
    const msg = errorData.message.toLowerCase();
    if (msg.includes("unauthorized") || msg.includes("401")) {
      return "غير مصرح لك بهذا الإجراء";
    }
    if (msg.includes("forbidden") || msg.includes("403")) {
      return "ليس لديك صلاحية للقيام بهذا الإجراء";
    }
    if (msg.includes("network") || msg.includes("internet")) {
      return "يرجى التحقق من اتصالك بالإنترنت";
    }
    return errorData.message;
  }

  return "حدث خطأ غير متوقع";
};

const showErrorAlert = (errorData) => {
  const translatedMessage = translateErrorMessage(errorData);
  showMessage("error", "خطأ", translatedMessage);
};

const addTwoHoursAndFormatTo12Hour = (timeString) => {
  if (!timeString) return "غير محدد";

  try {
    const timeMatch = timeString.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!timeMatch) return "غير محدد";

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    const dateMatch = timeString.match(/(\d{4})-(\d{2})-(\d{2})T/);
    let dateText = "";

    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const day = parseInt(dateMatch[3]);

      let adjustedHours = hours + 2;
      let adjustedDay = day;
      let adjustedMonth = month;
      let adjustedYear = year;

      if (adjustedHours >= 24) {
        adjustedHours = adjustedHours % 24;
        adjustedDay = adjustedDay + 1;

        const newDate = new Date(adjustedYear, adjustedMonth - 1, adjustedDay);
        adjustedDay = newDate.getDate();
        adjustedMonth = newDate.getMonth() + 1;
        adjustedYear = newDate.getFullYear();
      }

      const arabicNumbers = {
        0: "٠",
        1: "١",
        2: "٢",
        3: "٣",
        4: "٤",
        5: "٥",
        6: "٦",
        7: "٧",
        8: "٨",
        9: "٩",
      };

      const convertToArabicNumbers = (num) => {
        return num
          .toString()
          .split("")
          .map((digit) => arabicNumbers[digit] || digit)
          .join("");
      };

      const arabicYear = convertToArabicNumbers(adjustedYear);
      const arabicMonth = convertToArabicNumbers(adjustedMonth);
      const arabicDay = convertToArabicNumbers(adjustedDay);

      dateText = `${arabicYear}/${arabicMonth}/${arabicDay}`;
    } else {
      const now = new Date();
      const arabicNumbers = {
        0: "٠",
        1: "١",
        2: "٢",
        3: "٣",
        4: "٤",
        5: "٥",
        6: "٦",
        7: "٧",
        8: "٨",
        9: "٩",
      };

      const convertToArabicNumbers = (num) => {
        return num
          .toString()
          .split("")
          .map((digit) => arabicNumbers[digit] || digit)
          .join("");
      };

      const arabicYear = convertToArabicNumbers(now.getFullYear());
      const arabicMonth = convertToArabicNumbers(now.getMonth() + 1);
      const arabicDay = convertToArabicNumbers(now.getDate());

      dateText = `${arabicYear}/${arabicMonth}/${arabicDay}`;
    }

    let newHours = hours + 2;

    if (newHours >= 24) {
      newHours = newHours % 24;
    }

    let period = "ص";
    let displayHours = newHours;

    if (newHours === 0) {
      displayHours = 12;
    } else if (newHours === 12) {
      displayHours = 12;
      period = "م";
    } else if (newHours > 12) {
      displayHours = newHours - 12;
      period = "م";
    } else if (newHours < 12) {
      displayHours = newHours;
      period = "ص";
    }

    const arabicNumbers = {
      0: "٠",
      1: "١",
      2: "٢",
      3: "٣",
      4: "٤",
      5: "٥",
      6: "٦",
      7: "٧",
      8: "٨",
      9: "٩",
    };

    const convertToArabicNumbers = (num) => {
      return num
        .toString()
        .split("")
        .map((digit) => arabicNumbers[digit] || digit)
        .join("");
    };

    const formattedHours = convertToArabicNumbers(displayHours);
    const formattedMinutes = convertToArabicNumbers(
      minutes.toString().padStart(2, "0"),
    );

    return `${dateText} الساعة ${formattedHours}:${formattedMinutes} ${period}`;
  } catch (error) {
    console.error("Error processing time:", error, timeString);
    return "غير محدد";
  }
};

export default function OrderShiftsManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    customName: "",
  });

  const shiftTypes = [
    { value: "صباحي", label: "صباحي" },
    { value: "مسائي", label: "مسائي" },
  ];

  const checkActiveShift = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/OrderShifts/GetAvailableShifts",
      );

      if (response.data && response.data.length > 0) {
        const activeShiftData = response.data.find(
          (shift) => shift.end === null,
        );

        if (activeShiftData) {
          setActiveShift({
            id: activeShiftData.id,
            name: activeShiftData.name,
            start: activeShiftData.start,
            isActive: activeShiftData.isActive,
            branchId: activeShiftData.branchId,
          });
        } else {
          setActiveShift(null);
        }
      } else {
        setActiveShift(null);
      }
    } catch (error) {
      console.error("Error checking active shift:", error);
      setActiveShift(null);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get("/api/Account/Profile");
      if (response.data && response.data.roles) {
        setUserRoles(response.data.roles);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const canStartShift = () => {
    return !(userRoles.includes("Admin") || userRoles.includes("Restaurant"));
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        await fetchUserProfile();
        await checkActiveShift();
      } catch (error) {
        console.error("Error loading page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStartShift = async () => {
    if (!formData.name.trim()) {
      showMessage(
        "error",
        "معلومات ناقصة",
        "يرجى اختيار أو كتابة اسم الوردية",
        {
          timer: 2000,
          showConfirmButton: false,
        },
      );
      return;
    }

    try {
      const shiftName =
        formData.name === "custom" ? formData.customName : formData.name;

      const response = await axiosInstance.post("/api/OrderShifts/StartShift", {
        name: shiftName,
      });

      // eslint-disable-next-line no-unused-vars
      const shiftData = response.data;

      await checkActiveShift();

      showMessage("success", "تم البدء", "تم بدء الوردية بنجاح", {
        timer: 2000,
        showConfirmButton: false,
      });

      resetForm();
    } catch (err) {
      showErrorAlert(err.response?.data);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    Swal.fire({
      title: "إنهاء الوردية",
      text: "هل أنت متأكد من إنهاء الوردية الحالية؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3D88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، أنهِ الوردية",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.put(
            `/api/OrderShifts/EndShift/${activeShift.id}`,
          );

          await checkActiveShift();

          showMessage("success", "تم الإنهاء", "تم إنهاء الوردية بنجاح", {
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          showErrorAlert(err.response?.data);
        }
      }
    });
  };

  const handleToggleShiftStatus = async () => {
    if (!activeShift) return;

    const action = activeShift.isActive ? "تعطيل" : "تفعيل";
    const actionText = activeShift.isActive ? "تعطيل الوردية" : "تفعيل الوردية";
    const confirmText = activeShift.isActive
      ? "هل أنت متأكد من تعطيل الوردية الحالية؟"
      : "هل أنت متأكد من تفعيل الوردية الحالية؟";

    Swal.fire({
      title: actionText,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3D88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}`,
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.put(
            `/api/OrderShifts/ChangeStatus/${activeShift.id}`,
          );

          await checkActiveShift();

          showMessage("success", `تم ${action}`, `تم ${action} الوردية بنجاح`, {
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          showErrorAlert(err.response?.data);
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      customName: "",
    });
  };

  const isFormValid = () => {
    if (formData.name === "custom") {
      return formData.customName.trim() !== "";
    }
    return formData.name.trim() !== "";
  };

  const canUserStartShift = canStartShift();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#f0f3ff] to-[#d9e0f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2E3D88]"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Triple-S | تريبل اس</title>
        <meta
          name="description"
          content="تريبل اس شركة برمجيات تقدم تطوير مواقع وتطبيقات وأنظمة إدارة حديثة، بحلول رقمية احترافية تعزز حضورك الرقمي وتدعم نمو أعمالك."
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f0f3ff] to-[#d9e0f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#2E3D88] hover:bg-[#2E3D88] hover:text-white transition-all duration-300 shadow-lg dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#2E3D88]"
            >
              <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                الورديات
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                إدارة ورديات الطلبات
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-5 lg:p-6 border border-gray-200/50 dark:bg-gray-800/90 dark:border-gray-600 transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                {activeShift ? "تفاصيل الوردية الحالية" : "بدء وردية جديدة"}
              </h3>
              {activeShift && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 sm:px-3 py-1 bg-gradient-to-r ${
                      activeShift.isActive
                        ? "from-green-500 to-emerald-500"
                        : "from-yellow-500 to-orange-500"
                    } text-white text-xs sm:text-sm rounded-full`}
                  >
                    {activeShift.isActive ? "نشطة" : "معطلة"}
                  </span>
                  {!activeShift.isActive && (
                    <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs sm:text-sm rounded-full">
                      غير مفعلة
                    </span>
                  )}
                </div>
              )}
            </div>

            {activeShift ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-green-200 dark:border-green-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        اسم الوردية
                      </p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {activeShift.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        بدأت منذ
                      </p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {addTwoHoursAndFormatTo12Hour(activeShift.start)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        حالة الوردية
                      </p>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {activeShift.isActive ? "مفعلة" : "معطلة"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleToggleShiftStatus}
                    className={`w-full py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 ${
                      activeShift.isActive
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-xl hover:shadow-yellow-500/25"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:shadow-green-500/25"
                    } cursor-pointer`}
                  >
                    {activeShift.isActive ? (
                      <>
                        <FaPause className="text-sm" />
                        تعطيل الوردية
                      </>
                    ) : (
                      <>
                        <FaPlayCircle className="text-sm" />
                        تفعيل الوردية
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEndShift}
                    className="w-full py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-xl hover:shadow-[#2E3D88]/25 cursor-pointer"
                  >
                    <FaStop className="text-sm" />
                    إنهاء الوردية الحالية
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    نوع الوردية *
                  </label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {shiftTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              name: type.value,
                              customName: "",
                            })
                          }
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            formData.name === type.value
                              ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white border-transparent"
                              : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#2E3D88] cursor-pointer"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            name: "custom",
                            customName: formData.customName || "",
                          })
                        }
                        className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                          formData.name === "custom"
                            ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white border-transparent"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#2E3D88] cursor-pointer"
                        }`}
                      >
                        اسم مخصص
                      </button>

                      {formData.name === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-3"
                        >
                          <div className="relative group">
                            <input
                              type="text"
                              name="customName"
                              value={formData.customName}
                              onChange={handleInputChange}
                              required
                              className="w-full border bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg px-4 py-3 outline-none transition-all duration-200 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent"
                              placeholder="أدخل اسم الوردية المخصص"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetForm}
                    className="flex-1 py-3 border-2 border-[#2E3D88] text-[#2E3D88] rounded-lg font-semibold hover:bg-[#2E3D88] hover:text-white transition-all duration-300"
                  >
                    إلغاء
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartShift}
                    disabled={!isFormValid() || !canUserStartShift}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isFormValid() && canUserStartShift
                        ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-xl hover:shadow-[#2E3D88]/25 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <FaPlay className="text-sm" />
                    {!canUserStartShift
                      ? "غير مسموح ببدء الوردية"
                      : "بدء الوردية"}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
