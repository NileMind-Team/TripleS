import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPercent,
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaStore,
  FaHamburger,
  FaTag,
  FaClock,
  FaChevronDown,
  FaSpinner,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function ItemOffersManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProductId = location.state?.selectedProductId || "";
  const selectedOfferId = location.state?.selectedOfferId || null;

  const [formData, setFormData] = useState({
    menuItemId: selectedProductId.toString() || "",
    isPercentage: true,
    discountValue: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    isEnabled: true,
    branchesIds: [],
  });

  useEffect(() => {
    const checkUserRoleAndFetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          return;
        }

        const userResponse = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = userResponse.data;
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

        const branchesResponse = await axiosInstance.get(
          "/api/Branches/GetList"
        );
        setBranches(branchesResponse.data);

        await fetchOffers(branchesResponse.data);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
          setIsAdminOrRestaurantOrBranch(false);
          navigate("/");
          return;
        }

        Swal.fire({
          icon: "error",
          title: "خطأ في الاتصال",
          text: "حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setLoading(false);
      }
    };

    checkUserRoleAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (selectedProductId && !loading) {
      handleAddNewOffer();
    }

    if (selectedOfferId && offers.length > 0) {
      const existingOffer = offers.find(
        (offer) => offer.id === selectedOfferId
      );
      if (existingOffer) {
        handleEdit(existingOffer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, selectedOfferId, loading, offers]);

  useEffect(() => {
    if (selectedProductId) {
      setFormData((prev) => ({
        ...prev,
        menuItemId: selectedProductId.toString(),
      }));
    }
  }, [selectedProductId]);

  const fetchOffers = async (branchesList = branches) => {
    try {
      const response = await axiosInstance.get("/api/ItemOffers/GetAll");
      const offersData = response.data;

      const offersWithDetails = await Promise.all(
        offersData.map(async (offer) => {
          try {
            const menuItemResponse = await axiosInstance.get(
              `/api/MenuItems/Get/${offer.menuItemId}`
            );

            let branchNames = [];
            if (offer.branchesIds && offer.branchesIds.length > 0) {
              branchNames = offer.branchesIds.map((branchId) => {
                const branch = branchesList.find((b) => b.id === branchId);
                return branch ? branch.name : `فرع #${branchId}`;
              });
            } else {
              branchNames = branchesList.map((b) => b.name);
            }

            return {
              ...offer,
              menuItem: menuItemResponse.data,
              branchNames: branchNames,
            };
          } catch (error) {
            console.error(`خطأ في جلب العنصر ${offer.menuItemId}:`, error);
            return {
              ...offer,
              menuItem: null,
              branchNames: [],
            };
          }
        })
      );

      setOffers(offersWithDetails);
      setFilteredOffers(offersWithDetails);
    } catch (error) {
      console.error("خطأ في جلب العروض:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل بيانات العروض",
      });
    }
  };

  const fetchMenuItems = async () => {
    setLoadingItems(true);
    try {
      const response = await axiosInstance.get(
        "/api/MenuItems/GetAllWithoutPagination"
      );

      const itemsWithoutActiveOffers = response.data.filter((item) => {
        if (!item.itemOffer) return true;

        const offer = item.itemOffer;
        const now = new Date();
        const startDate = new Date(offer.startDate);
        const endDate = new Date(offer.endDate);

        return !(offer.isEnabled && startDate <= now && endDate >= now);
      });

      setMenuItems(itemsWithoutActiveOffers);
    } catch (error) {
      console.error("خطأ في جلب العناصر:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل العناصر",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    let filtered = offers;

    if (searchTerm) {
      filtered = filtered.filter((offer) => {
        if (offer.menuItem) {
          const itemMatch =
            offer.menuItem.name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            offer.menuItem.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase());

          const branchMatch = offer.branchNames.some((name) =>
            name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return itemMatch || branchMatch;
        }
        return false;
      });
    }

    setFilteredOffers(filtered);
  }, [searchTerm, offers]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleBranchesChange = (branchId) => {
    setFormData((prev) => {
      if (prev.branchesIds.includes(branchId)) {
        return {
          ...prev,
          branchesIds: prev.branchesIds.filter((id) => id !== branchId),
        };
      } else {
        return {
          ...prev,
          branchesIds: [...prev.branchesIds, branchId],
        };
      }
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setOpenDropdown(null);
  };

  const formatDateTimeForAPI = (date, time) => {
    if (!date) return "";

    const dateObj = new Date(date);

    if (time) {
      const [hours, minutes] = time.split(":");
      dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      dateObj.setHours(0, 0, 0, 0);
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hour = String(dateObj.getHours()).padStart(2, "0");
    const minute = String(dateObj.getMinutes()).padStart(2, "0");
    const second = String(dateObj.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.menuItemId ||
      !formData.discountValue ||
      !formData.startDate ||
      !formData.endDate
    ) {
      Swal.fire({
        icon: "error",
        title: "معلومات ناقصة",
        text: "يرجى ملء جميع الحقول المطلوبة",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (formData.branchesIds.length === 0) {
      Swal.fire({
        icon: "error",
        title: "لم يتم اختيار فروع",
        text: "يرجى اختيار فرع واحد على الأقل",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const offerData = {
        menuItemId: parseInt(formData.menuItemId),
        isPercentage: formData.isPercentage,
        discountValue: parseFloat(formData.discountValue),
        startDate: formatDateTimeForAPI(formData.startDate, formData.startTime),
        endDate: formatDateTimeForAPI(formData.endDate, formData.endTime),
        isEnabled: formData.isEnabled,
        branchesIds: formData.branchesIds.map((id) => parseInt(id)),
      };

      console.log("إرسال بيانات العرض:", offerData);

      if (editingId) {
        const res = await axiosInstance.put(
          `/api/ItemOffers/Update/${editingId}`,
          offerData
        );
        if (res.status === 200 || res.status === 204) {
          Swal.fire({
            icon: "success",
            title: "تم تحديث العرض",
            text: "تم تحديث عرض العنصر بنجاح.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        const res = await axiosInstance.post("/api/ItemOffers/Add", offerData);
        if (res.status === 200 || res.status === 201) {
          Swal.fire({
            icon: "success",
            title: "تم إضافة العرض",
            text: "تم إضافة عرض العنصر الجديد بنجاح.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }

      resetForm();
      fetchOffers();
      fetchMenuItems();
    } catch (err) {
      console.error("خطأ في حفظ العرض:", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: err.response?.data?.message || "فشل في حفظ عرض العنصر.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (offer) => {
    const startDateObj = new Date(offer.startDate);
    const endDateObj = new Date(offer.endDate);

    const currentBranchesIds =
      offer.branchesIds && offer.branchesIds.length > 0
        ? offer.branchesIds
        : branches.map((branch) => branch.id);

    setFormData({
      menuItemId: offer.menuItemId.toString(),
      isPercentage: offer.isPercentage,
      discountValue: offer.discountValue.toString(),
      startDate: startDateObj.toISOString().split("T")[0],
      startTime: startDateObj.toTimeString().slice(0, 5),
      endDate: endDateObj.toISOString().split("T")[0],
      endTime: endDateObj.toTimeString().slice(0, 5),
      isEnabled: offer.isEnabled,
      branchesIds: currentBranchesIds,
    });
    setEditingId(offer.id);
    setIsAdding(true);
    fetchMenuItems();
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/ItemOffers/Delete/${id}`);
          fetchOffers();
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف عرض العنصر.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchMenuItems();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف عرض العنصر.",
          });
        }
      }
    });
  };

  const handleToggleActive = async (id, e) => {
    e.stopPropagation();

    const offer = offers.find((o) => o.id === id);
    if (!offer) return;

    const offerData = {
      menuItemId: offer.menuItemId,
      isPercentage: offer.isPercentage,
      discountValue: offer.discountValue,
      startDate: offer.startDate,
      endDate: offer.endDate,
      isEnabled: !offer.isEnabled,
      branchesIds: offer.branchesIds || branches.map((branch) => branch.id),
    };

    try {
      const response = await axiosInstance.put(
        `/api/ItemOffers/Update/${id}`,
        offerData
      );
      if (response.status === 200 || response.status === 204) {
        fetchOffers();
        Swal.fire({
          icon: "success",
          title: "تم تحديث الحالة!",
          text: `تم ${offer.isEnabled ? "تعطيل" : "تفعيل"} عرض العنصر`,
          timer: 1500,
          showConfirmButton: false,
        });
        fetchMenuItems();
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة العرض:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة العرض",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      menuItemId: selectedProductId.toString() || "",
      isPercentage: true,
      discountValue: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      isEnabled: true,
      branchesIds: [],
    });
    setEditingId(null);
    setIsAdding(false);
    setOpenDropdown(null);
  };

  const handleAddNewOffer = () => {
    fetchMenuItems();
    setIsAdding(true);
  };

  const isFormValid = () => {
    return (
      formData.menuItemId.trim() !== "" &&
      formData.discountValue !== "" &&
      formData.startDate !== "" &&
      formData.endDate !== ""
    );
  };

  const getStatusColor = (offer) => {
    if (!offer.isEnabled)
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    if (new Date(offer.endDate) < new Date())
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    if (new Date(offer.startDate) > new Date())
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  };

  const getStatusText = (offer) => {
    if (!offer.isEnabled) return "غير نشط";
    if (new Date(offer.endDate) < new Date()) return "منتهي";
    if (new Date(offer.startDate) > new Date()) return "قادم";
    return "نشط";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
        </div>
      </div>
    );
  }

  if (!isAdminOrRestaurantOrBranch) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
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
                إدارة عروض العناصر
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                إنشاء وإدارة الخصومات الخاصة بالعناصر
              </p>
            </div>
          </div>
          <div className="text-right self-end sm:self-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
              {offers.length} عرض
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              إجمالاً
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative z-30 dark:bg-gray-800/90"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 dark:text-gray-500" />
              <input
                type="text"
                placeholder="ابحث في العروض حسب اسم العنصر، الوصف، أو الفرع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddNewOffer}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto justify-center"
              >
                <FaPlus className="text-sm" />
                <span className="hidden sm:inline">إنشاء عرض</span>
                <span className="sm:hidden">إنشاء</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <div
            className={`space-y-3 sm:space-y-4 md:space-y-5 ${
              isAdding ? "xl:col-span-2" : "xl:col-span-3"
            }`}
          >
            <AnimatePresence>
              {filteredOffers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 dark:bg-gray-800/90"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-500">
                          {offer.isPercentage ? (
                            <FaPercent className="text-[#E41E26] dark:text-[#FDB913] text-xl sm:text-2xl" />
                          ) : (
                            <FaMoneyBillWave className="text-[#E41E26] dark:text-[#FDB913] text-xl sm:text-2xl" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xl sm:text-2xl truncate">
                              {offer.menuItem?.name ||
                                `عنصر #${offer.menuItemId}`}
                            </h3>
                            <span
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
                                offer
                              )} whitespace-nowrap`}
                            >
                              {getStatusText(offer)}
                            </span>
                          </div>
                          {offer.menuItem && (
                            <p className="text-gray-600 dark:text-gray-400 text-base truncate">
                              {offer.menuItem.description || "لا يوجد وصف"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 mb-4">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-700 p-4 sm:p-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              {offer.isPercentage ? (
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                  <FaPercent className="text-green-600 dark:text-green-400 text-2xl" />
                                </div>
                              ) : (
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                  <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-2xl" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  قيمة الخصم
                                </p>
                                <p className="font-bold text-green-600 dark:text-green-400 text-2xl">
                                  {offer.isPercentage
                                    ? `${offer.discountValue}%`
                                    : `ج.م ${offer.discountValue}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <FaHamburger className="text-blue-600 dark:text-blue-400 text-2xl" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  السعر الأصلي
                                </p>
                                <p className="font-bold text-blue-600 dark:text-blue-400 text-2xl">
                                  ج.م {offer.menuItem?.basePrice || "غير متاح"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl border border-orange-200 dark:border-orange-700 p-4 sm:p-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                <FaCalendarAlt className="text-orange-600 dark:text-orange-400 text-2xl" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  تاريخ ووقت البداية
                                </p>
                                <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                                  {formatDateTime(offer.startDate)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                <FaCalendarAlt className="text-purple-600 dark:text-purple-400 text-2xl" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  تاريخ ووقت النهاية
                                </p>
                                <p className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                                  {formatDateTime(offer.endDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <FaStore className="text-blue-600 dark:text-blue-400 text-lg" />
                          </div>
                          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                            الفروع المطبق عليها:
                          </p>
                        </div>
                        {offer.branchNames && offer.branchNames.length > 0 ? (
                          <div className="flex flex-wrap gap-3">
                            {offer.branchNames.map((branchName, index) => (
                              <span
                                key={index}
                                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-md"
                              >
                                <FaStore className="text-sm" />
                                {branchName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <FaStore className="mx-auto text-3xl text-gray-400 dark:text-gray-500 mb-2" />
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              لم يتم تحديد فروع
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <FaClock className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <span>
                          تم الإنشاء: {formatDateTime(offer.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-col lg:flex-row gap-2 sm:gap-3 justify-end sm:justify-start mt-4 sm:mt-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleToggleActive(offer.id, e)}
                        className={`flex items-center gap-2 px-4 py-2.5 ${
                          offer.isEnabled
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-800"
                            : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800"
                        } rounded-lg transition-colors duration-200 text-sm font-medium flex-1 sm:flex-none justify-center`}
                      >
                        {offer.isEnabled ? (
                          <>
                            <FaTimesCircle className="text-sm" />
                            <span className="whitespace-nowrap">تعطيل</span>
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="text-sm" />
                            <span className="whitespace-nowrap">تفعيل</span>
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(offer)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors duration-200 text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaEdit className="text-sm" />
                        <span className="whitespace-nowrap">تعديل</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(offer.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800 rounded-lg transition-colors duration-200 text-sm font-medium flex-1 sm:flex-none justify-center"
                      >
                        <FaTrash className="text-sm" />
                        <span className="whitespace-nowrap">حذف</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loading && filteredOffers.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600"
              >
                <FaTag className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                  لم يتم العثور على عروض عناصر
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                  {searchTerm
                    ? "حاول ضبط معايير البحث الخاصة بك"
                    : "قم بإنشاء أول عرض عنصر للبدء"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNewOffer}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                >
                  <FaPlus className="text-xs sm:text-sm" />
                  <span>إنشاء أول عرض</span>
                </motion.button>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.div
                id="offer-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="xl:col-span-1"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-5 lg:p-6 border border-gray-200/50 dark:bg-gray-800/90 dark:border-gray-600 sticky top-4 sm:top-6 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                      {editingId ? "تعديل العرض" : "إنشاء عرض جديد"}
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
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        العنصر *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (editingId) return;
                            setOpenDropdown(
                              openDropdown === "menuItem" ? null : "menuItem"
                            );
                            if (
                              !menuItems.length &&
                              openDropdown !== "menuItem"
                            ) {
                              fetchMenuItems();
                            }
                          }}
                          disabled={editingId !== null}
                          className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed text-right"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FaHamburger className="text-[#E41E26] flex-shrink-0" />
                            {formData.menuItemId
                              ? (() => {
                                  const selectedItem = menuItems.find(
                                    (item) =>
                                      item.id.toString() === formData.menuItemId
                                  );
                                  return selectedItem
                                    ? `${selectedItem.name} - ج.م ${
                                        selectedItem.basePrice
                                      }${
                                        selectedItem.category
                                          ? ` (${selectedItem.category.name})`
                                          : ""
                                      }`
                                    : "اختر عنصر";
                                })()
                              : "اختر عنصر"}
                          </span>
                          <motion.div
                            animate={{
                              rotate: openDropdown === "menuItem" ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {loadingItems ? (
                              <FaSpinner className="text-[#E41E26] animate-spin" />
                            ) : (
                              <FaChevronDown className="text-[#E41E26]" />
                            )}
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {openDropdown === "menuItem" && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xl rounded-xl overflow-hidden max-h-64 overflow-y-auto"
                            >
                              {loadingItems ? (
                                <div className="flex items-center justify-center py-4">
                                  <FaSpinner className="text-[#E41E26] animate-spin text-lg" />
                                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                                    جاري تحميل العناصر...
                                  </span>
                                </div>
                              ) : menuItems.length === 0 ? (
                                <div className="px-4 py-3 text-center">
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {editingId
                                      ? "لا يمكن تغيير العنصر أثناء التعديل"
                                      : "لا توجد عناصر متاحة أو جميع العناصر لديها عروض نشطة بالفعل"}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  {menuItems.map((item) => (
                                    <div
                                      key={item.id}
                                      onClick={() => {
                                        handleSelectChange(
                                          "menuItemId",
                                          item.id.toString()
                                        );
                                        setOpenDropdown(null);
                                      }}
                                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-600 dark:hover:to-gray-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex flex-col text-right"
                                    >
                                      <div className="font-medium truncate">
                                        {item.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        ج.م {item.basePrice}
                                        {item.category &&
                                          ` • ${item.category.name}`}
                                      </div>
                                      {item.description && (
                                        <div className="text-xs text-gray-600 dark:text-gray-500 truncate mt-1">
                                          {item.description}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {editingId && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                          لا يمكن تغيير العنصر أثناء تعديل عرض موجود
                        </p>
                      )}
                      {!editingId &&
                        !loadingItems &&
                        menuItems.length === 0 && (
                          <p className="text-xs text-orange-500 dark:text-orange-400 mt-1 text-right">
                            جميع العناصر لديها عروض نشطة بالفعل. قم بتعطيل
                            العروض الحالية لإضافة عروض جديدة.
                          </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          نوع الخصم
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="isPercentage"
                              checked={formData.isPercentage}
                              onChange={() =>
                                setFormData({ ...formData, isPercentage: true })
                              }
                              className="text-[#E41E26] focus:ring-[#E41E26]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              نسبة مئوية (%)
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="isPercentage"
                              checked={!formData.isPercentage}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  isPercentage: false,
                                })
                              }
                              className="text-[#E41E26] focus:ring-[#E41E26]"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              مبلغ ثابت (ج.م)
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          قيمة الخصم *
                        </label>
                        <div className="relative group">
                          {formData.isPercentage ? (
                            <FaPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                          ) : (
                            <FaMoneyBillWave className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                          )}
                          <input
                            type="number"
                            name="discountValue"
                            value={formData.discountValue}
                            onChange={handleInputChange}
                            required
                            min="0"
                            max={formData.isPercentage ? "100" : ""}
                            step={formData.isPercentage ? "1" : "0.01"}
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base text-right"
                            placeholder={
                              formData.isPercentage ? "0-100" : "0.00"
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          تاريخ البداية *
                        </label>
                        <div className="relative group">
                          <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          وقت البداية
                        </label>
                        <div className="relative group">
                          <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                          <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          تاريخ النهاية *
                        </label>
                        <div className="relative group">
                          <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            required
                            min={formData.startDate}
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                          وقت النهاية
                        </label>
                        <div className="relative group">
                          <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm" />
                          <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl pl-3 pr-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        الفروع المطبق عليها *
                      </label>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
                        {branches.length === 0 ? (
                          <div className="text-center py-4">
                            <FaStore className="mx-auto text-2xl text-gray-400 dark:text-gray-500 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              لا توجد فروع متاحة
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {branches.map((branch) => (
                              <label
                                key={branch.id}
                                className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.branchesIds.includes(
                                    branch.id
                                  )}
                                  onChange={() =>
                                    handleBranchesChange(branch.id)
                                  }
                                  className="text-[#E41E26] focus:ring-[#E41E26] rounded"
                                />
                                <div className="flex items-center gap-2 flex-1 justify-between">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {branch.name}
                                  </span>
                                  <FaStore className="text-gray-400 dark:text-gray-500 text-sm" />
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        اختر فرع واحد على الأقل للعرض
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl border border-[#FDB913]/30 dark:border-gray-500">
                      <input
                        type="checkbox"
                        name="isEnabled"
                        checked={formData.isEnabled}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#E41E26] bg-gray-100 border-gray-300 rounded focus:ring-[#E41E26] focus:ring-2"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        نشط (متاح للاستخدام)
                      </label>
                    </div>

                    <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2 flex-col sm:flex-row">
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
                        disabled={
                          !isFormValid() ||
                          formData.branchesIds.length === 0 ||
                          isSubmitting
                        }
                        className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                          isFormValid() &&
                          formData.branchesIds.length > 0 &&
                          !isSubmitting
                            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            <span>جاري الحفظ...</span>
                          </>
                        ) : (
                          <>
                            <FaSave className="text-xs sm:text-sm" />
                            <span>{editingId ? "تحديث" : "إنشاء"}</span>
                          </>
                        )}
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
  );
}
