import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChartBar,
  FaShoppingCart,
  FaTruck,
  FaStore,
  FaPrint,
  FaFilter,
  FaListAlt,
  FaUser,
  FaMapMarkerAlt,
  FaBox,
  FaTimes,
  FaEye,
  FaClipboardList,
  FaMoneyBill,
  FaCheckCircle,
  FaClock,
  FaUtensils,
  FaMotorcycle,
  FaCheck,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaCalendarDay,
  FaBuilding,
  FaChevronDown,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import axiosInstance from "../api/axiosInstance";
import { Helmet } from "react-helmet-async";

const showSalesMobileSuccessToast = (message) => {
  if (window.innerWidth < 768) {
    toast.success(message, {
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
};

const showSalesMobileAlertToast = (message, type = "info") => {
  if (window.innerWidth < 768) {
    const toastFunc =
      type === "error"
        ? toast.error
        : type === "warning"
          ? toast.warning
          : toast.info;
    toastFunc(message, {
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
};

const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/Orders/GetById/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

const formatCurrencyArabic = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "٠٫٠٠ ج.م";
  }

  const toArabicNumbers = (num) => {
    if (num === null || num === undefined) return "٠";
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
  };

  const numberStr = Number(amount).toFixed(2);
  const [wholePart, decimalPart] = numberStr.split(".");
  const arabicWhole = toArabicNumbers(wholePart);
  const arabicDecimal = toArabicNumbers(decimalPart);
  const withCommas = arabicWhole.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");

  return `${withCommas}.${arabicDecimal} ج.م`;
};

const formatNumberArabic = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return "٠";
  }

  const toArabicNumbers = (num) => {
    if (num === null || num === undefined) return "٠";
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
  };

  const num = Math.round(number);
  const arabicNum = toArabicNumbers(num);

  return arabicNum.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
};

const convertToLocalISO = (date, time) => {
  if (!date) return null;

  try {
    const dateStr = format(date, "yyyy-MM-dd");
    const [hours, minutes] = time.split(":");

    const localDate = new Date(
      `${dateStr}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`,
    );

    const localISOString = localDate.toISOString();

    return localISOString;
  } catch (error) {
    console.error("Error converting to ISO:", error);
    return null;
  }
};

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const BASE_URL = "https://restaurant-template.runasp.net";

  const getUserFullName = () => {
    if (!order.user) return "غير معروف";
    return `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim();
  };

  const getPhoneNumber = () => {
    if (order.location?.phoneNumber) {
      return order.location.phoneNumber;
    }
    if (order.user?.phoneNumber) {
      return order.user.phoneNumber;
    }
    return "غير متوفر";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-yellow-500" />;
      case "Confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "Preparing":
        return <FaUtensils className="text-orange-500" />;
      case "OutForDelivery":
        return <FaMotorcycle className="text-purple-500" />;
      case "Delivered":
        return <FaCheck className="text-green-500" />;
      case "Cancelled":
        return <FaBan className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "قيد الانتظار";
      case "Confirmed":
        return "تم التأكيد";
      case "Preparing":
        return "قيد التحضير";
      case "OutForDelivery":
        return "قيد التوصيل";
      case "Delivered":
        return "تم التوصيل";
      case "Cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 dark:text-yellow-400";
      case "Confirmed":
        return "text-blue-600 dark:text-blue-400";
      case "Preparing":
        return "text-orange-600 dark:text-orange-400";
      case "OutForDelivery":
        return "text-purple-600 dark:text-purple-400";
      case "Delivered":
        return "text-green-600 dark:text-green-400";
      case "Cancelled":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const calculateItemFinalPrice = (item) => {
    if (!item) return 0;

    const basePrice = item.menuItem?.basePrice || item.basePriceAtOrder || 0;
    const itemDiscount = item.totalDiscount || 0;
    const optionsTotal =
      item.options?.reduce(
        (sum, option) => sum + (option.optionPriceAtOrder || 0),
        0,
      ) || 0;

    const itemPriceBeforeDiscount =
      (basePrice + optionsTotal) * (item.quantity || 1);
    const itemFinalPrice = itemPriceBeforeDiscount - itemDiscount;

    return Math.max(itemFinalPrice, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FaClipboardList className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  تفاصيل الطلب #{order.orderNumber}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <FaUser className="text-[#2E3D88]" />
                <h3 className="font-bold text-gray-800 dark:text-white">
                  معلومات العميل
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    اسم العميل:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {getUserFullName()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    رقم الهاتف:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {getPhoneNumber()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-[#2E3D88]" />
                <h3 className="font-bold text-gray-800 dark:text-white">
                  معلومات التوصيل
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    نوع الطلب:
                  </span>
                  <span
                    className={`font-medium ${
                      order.deliveryFee?.fee > 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {order.deliveryFee?.areaName ||
                      (order.deliveryFee?.fee > 0 ? "توصيل" : "استلام")}
                  </span>
                </div>
                {order.location?.streetName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      العنوان:
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {order.location.streetName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    تكلفة التوصيل:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {order.deliveryCost?.toFixed(2) || "0.00"} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBox className="text-[#2E3D88]" />
              <h3 className="font-bold text-gray-800 dark:text-white">
                المنتجات المطلوبة
              </h3>
            </div>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const itemFinalPrice = calculateItemFinalPrice(item);
                  const basePrice =
                    item.menuItem?.basePrice || item.basePriceAtOrder || 0;
                  const isPriceBasedOnRequest = basePrice === 0;

                  const itemPriceWithOptions = (
                    ((item.menuItem?.basePrice || 0) +
                      (item.options?.reduce(
                        (sum, option) => sum + (option.optionPriceAtOrder || 0),
                        0,
                      ) || 0)) *
                    (item.quantity || 1)
                  ).toFixed(2);

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {(item.menuItem?.imageUrl ||
                          item.menuItemImageUrlSnapshotAtOrder) && (
                          <div className="md:w-1/4">
                            <div className="relative w-full h-48 md:h-40 rounded-lg overflow-hidden">
                              <img
                                src={`${BASE_URL}/${
                                  item.menuItem?.imageUrl ||
                                  item.menuItemImageUrlSnapshotAtOrder
                                }`}
                                alt={
                                  item.menuItem?.name ||
                                  item.menuItemNameSnapshotAtOrder ||
                                  "صورة المنتج"
                                }
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x200?text=No+Image";
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div
                          className={`${
                            item.menuItem?.imageUrl ||
                            item.menuItemImageUrlSnapshotAtOrder
                              ? "md:w-3/4"
                              : "w-full"
                          }`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                              <p className="font-bold text-lg text-gray-800 dark:text-white mb-1">
                                {item.menuItem?.name ||
                                  item.menuItemNameSnapshotAtOrder ||
                                  "منتج غير معروف"}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {item.menuItem?.description?.substring(
                                  0,
                                  100,
                                ) ||
                                  item.menuItemDescriptionAtOrder?.substring(
                                    0,
                                    100,
                                  ) ||
                                  "لا يوجد وصف"}
                                {(item.menuItem?.description?.length > 100 ||
                                  item.menuItemDescriptionAtOrder?.length >
                                    100) &&
                                  "..."}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                الكمية
                              </p>
                              <p className="font-bold text-lg text-gray-800 dark:text-white">
                                {item.quantity || 1}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                السعر الأساسي
                              </p>
                              <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                {isPriceBasedOnRequest ? (
                                  <span className="text-[#2E3D88] dark:text-[#4A5DB0]">
                                    السعر حسب الطلب
                                  </span>
                                ) : (
                                  `${basePrice.toFixed(2)} ج.م`
                                )}
                              </p>
                            </div>
                          </div>

                          {item.options && item.options.length > 0 && (
                            <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                الاضافات المختارة:
                              </p>
                              <div className="space-y-2">
                                {item.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex justify-between items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700"
                                  >
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {option.optionNameAtOrder ||
                                        `إضافة ${optionIndex + 1}`}
                                    </span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                      +
                                      {option.optionPriceAtOrder?.toFixed(2) ||
                                        "0.00"}{" "}
                                      ج.م
                                    </span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    إجمالي الاضافات:
                                  </span>
                                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {item.options
                                      .reduce(
                                        (sum, option) =>
                                          sum +
                                          (option.optionPriceAtOrder || 0),
                                        0,
                                      )
                                      .toFixed(2)}{" "}
                                    ج.م
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  السعر
                                </p>
                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {itemPriceWithOptions} ج.م
                                </p>
                              </div>

                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  خصم المنتج
                                </p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                  {item.totalDiscount?.toFixed(2) || "0.00"} ج.م
                                </p>
                              </div>

                              <div className="text-center col-span-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  الإجمالي النهائي للمنتج
                                </p>
                                <p className="text-lg font-bold text-[#2E3D88] dark:text-[#4A5DB0]">
                                  {itemFinalPrice.toFixed(2)} ج.م
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <FaBox className="mx-auto text-3xl text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  لا توجد منتجات في هذا الطلب
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  الإجمالي بعد الخصم
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {order.totalWithoutFee?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  إجمالي الخصم
                </p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {order.totalDiscount?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  المبلغ النهائي
                </p>
                <p className="text-xl font-bold text-[#2E3D88] dark:text-[#4A5DB0]">
                  {order.totalWithFee?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  حالة الطلب
                </p>
                <p
                  className={`text-lg font-bold ${getStatusColor(
                    order.status,
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </span>
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  ملاحظات:
                </p>
                <p className="text-gray-800 dark:text-gray-300">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TimeDateSalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchesDropdownOpen, setBranchesDropdownOpen] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    setSummary({
      totalSales: 0,
      totalOrders: 0,
      deliveryOrders: 0,
      pickupOrders: 0,
      topProducts: [],
      dateRange: "لم يتم تحديد فترة",
    });

    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get("/api/Branches/GetList");
      if (response.data && Array.isArray(response.data)) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      if (window.innerWidth < 768) {
        showSalesMobileAlertToast("فشل في تحميل قائمة الفروع", "error");
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل قائمة الفروع",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  const fetchReportData = async (isFilterAction = false, page = 1) => {
    if (!startDate || !endDate) {
      if (isFilterAction) {
        if (window.innerWidth < 768) {
          showSalesMobileAlertToast(
            "يرجى تحديد تاريخ البداية والنهاية أولاً",
            "warning",
          );
        } else {
          Swal.fire({
            icon: "warning",
            title: "تاريخ غير مكتمل",
            text: "يرجى تحديد تاريخ البداية والنهاية أولاً",
            timer: 3000,
            showConfirmButton: false,
            background: "#fff",
            color: "#333",
          });
        }
      }
      return;
    }

    if (startDate > endDate) {
      if (isFilterAction) {
        if (window.innerWidth < 768) {
          showSalesMobileAlertToast(
            "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
            "error",
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ في التاريخ",
            text: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      }
      return;
    }

    setLoading(true);
    try {
      const startDateTimeISO = convertToLocalISO(startDate, startTime);
      const endDateTimeISO = convertToLocalISO(endDate, endTime);

      if (!startDateTimeISO || !endDateTimeISO) {
        throw new Error("خطأ في توليد التواريخ");
      }

      const rangeValue = `${startDateTimeISO},${endDateTimeISO}`;

      const apiPageNumber = page;

      const requestBody = {
        pageNumber: apiPageNumber,
        pageSize: pageSize,
        filters: [
          {
            propertyName: "createdAt",
            propertyValue: rangeValue,
            range: true,
          },
        ],
      };

      if (selectedBranch) {
        requestBody.filters.push({
          propertyName: "branchId",
          propertyValue: selectedBranch.id.toString(),
        });
      }

      const response = await axiosInstance.post(
        "/api/Orders/GetAllWithPagination",
        requestBody,
      );

      const responseData = response.data || {};
      const orders = responseData.data || responseData || [];
      const totalItems = responseData.totalItems || 0;
      const totalPages = responseData.totalPages || 1;
      const totalPriceFromResponse = responseData.totalPrice || 0;
      const deliveryOrdersFromResponse = responseData.deliveryOrders || 0;
      const pickupOrdersFromResponse = responseData.pickupOrders || 0;

      setReportData(orders);
      setCurrentPage(page);
      setTotalPages(totalPages);
      setTotalItems(totalItems);
      setTotalPrice(totalPriceFromResponse);

      const totalSales = totalPriceFromResponse;
      const totalOrders = totalItems;

      const productSales = {};
      orders.forEach((order) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach((item) => {
            const productName =
              item.menuItem?.name ||
              item.menuItemNameSnapshotAtOrder ||
              "منتج غير معروف";
            if (!productSales[productName]) {
              productSales[productName] = {
                quantity: 0,
                revenue: 0,
              };
            }
            productSales[productName].quantity += item.quantity || 1;
            productSales[productName].revenue += item.totalPrice || 0;
          });
        }
      });

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const summaryData = {
        totalSales,
        totalOrders,
        deliveryOrders: deliveryOrdersFromResponse,
        pickupOrders: pickupOrdersFromResponse,
        topProducts,
        dateRange:
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} ${startTime} إلى ${format(
                endDate,
                "yyyy-MM-dd",
              )} ${endTime}`
            : "لم يتم تحديد فترة",
        branch: selectedBranch ? selectedBranch.name : "جميع الفروع",
      };

      setSummary(summaryData);

      if (isFilterAction) {
        setTimeout(() => {
          if (window.innerWidth < 768) {
            showSalesMobileSuccessToast("تم تطبيق الفلترة بنجاح");
          } else {
            Swal.fire({
              icon: "success",
              title: "تم تطبيق الفلترة بنجاح",
              timer: 1500,
              showConfirmButton: false,
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      console.error("Error details:", error.response?.data);

      let errorMessage;
      if (error.message === "يرجى تحديد تاريخ البداية والنهاية") {
        errorMessage = "يرجى تحديد تاريخ البداية والنهاية";
      } else if (error.response?.status === 404) {
        errorMessage = "لا توجد بيانات في الفترة المحددة";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || "بيانات الطلب غير صحيحة";
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = "فشل في تحميل بيانات التقرير";
      }

      if (window.innerWidth < 768) {
        showSalesMobileAlertToast(errorMessage, "info");
      } else {
        Swal.fire({
          icon: "info",
          title: "خطأ",
          text: errorMessage,
          timer: 2500,
          showConfirmButton: false,
        });
      }

      setReportData([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
      setTotalPrice(0);

      setSummary({
        totalSales: 0,
        totalOrders: 0,
        deliveryOrders: 0,
        pickupOrders: 0,
        topProducts: [],
        dateRange:
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} ${startTime} إلى ${format(
                endDate,
                "yyyy-MM-dd",
              )} ${endTime}`
            : "لم يتم تحديد فترة",
        branch: selectedBranch ? selectedBranch.name : "جميع الفروع",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrdersForPrint = async () => {
    if (!startDate || !endDate) {
      return [];
    }

    try {
      const startDateTimeISO = convertToLocalISO(startDate, startTime);
      const endDateTimeISO = convertToLocalISO(endDate, endTime);

      if (!startDateTimeISO || !endDateTimeISO) {
        throw new Error("خطأ في توليد التواريخ");
      }

      const rangeValue = `${startDateTimeISO},${endDateTimeISO}`;

      const requestBody = {
        pageNumber: 1,
        pageSize: totalItems,
        filters: [
          {
            propertyName: "createdAt",
            propertyValue: rangeValue,
            range: true,
          },
        ],
      };

      if (selectedBranch) {
        requestBody.filters.push({
          propertyName: "branchId",
          propertyValue: selectedBranch.id.toString(),
        });
      }

      const response = await axiosInstance.post(
        "/api/Orders/GetAllWithPagination",
        requestBody,
      );

      const responseData = response.data || {};
      return responseData.data || [];
    } catch (error) {
      console.error("Error fetching all orders for print:", error);
      return [];
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const details = await fetchOrderDetails(orderId);
      setOrderDetails(details);
      setSelectedOrder(details);
    } catch (error) {
      if (window.innerWidth < 768) {
        showSalesMobileAlertToast("فشل في تحميل تفاصيل الطلب", "error");
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل تفاصيل الطلب",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const getCustomerName = (order) => {
    if (!order.user) return "غير معروف";
    return `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim();
  };

  const getCustomerPhone = (order) => {
    if (order.location?.phoneNumber) {
      return order.location.phoneNumber;
    }
    if (order.user?.phoneNumber) {
      return order.user.phoneNumber;
    }
    return "غير متوفر";
  };

  const getCustomerCity = (order) => {
    if (order.location?.city?.name) {
      return order.location.city.name;
    }
    return "لا يوجد";
  };

  const getBranchName = (order) => {
    if (order.branch?.name) {
      return order.branch.name;
    }
    return "غير محدد";
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0.00 ج.م";
    }
    return `${Number(amount).toLocaleString("ar-EG")} ج.م`;
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);

      if (!startDate || !endDate) {
        if (window.innerWidth < 768) {
          showSalesMobileAlertToast(
            "يرجى تحديد تاريخ البداية والنهاية أولاً",
            "warning",
          );
        } else {
          Swal.fire({
            icon: "warning",
            title: "تاريخ غير مكتمل",
            text: "يرجى تحديد تاريخ البداية والنهاية أولاً",
            timer: 2000,
            showConfirmButton: false,
          });
        }
        setIsPrinting(false);
        return;
      }

      const ordersToPrint = await fetchAllOrdersForPrint();

      if (ordersToPrint.length === 0) {
        if (window.innerWidth < 768) {
          showSalesMobileAlertToast(
            "لا توجد بيانات لعرضها في التقرير",
            "warning",
          );
        } else {
          Swal.fire({
            icon: "warning",
            title: "لا توجد بيانات",
            text: "لا توجد بيانات لعرضها في التقرير",
            timer: 2000,
            showConfirmButton: false,
          });
        }
        setIsPrinting(false);
        return;
      }

      const totalSalesPrint = totalPrice;
      const totalOrdersPrint = totalItems;

      // Use the response data from the API
      const response = await axiosInstance.post(
        "/api/Orders/GetAllWithPagination",
        {
          pageNumber: 1,
          pageSize: totalItems,
          filters: [
            {
              propertyName: "createdAt",
              propertyValue: `${convertToLocalISO(startDate, startTime)},${convertToLocalISO(endDate, endTime)}`,
              range: true,
            },
          ],
        },
      );

      const responseData = response.data || {};
      const deliveryOrdersPrint = responseData.deliveryOrders || 0;
      const pickupOrdersPrint = responseData.pickupOrders || 0;

      const productSalesPrint = {};
      ordersToPrint.forEach((order) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach((item) => {
            const productName =
              item.menuItem?.name ||
              item.menuItemNameSnapshotAtOrder ||
              "منتج غير معروف";
            if (!productSalesPrint[productName]) {
              productSalesPrint[productName] = {
                quantity: 0,
                revenue: 0,
              };
            }
            productSalesPrint[productName].quantity += item.quantity || 1;
            productSalesPrint[productName].revenue += item.totalPrice || 0;
          });
        }
      });

      const topProductsPrint = Object.entries(productSalesPrint)
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const printSummary = {
        totalSales: totalSalesPrint,
        totalOrders: totalOrdersPrint,
        deliveryOrders: deliveryOrdersPrint,
        pickupOrders: pickupOrdersPrint,
        topProducts: topProductsPrint,
        dateRange:
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} ${startTime} إلى ${format(
                endDate,
                "yyyy-MM-dd",
              )} ${endTime}`
            : "لم يتم تحديد فترة",
        branch: selectedBranch ? selectedBranch.name : "جميع الفروع",
      };

      const toArabicNumbers = (num) => {
        if (num === null || num === undefined) return "٠";
        const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
        return num
          .toString()
          .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
      };

      const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير المبيعات بالوقت والتاريخ - Triple-S</title>
<style>
  @media print {
    @page { margin: 0; size: A4 portrait; }
    body {
      margin: 0; padding: 15px;
      font-family: 'Arial', sans-serif;
      background: white !important;
      color: black !important;
      direction: rtl;
      font-size: 15px;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  
  body {
    margin: 0; padding: 15px;
    font-family: 'Arial', sans-serif;
    background: white !important;
    color: black !important;
    direction: rtl;
    font-size: 11px;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
  }
  
  .print-header h1 {
    color: black !important;
    margin: 0 0 5px 0;
    font-size: 22px;
    font-weight: bold;
  }
  
  .print-header p {
    color: #666 !important;
    margin: 0;
    font-size: 14px;
  }
  
  .print-info {
    margin: 15px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: #f9f9f9;
  }
  
  .print-info div {
    margin: 5px 0;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 15px 0;
    text-align: center;
  }
  
  .stat-card {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
    border-radius: 5px;
    padding: 8px;
  }
  
  .stat-card h3 {
    color: #666 !important;
    margin: 0 0 6px 0;
    font-size: 10px;
    font-weight: normal;
  }
  
  .stat-card p {
    color: black !important;
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }
  
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 9px;
    table-layout: fixed;
  }
  
  .print-table th {
    background-color: #f0f0f0 !important;
    color: black !important;
    padding: 6px 3px;
    text-align: center;
    border: 1px solid #ccc !important;
    font-weight: bold;
    font-size: 9px;
  }
  
  .print-table td {
    padding: 5px 3px;
    border: 1px solid #ddd !important;
    text-align: center;
    color: black !important;
    font-size: 8px;
  }
  
  .print-table tr:nth-child(even) {
    background-color: #f9f9f9 !important;
  }
  
  .customer-name {
    font-weight: bold;
  }
  
  .order-type-delivery {
    color: #1d4ed8 !important;
  }
  
  .order-type-pickup {
    color: #059669 !important;
  }
  
  .total-amount {
    font-weight: bold;
  }
  
  .print-footer {
    margin-top: 20px;
    text-align: center;
    color: #666 !important;
    font-size: 9px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }
  
  .no-data {
    text-align: center;
    padding: 40px;
    color: #666 !important;
  }
</style>
</head>
<body>

<div class="print-header">
  <h1>تقرير المبيعات بالوقت والتاريخ - Triple-S</h1>
  <p>نظام إدارة المطاعم</p>
  <p>الفرع: ${printSummary.branch}</p>
</div>

<div class="print-info">
  <div>تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}</div>
  <div>الفترة الزمنية: ${printSummary.dateRange}</div>
  <div>عدد السجلات: ${formatNumberArabic(ordersToPrint.length)}</div>
</div>

<div class="stats-container">
  <div class="stat-card">
    <h3>إجمالي المبيعات</h3>
    <p>${formatCurrencyArabic(printSummary.totalSales || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>إجمالي الطلبات</h3>
    <p>${formatNumberArabic(printSummary.totalOrders || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>طلبات التوصيل</h3>
    <p>${formatNumberArabic(printSummary.deliveryOrders || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>طلبات الاستلام</h3>
    <p>${formatNumberArabic(printSummary.pickupOrders || 0)}</p>
  </div>
</div>

${
  ordersToPrint.length === 0
    ? `
  <div class="no-data">
    <h3>لا توجد طلبات في الفترة المحددة</h3>
  </div>
`
    : `
  <table class="print-table">
    <thead>
      <tr>
        <th width="12%">رقم الطلب</th>
        <th width="15%">العميل</th>
        <th width="12%">الهاتف</th>
        <th width="12%">نوع الطلب</th>
        <th width="12%">المدينة</th>
        <th width="15%">الفرع</th>
        <th width="12%">المبلغ النهائي</th>
      </tr>
    </thead>
    <tbody>
      ${ordersToPrint
        .map((order, index) => {
          const userName = order.user
            ? `${order.user.firstName || ""} ${
                order.user.lastName || ""
              }`.trim()
            : "غير معروف";

          const phoneNumber = order.location?.phoneNumber
            ? order.location.phoneNumber
            : order.user?.phoneNumber || "غير متوفر";

          const cityName = order.location?.city?.name || "لا يوجد";
          const branchName = order.branch?.name || "غير محدد";

          const orderTypeClass = `order-type-${
            order.deliveryFee?.fee > 0 ? "delivery" : "pickup"
          }`;
          const orderNumberArabic = order.orderNumber
            ? order.orderNumber.replace(/\d/g, (d) => toArabicNumbers(d))
            : "";
          const phoneArabic = phoneNumber
            ? phoneNumber.replace(/\d/g, (d) => toArabicNumbers(d))
            : "غير متوفر";
          const cityArabic = cityName;
          const branchArabic = branchName;

          return `
          <tr>
            <td class="customer-name">${orderNumberArabic}</td>
            <td>${userName}</td>
            <td>${phoneArabic}</td>
            <td class="${orderTypeClass}">${
              order.deliveryFee?.fee > 0 ? "توصيل" : "استلام"
            }</td>
            <td>${cityArabic}</td>
            <td>${branchArabic}</td>
            <td class="total-amount">${formatCurrencyArabic(
              order.totalWithFee || 0,
            )}</td>
          </tr>
        `;
        })
        .join("")}
      <tr style="background-color: #f0f0f0 !important; font-weight: bold;">
        <td colspan="6" style="text-align: left; padding-right: 20px;">المجموع الكلي:</td>
        <td class="total-amount" style="text-align: center;">${formatCurrencyArabic(
          printSummary.totalSales || 0,
        )}</td>
      </tr>
    </tbody>
  </table>
`
}

${
  printSummary?.topProducts && printSummary.topProducts.length > 0
    ? `
<div style="margin-top: 30px;">
  <div style="text-align: center; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">
    <h2 style="margin: 0; font-size: 16px; color: black;">المنتجات الأكثر مبيعاً</h2>
  </div>
  <table class="print-table">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="45%">اسم المنتج</th>
        <th width="20%">الكمية</th>
        <th width="30%">الإيرادات</th>
      </tr>
    </thead>
    <tbody>
      ${printSummary.topProducts
        .map(
          (product, index) => `
        <tr>
          <td style="text-align: center;">${toArabicNumbers(index + 1)}</td>
          <td style="text-align: center;">${product.name}</td>
          <td style="text-align: center;">${formatNumberArabic(
            product.quantity,
          )}</td>
          <td class="total-amount" style="text-align: center;">${formatCurrencyArabic(
            product.revenue,
          )}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
</div>
`
    : ""
}

<div class="print-footer">
  <p>تم الإنشاء في: ${format(new Date(), "yyyy/MM/dd HH:mm").replace(
    /\d/g,
    (d) => toArabicNumbers(d),
  )}</p>
  <p>الفرع: ${printSummary.branch}</p>
  <p>Triple-S © ${toArabicNumbers(new Date().getFullYear())}</p>
</div>

</body>
</html>
          `;

      const printFrame = document.createElement("iframe");
      printFrame.style.display = "none";
      printFrame.style.position = "absolute";
      printFrame.style.top = "-9999px";
      printFrame.style.left = "-9999px";
      document.body.appendChild(printFrame);

      const printWindow = printFrame.contentWindow;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();

          setTimeout(() => {
            document.body.removeChild(printFrame);
            setIsPrinting(false);
          }, 1000);
        }, 500);
      };
    } catch (error) {
      console.error("Error in print process:", error);
      if (window.innerWidth < 768) {
        showSalesMobileAlertToast("فشل في تحميل بيانات الطباعة", "error");
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل بيانات الطباعة",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setIsPrinting(false);
    }
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    fetchReportData(true, 1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchReportData(false, pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchReportData(false, currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      fetchReportData(false, currentPage + 1);
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setBranchesDropdownOpen(false);
  };

  const handleClearBranchFilter = () => {
    setSelectedBranch(null);
    setBranchesDropdownOpen(false);
  };

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

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
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-white via-[#f0f3ff] to-[#d9e0f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-6 relative font-sans overflow-hidden transition-colors duration-300"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 -top-10 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-r from-[#2E3D88]/10 to-[#4A5DB0]/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-r from-[#4A5DB0]/10 to-[#2E3D88]/10 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] px-6 py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <FaCalendarDay className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    تقارير المبيعات بالوقت والتاريخ
                  </h1>
                  <p className="text-white/90 text-sm">
                    تحليل مفصل للمبيعات حسب الفترة الزمنية
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6" dir="rtl">
            {/* Date & Time Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-[#2E3D88] text-xl" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    فلترة بالتاريخ والوقت
                  </h3>
                </div>
              </div>

              {/* First Row: All filter fields */}
              <div
                className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4"
                dir="rtl"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    تاريخ من
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88]" />
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="dd/MM/yyyy"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent outline-none text-right"
                      locale="ar"
                      placeholderText="اختر تاريخ البداية"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    وقت من
                  </label>
                  <div className="relative">
                    <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88]" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent outline-none text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    تاريخ إلى
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88]" />
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      dateFormat="dd/MM/yyyy"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent outline-none text-right"
                      locale="ar"
                      placeholderText="اختر تاريخ النهاية"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    وقت إلى
                  </label>
                  <div className="relative">
                    <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88]" />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent outline-none text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    الفرع
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setBranchesDropdownOpen(!branchesDropdownOpen)
                      }
                      className="w-full flex items-center justify-between border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg px-3 py-2.5 text-right focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent outline-none hover:border-[#2E3D88] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FaBuilding className="text-[#2E3D88] text-sm" />
                        <span className="text-sm">
                          {selectedBranch ? selectedBranch.name : "جميع الفروع"}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: branchesDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown className="text-[#2E3D88]" />
                      </motion.div>
                    </button>

                    {branchesDropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                        <div
                          onClick={handleClearBranchFilter}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all text-sm border-b dark:border-gray-600 flex items-center gap-2"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            جميع الفروع
                          </span>
                        </div>
                        {branches.map((branch) => (
                          <div
                            key={branch.id}
                            onClick={() => handleBranchSelect(branch)}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all text-sm border-b dark:border-gray-600 last:border-b-0 ${
                              selectedBranch?.id === branch.id
                                ? "bg-gradient-to-r from-[#f0f3ff] to-[#d9e0f5] dark:from-gray-700 dark:to-gray-600"
                                : ""
                            }`}
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {branch.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Second Row: Filter and Print buttons only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    إجراءات التقرير
                  </label>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDateFilter}
                      disabled={!startDate || !endDate}
                      className={`flex-1 px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        startDate && endDate
                          ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white cursor-pointer"
                          : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FaFilter />
                      تطبيق الفلترة
                    </motion.button>
                    {reportData && reportData.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 ${
                          isPrinting
                            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white cursor-pointer"
                        }`}
                      >
                        {isPrinting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            جاري الطباعة...
                          </>
                        ) : (
                          <>
                            <FaPrint />
                            طباعة
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Summary Cards */}
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              >
                {/* Total Sales Card */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">إجمالي المبيعات</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(summary.totalSales)}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FaMoneyBill className="text-2xl" />
                    </div>
                  </div>
                </div>

                {/* Total Orders Card */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">إجمالي الطلبات</p>
                      <p className="text-2xl font-bold mt-1">
                        {summary.totalOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FaShoppingCart className="text-2xl" />
                    </div>
                  </div>
                </div>

                {/* Delivery Orders */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">طلبات التوصيل</p>
                      <p className="text-2xl font-bold mt-1">
                        {summary.deliveryOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FaTruck className="text-2xl" />
                    </div>
                  </div>
                </div>

                {/* Pickup Orders */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">طلبات الاستلام</p>
                      <p className="text-2xl font-bold mt-1">
                        {summary.pickupOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FaStore className="text-2xl" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Top Products Section */}
            {summary?.topProducts && summary.topProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaChartBar className="text-[#2E3D88] text-xl" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      المنتجات الأكثر مبيعاً
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    أعلى 5 منتجات حسب الإيرادات
                  </span>
                </div>

                <div className="space-y-3">
                  {summary.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product.quantity} وحدة مباعة
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 dark:text-white">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Orders Table */}
            {reportData && reportData.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg mb-6"
                >
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaListAlt className="text-[#2E3D88] text-xl" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          تفاصيل الطلبات
                        </h3>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        إجمالي {totalItems} طلب • صفحة {currentPage} من{" "}
                        {totalPages} • الفرع: {summary?.branch || "جميع الفروع"}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                            رقم الطلب
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                            اسم العميل
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                            رقم الهاتف
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                            نوع الطلب
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                            المدينة
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                            الفرع
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                            الإجمالي
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {reportData.map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 text-center font-mono text-sm text-gray-800 dark:text-white font-bold">
                              {order.orderNumber}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                              {getCustomerName(order)}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                              {getCustomerPhone(order)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  order.deliveryFee?.fee > 0
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                              >
                                {order.deliveryFee?.fee > 0 ? (
                                  <>
                                    <FaTruck className="text-xs" />
                                    توصيل
                                  </>
                                ) : (
                                  <>
                                    <FaStore className="text-xs" />
                                    استلام
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                              {getCustomerCity(order)}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                              {getBranchName(order)}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-[#2E3D88] dark:text-[#4A5DB0]">
                              {formatCurrency(order.totalWithFee)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewOrderDetails(order.id)}
                                disabled={loadingDetails}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 mx-auto"
                              >
                                {loadingDetails &&
                                selectedOrder?.id === order.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FaEye />
                                )}
                                عرض التفاصيل
                              </motion.button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                        <tr>
                          <td
                            colSpan="6"
                            className="px-4 py-3 text-center font-bold text-gray-800 dark:text-white"
                          >
                            المجموع الكلي:
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xl font-bold text-[#2E3D88] dark:text-[#4A5DB0]">
                              {formatCurrency(summary?.totalSales || 0)}
                            </span>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex flex-col items-center"
                  >
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`p-2 sm:p-3 rounded-xl ${
                          currentPage === 1
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <FaChevronRight className="text-sm sm:text-base" />
                      </button>

                      <div className="flex items-center gap-1 sm:gap-2">
                        {getPaginationNumbers().map((pageNum, index) => (
                          <React.Fragment key={index}>
                            {pageNum === "..." ? (
                              <span className="px-2 sm:px-3 py-1 sm:py-2 text-gray-500">
                                ...
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl font-semibold ${
                                  currentPage === pageNum
                                    ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white shadow-lg"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {pageNum}
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 sm:p-3 rounded-xl ${
                          currentPage === totalPages
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <FaChevronLeft className="text-sm sm:text-base" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {(!reportData || reportData.length === 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-5xl mb-4 text-gray-400">📊</div>
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                  لا توجد بيانات لعرضها
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedBranch
                    ? `يرجى تحديد فترة زمنية وتطبيق الفلترة لعرض التقرير للفرع: ${selectedBranch.name}`
                    : "يرجى تحديد فترة زمنية وتطبيق الفلترة لعرض التقرير"}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={orderDetails || selectedOrder}
            onClose={handleCloseOrderDetails}
          />
        )}
      </div>
    </>
  );
};

export default TimeDateSalesReport;
