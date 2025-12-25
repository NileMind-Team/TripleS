import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaCity,
  FaPlus,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      confirmButtonColor: options.confirmButtonColor || "#E41E26",
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

  if (Array.isArray(errorData.errors)) {
    const error = errorData.errors[0];
    switch (error.code) {
      case "User.InvalidCredentials":
        return "اسم المستخدم أو كلمة المرور غير صحيحة";
      default:
        return error.description || "حدث خطأ في المصادقة";
    }
  }

  if (errorData.errors && typeof errorData.errors === "object") {
    const errorMessages = [];

    if (errorData.errors.Name) {
      errorData.errors.Name.forEach((msg) => {
        if (
          msg.toLowerCase().includes("already used") ||
          msg.toLowerCase().includes("مستخدم") ||
          msg === "name is already used."
        ) {
          errorMessages.push("اسم المدينة مستخدم بالفعل");
        } else if (
          msg.toLowerCase().includes("required") ||
          msg.toLowerCase().includes("مطلوب")
        ) {
          errorMessages.push("اسم المدينة مطلوب");
        } else if (
          msg.toLowerCase().includes("length") ||
          msg.toLowerCase().includes("طول")
        ) {
          errorMessages.push("اسم المدينة يجب أن يكون بين 3 و 100 حرف");
        } else {
          const translated = msg
            .replace("name", "الاسم")
            .replace("is required", "مطلوب")
            .replace("must be", "يجب أن يكون")
            .replace("characters", "حروف")
            .replace("minimum", "الحد الأدنى")
            .replace("maximum", "الحد الأقصى");
          errorMessages.push(translated);
        }
      });
    }

    if (errorData.errors.UserName) {
      errorData.errors.UserName.forEach((msg) => {
        if (msg.includes("letters, numbers, and underscores")) {
          errorMessages.push(
            "اسم المستخدم يجب أن يحتوي فقط على أحرف و أرقام وشرطة سفلية"
          );
        } else if (msg.includes("required")) {
          errorMessages.push("اسم المستخدم مطلوب");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    if (errorData.errors.Password) {
      errorData.errors.Password.forEach((msg) => {
        if (msg.includes("at least 6 characters")) {
          errorMessages.push("كلمة المرور يجب أن تحتوي على الأقل 6 أحرف");
        } else if (msg.includes("required")) {
          errorMessages.push("كلمة المرور مطلوبة");
        } else {
          errorMessages.push(msg);
        }
      });
    }

    Object.keys(errorData.errors).forEach((key) => {
      if (!["Name", "UserName", "Password"].includes(key)) {
        errorData.errors[key].forEach((msg) => {
          const translatedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

          const translatedMsg = msg
            .replace("is required", "مطلوب")
            .replace("must be", "يجب أن يكون")
            .replace("invalid", "غير صالح");

          errorMessages.push(`${translatedKey}: ${translatedMsg}`);
        });
      }
    });

    if (errorMessages.length > 1) {
      return errorMessages.join("<br>");
    } else if (errorMessages.length === 1) {
      return errorMessages[0];
    } else {
      return "بيانات غير صالحة";
    }
  }

  if (typeof errorData.message === "string") {
    const msg = errorData.message.toLowerCase();
    if (msg.includes("invalid") || msg.includes("credentials")) {
      return "اسم المستخدم أو كلمة المرور غير صحيحة";
    }
    if (msg.includes("network") || msg.includes("internet")) {
      return "يرجى التحقق من اتصالك بالإنترنت";
    }
    if (msg.includes("timeout") || msg.includes("time out")) {
      return "انتهت المهلة، يرجى المحاولة مرة أخرى";
    }
    if (msg.includes("not found") || msg.includes("404")) {
      return "لم يتم العثور على المدينة المطلوبة";
    }
    if (msg.includes("unauthorized") || msg.includes("401")) {
      return "غير مصرح لك بهذا الإجراء";
    }
    if (msg.includes("forbidden") || msg.includes("403")) {
      return "ليس لديك صلاحية للقيام بهذا الإجراء";
    }
    return errorData.message;
  }

  if (errorData.title) {
    if (errorData.title.includes("validation errors")) {
      return "حدثت أخطاء في التحقق من البيانات";
    }
  }

  return "حدث خطأ غير متوقع";
};

const showErrorAlert = (errorData) => {
  const translatedMessage = translateErrorMessage(errorData);

  if (isMobile()) {
    showMessage("error", "خطأ", translatedMessage);
  } else {
    Swal.fire({
      icon: "error",
      title: "خطأ",
      html: translatedMessage,
      showConfirmButton: false,
      timer: 2500,
      background: "#ffffff",
      color: "#000000",
      customClass: {
        popup: "error-popup",
        title: "error-title",
        htmlContainer: "error-message",
      },
    });
  }
};

export default function CitiesManagement() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
  });

  // Check user role from API endpoint using axios
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          setDataLoading(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const userRoles = userData.roles || [];

        const hasAdminOrRestaurantOrBranchRole =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);

        if (!hasAdminOrRestaurantOrBranchRole) {
          navigate("/");
          return;
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  // Fetch cities from API
  const fetchCities = async () => {
    setDataLoading(true);
    try {
      const response = await axiosInstance.get("/api/Cities/GetAll");
      if (response.status === 200) {
        setCities(response.data);
        setFilteredCities(response.data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      showErrorAlert(error.response?.data);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrRestaurantOrBranch) {
      fetchCities();
    }
  }, [isAdminOrRestaurantOrBranch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showMessage("error", "معلومات ناقصة", "يرجى إدخال اسم المدينة", {
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing city
        await axiosInstance.put(`/api/Cities/Update/${editingId}`, formData);

        // Refresh data after successful update
        await fetchCities();

        showMessage("success", "تم التحديث", "تم تحديث المدينة بنجاح", {
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Add new city
        await axiosInstance.post("/api/Cities/Add", formData);

        // Refresh data after successful add
        await fetchCities();

        showMessage("success", "تم الإضافة", "تم إضافة المدينة بنجاح", {
          timer: 2000,
          showConfirmButton: false,
        });
      }

      resetForm();
    } catch (err) {
      showErrorAlert(err.response?.data);
    }
  };

  const handleEdit = (city) => {
    setFormData({
      name: city.name,
    });
    setEditingId(city.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddNewCity = () => {
    setIsAdding(true);
  };

  // Check if required field is filled
  const isFormValid = () => {
    return formData.name.trim() !== "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  if (!isAdminOrRestaurantOrBranch) {
    return null;
  }

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] hover:bg-[#E41E26] hover:text-white transition-all duration-300 shadow-lg dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#E41E26]"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                  إدارة المدن
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  إدارة مدن التوصيل المتاحة
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
                {cities.length} مدينة
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                إجمالي المدن
              </div>
            </div>
          </motion.div>

          {/* Add New City Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative z-30 dark:bg-gray-800/90"
          >
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddNewCity}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
              >
                <FaPlus className="text-sm" />
                <span className="hidden sm:inline">إضافة مدينة</span>
                <span className="sm:hidden">إضافة</span>
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Cities List */}
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              {/* Loading State for Data */}
              {dataLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#E41E26] mx-auto mb-4"></div>
                </motion.div>
              ) : (
                <>
                  <AnimatePresence>
                    {filteredCities.map((city, index) => (
                      <motion.div
                        key={city.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 dark:bg-gray-800/90"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className="p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-500">
                                <FaCity className="text-[#E41E26] dark:text-[#FDB913] text-lg sm:text-xl" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg sm:text-xl">
                                  {city.name}
                                </h3>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(city)}
                              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                            >
                              <FaEdit className="text-xs sm:text-sm" />
                              <span className="whitespace-nowrap">تعديل</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredCities.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600"
                    >
                      <FaCity className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                        لا توجد مدن
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                        أضف أول مدينة للبدء
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddNewCity}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                      >
                        <FaPlus className="text-xs sm:text-sm" />
                        <span>أضف أول مدينة</span>
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Add/Edit City Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-5 lg:p-6 border border-gray-200/50 dark:bg-gray-800/90 dark:border-gray-600 sticky top-4 sm:top-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                        {editingId ? "تعديل المدينة" : "إضافة مدينة جديدة"}
                      </h3>
                      <button
                        onClick={resetForm}
                        className="text-gray-500 hover:text-[#E41E26] dark:text-gray-400 dark:hover:text-[#FDB913] transition-colors duration-200 flex-shrink-0 ml-2"
                      >
                        <FaTimes size={16} className="sm:size-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* City Name */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          اسم المدينة *
                        </label>
                        <div className="relative group">
                          <FaCity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                            placeholder="أدخل اسم المدينة"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetForm}
                          className="flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] hover:text-white transition-all duration-300 text-sm sm:text-base"
                        >
                          إلغاء
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!isFormValid()}
                          className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                            isFormValid()
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <FaSave className="text-xs sm:text-sm" />
                          {editingId ? "تحديث" : "حفظ"}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
