import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChartBar,
  FaPrint,
  FaFilter,
  FaListAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaChevronDown,
  FaCalendar,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, startOfDay, endOfDay, addHours, parseISO } from "date-fns";
import axiosInstance from "../api/axiosInstance";

const fetchOrderShifts = async (branchId, day) => {
  try {
    if (!branchId || !day) {
      return [];
    }

    const params = new URLSearchParams({
      branchId: branchId.toString(),
      day: format(day, "yyyy-MM-dd"),
    });

    const response = await axiosInstance.get(
      `/api/OrderShifts/GetAll?${params.toString()}`
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching order shifts:", error);
    throw error;
  }
};

const fetchBranches = async () => {
  try {
    const response = await axiosInstance.get("/api/Branches/GetList");
    return response.data;
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};

const fetchOrdersWithFilter = async (
  day,
  shiftId,
  branchId,
  pageNumber = 1,
  pageSize = 10
) => {
  try {
    if (!day || !branchId) {
      throw new Error("يرجى تحديد اليوم والفرع أولاً");
    }

    const requestBody = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      filters: [],
    };

    if (shiftId) {
      requestBody.filters.push({
        propertyName: "orderShift.id",
        propertyValue: shiftId.toString(),
        range: false,
      });
    }

    console.log(
      "Request Body for Orders:",
      JSON.stringify(requestBody, null, 2)
    );

    const response = await axiosInstance.post(
      "/api/Orders/GetAllWithPagination",
      requestBody
    );

    if (
      !response.data ||
      !response.data.data ||
      response.data.data.length === 0
    ) {
      throw new Error("لا توجد بيانات في اليوم المحدد");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

const fetchAllOrdersForPrint = async (day, shiftId, branchId) => {
  try {
    if (!day || !branchId) {
      return [];
    }

    let startDateWithTime = startOfDay(day);
    let endDateWithTime = endOfDay(day);

    const params = new URLSearchParams();

    params.append("shiftId", shiftId.toString());

    console.log(`Fetching print orders with params: ${params.toString()}`);
    console.log(`Start Range: ${startDateWithTime.toISOString()}`);
    console.log(`End Range: ${endDateWithTime.toISOString()}`);
    console.log(`Branch ID: ${branchId}`);
    console.log(`Shift ID: ${shiftId || "Not provided"}`);

    const response = await axiosInstance.get(
      `/api/Orders/GetAll?${params.toString()}`
    );

    let orders = response.data || [];

    console.log(`تم جلب ${orders.length} طلب للطباعة`);

    return orders;
  } catch (error) {
    console.error("Error fetching all orders for print:", error);
    throw error;
  }
};

const toArabicNumbers = (num) => {
  if (num === null || num === undefined) return "٠";

  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
};

const formatCurrencyArabic = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "٠٫٠٠ ج.م";
  }

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

  const num = Math.round(number);
  const arabicNum = toArabicNumbers(num);

  return arabicNum.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
};

const formatTimeTo12Hour = (timeString) => {
  if (!timeString) return "غير محدد";

  try {
    let date;

    if (timeString.includes("T")) {
      date = parseISO(timeString);
    } else if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0);
    } else {
      return timeString;
    }

    const adjustedDate = addHours(date, 2);

    let formattedTime = format(adjustedDate, "hh:mm a");

    formattedTime = formattedTime.replace(/AM/g, "ص").replace(/PM/g, "م");

    return formattedTime;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

const OrderShiftsReport = () => {
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(null);
  const [shiftId, setShiftId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [orderShifts, setOrderShifts] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [summary, setSummary] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await fetchBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error("Error loading branches:", error);
        toast.error("فشل في تحميل قائمة الفروع");
      }
    };

    loadBranches();

    setSummary({
      day: "لم يتم تحديد اليوم",
    });

    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem("darkMode");
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const loadOrderShifts = async () => {
      if (day && branchId) {
        try {
          const shifts = await fetchOrderShifts(branchId, day);
          setOrderShifts(shifts);

          if (shifts.length > 0 && !shiftId) {
            setShiftId(shifts[0].id.toString());
          } else {
            setShiftId("");
          }
        } catch (error) {
          console.error("Error loading order shifts:", error);
          setOrderShifts([]);
          setShiftId("");
        }
      } else {
        setOrderShifts([]);
        setShiftId("");
      }
    };

    loadOrderShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, branchId]);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleFilter = async (page = 1) => {
    if (!day) {
      Swal.fire({
        icon: "warning",
        title: "اليوم غير محدد",
        text: "يرجى تحديد اليوم أولاً",
        timer: 3000,
        showConfirmButton: false,
        background: "#fff",
        color: "#333",
      });
      return;
    }

    if (!branchId) {
      Swal.fire({
        icon: "warning",
        title: "الفرع غير محدد",
        text: "يرجى تحديد الفرع أولاً",
        timer: 3000,
        showConfirmButton: false,
        background: "#fff",
        color: "#333",
      });
      return;
    }

    if (!shiftId) {
      Swal.fire({
        icon: "warning",
        title: "الوردية غير محددة",
        text: "يرجى تحديد اسم الوردية أولاً",
        timer: 3000,
        showConfirmButton: false,
        background: "#fff",
        color: "#333",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetchOrdersWithFilter(
        day,
        shiftId || null,
        branchId,
        page,
        10
      );

      const orders = response.data;
      setReportData(orders);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
      setTotalPrice(response.totalPrice || 0);
      setCurrentPage(response.pageNumber);

      const selectedBranchName =
        branches.find((b) => b.id === parseInt(branchId))?.name ||
        "الفرع المحدد";

      const selectedShiftName = shiftId
        ? orderShifts.find((s) => s.id === parseInt(shiftId))?.name ||
          "الوردية المحددة"
        : "جميع الورديات";

      setSummary({
        day: format(day, "yyyy-MM-dd"),
        branch: selectedBranchName,
        shift: selectedShiftName,
      });

      Swal.fire({
        icon: "success",
        title: "تم تطبيق الفلترة بنجاح",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);

      const errorMessage =
        error.message === "لا توجد بيانات في اليوم المحدد"
          ? "لا توجد بيانات في اليوم المحدد"
          : "فشل في تحميل بيانات التقرير";

      Swal.fire({
        icon: "info",
        title: "لا توجد بيانات",
        text: errorMessage,
        timer: 2500,
        showConfirmButton: false,
      });

      setReportData([]);
      setTotalPrice(0);
      setSummary({
        day: day ? format(day, "yyyy-MM-dd") : "لم يتم تحديد اليوم",
      });
      setTotalPages(1);
      setCurrentPage(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0.00 ج.م";
    }
    return `${Number(amount).toLocaleString("ar-EG")} ج.م`;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    handleFilter(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
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

  const handlePrint = async () => {
    try {
      setIsPrinting(true);

      if (!day || !branchId) {
        Swal.fire({
          icon: "warning",
          title: "بيانات غير مكتملة",
          text: "يرجى تحديد اليوم والفرع أولاً",
          timer: 2000,
          showConfirmButton: false,
        });
        setIsPrinting(false);
        return;
      }

      try {
        const allOrders = await fetchAllOrdersForPrint(day, shiftId, branchId);

        if (allOrders.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "لا توجد بيانات",
            text: "لا توجد بيانات لعرضها في التقرير",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsPrinting(false);
          return;
        }

        const printTotalPrice = allOrders.reduce(
          (sum, order) => sum + (order.totalWithFee || 0),
          0
        );

        const selectedBranchName = branchId
          ? branches.find((b) => b.id === parseInt(branchId))?.name ||
            "الفرع المحدد"
          : "الفرع المحدد";

        const selectedShiftName = shiftId
          ? orderShifts.find((s) => s.id === parseInt(shiftId))?.name ||
            "الوردية المحددة"
          : "جميع الورديات";

        const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير الورديات - Chicken One</title>
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
  
  .print-header h2 {
    color: #333 !important;
    margin: 0 0 10px 0;
    font-size: 16px;
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
  
  .total-amount {
    font-weight: bold;
  }
  
  .total-row {
    background-color: #f0f0f0 !important;
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
  <h1>تقرير الورديات - Chicken One</h1>
  <h2>${selectedShiftName} - ${selectedBranchName}</h2>
  <p>نظام إدارة المطاعم - تقرير حسب الورديات</p>
</div>

<div class="print-info">
  <div>تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}</div>
  ${day ? `<div>اليوم: ${new Date(day).toLocaleDateString("ar-EG")}</div>` : ""}
  <div>الفرع: ${selectedBranchName}</div>
  <div>الوردية: ${selectedShiftName}</div>
  <div>عدد السجلات: ${formatNumberArabic(allOrders.length)}</div>
  <div>الإجمالي الكلي: ${formatCurrencyArabic(printTotalPrice)}</div>
</div>

${
  allOrders.length === 0
    ? `
  <div class="no-data">
    <h3>لا توجد طلبات في اليوم المحدد</h3>
  </div>
`
    : `
  <table class="print-table">
    <thead>
      <tr>
        <th width="50%">رقم الفاتورة</th>
        <th width="50%">الإجمالي</th>
      </tr>
    </thead>
    <tbody>
      ${allOrders
        .map((order) => {
          const orderNumberArabic = order.orderNumber
            ? order.orderNumber.replace(/\d/g, (d) => toArabicNumbers(d))
            : "";

          return `
          <tr>
            <td>${orderNumberArabic}</td>
            <td class="total-amount">${formatCurrencyArabic(
              order.totalWithFee || 0
            )}</td>
          </tr>
        `;
        })
        .join("")}
      <tr class="total-row">
        <td style="text-align: left; padding-right: 20px;">المجموع الكلي لجميع الفواتير:</td>
        <td class="total-amount" style="text-align: center;">${formatCurrencyArabic(
          printTotalPrice
        )}</td>
      </tr>
    </tbody>
  </table>
`
}

<div class="print-footer">
  <p>تم الإنشاء في: ${format(new Date(), "yyyy/MM/dd HH:mm").replace(
    /\d/g,
    (d) => toArabicNumbers(d)
  )}</p>
  <p>Chicken One © ${toArabicNumbers(new Date().getFullYear())}</p>
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
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل بيانات الطباعة",
          timer: 2000,
          showConfirmButton: false,
        });
        setIsPrinting(false);
      }
    } catch (error) {
      console.error("Error in handlePrint:", error);
      setIsPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-6 relative font-sans overflow-hidden transition-colors duration-300"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FaChartBar className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  تقرير الورديات
                </h1>
                <p className="text-white/90 text-sm">
                  تحليل مفصل للطلبات حسب الورديات والفروع
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6" dir="rtl">
          {/* Date Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#E41E26] text-xl" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  فلترة الورديات
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="rtl">
              {/* Day Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  اليوم
                </label>
                <div className="relative group">
                  <DatePicker
                    selected={day}
                    onChange={(date) => setDay(date)}
                    dateFormat="dd/MM/yyyy"
                    className={`w-full border ${
                      darkMode
                        ? "border-gray-600 bg-gray-800 text-white"
                        : "border-gray-200 bg-white text-black"
                    } rounded-lg sm:rounded-xl pl-10 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                    locale="ar"
                    placeholderText="اختر اليوم"
                  />
                </div>
              </div>

              {/* Branch Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  الفرع
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("branch")}
                    className={`w-full flex items-center justify-between border ${
                      darkMode
                        ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-[#E41E26]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#E41E26]"
                    } rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 transition-all group text-sm sm:text-base`}
                  >
                    <div className="flex items-center gap-3">
                      <FaBuilding className="text-[#E41E26] text-sm" />
                      <span>
                        {branchId
                          ? branches.find((b) => b.id === parseInt(branchId))
                              ?.name || "اختر الفرع"
                          : "اختر الفرع"}
                      </span>
                    </div>
                    <motion.div
                      animate={{
                        rotate: openDropdown === "branch" ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown className="text-[#E41E26]" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openDropdown === "branch" && (
                      <motion.ul
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute z-10 mt-2 w-full ${
                          darkMode
                            ? "bg-gray-800 border-gray-600"
                            : "bg-white border-gray-200"
                        } border shadow-xl rounded-lg sm:rounded-xl overflow-hidden max-h-48 overflow-y-auto`}
                      >
                        {branches.map((branch) => (
                          <li
                            key={branch.id}
                            onClick={() => {
                              setBranchId(branch.id.toString());
                              setOpenDropdown(null);
                            }}
                            className={`px-4 py-2.5 sm:py-3 ${
                              darkMode
                                ? "hover:bg-gray-700 text-gray-300 border-gray-600"
                                : "hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] text-gray-700 border-gray-100"
                            } cursor-pointer transition-all text-sm sm:text-base border-b last:border-b-0`}
                          >
                            {branch.name}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Shift Name Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  اسم الوردية
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("shift")}
                    disabled={!day || !branchId || orderShifts.length === 0}
                    className={`w-full flex items-center justify-between border ${
                      darkMode
                        ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-[#E41E26]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#E41E26]"
                    } ${
                      !day || !branchId || orderShifts.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    } rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 transition-all group text-sm sm:text-base`}
                  >
                    <div className="flex items-center gap-3">
                      <FaCalendar className="text-[#E41E26] text-sm" />
                      <span>
                        {shiftId && orderShifts.length > 0
                          ? orderShifts.find((s) => s.id === parseInt(shiftId))
                              ?.name || "اختر الوردية"
                          : day && branchId
                          ? orderShifts.length === 0
                            ? "لا توجد ورديات"
                            : "اختر الوردية"
                          : "اختر اليوم والفرع أولاً"}
                      </span>
                    </div>
                    <motion.div
                      animate={{
                        rotate: openDropdown === "shift" ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaChevronDown className="text-[#E41E26]" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openDropdown === "shift" &&
                      day &&
                      branchId &&
                      orderShifts.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute z-10 mt-2 w-full ${
                            darkMode
                              ? "bg-gray-800 border-gray-600"
                              : "bg-white border-gray-200"
                          } border shadow-xl rounded-lg sm:rounded-xl overflow-hidden max-h-48 overflow-y-auto`}
                        >
                          {orderShifts.map((shift, index) => (
                            <li
                              key={index}
                              onClick={() => {
                                setShiftId(shift.id.toString());
                                setOpenDropdown(null);
                              }}
                              className={`px-4 py-2.5 sm:py-3 ${
                                darkMode
                                  ? "hover:bg-gray-700 text-gray-300 border-gray-600"
                                  : "hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] text-gray-700 border-gray-100"
                              } cursor-pointer transition-all text-sm sm:text-base border-b last:border-b-0`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{shift.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {shift.start
                                    ? formatTimeTo12Hour(shift.start)
                                    : "غير محدد"}
                                </span>
                              </div>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilter(1)}
                disabled={!day || !branchId || !shiftId}
                className={`px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  day && branchId && shiftId
                    ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white cursor-pointer"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <FaFilter />
                تطبيق الفلترة
              </motion.button>

              {reportData && reportData.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 ${
                    isPrinting
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white cursor-pointer"
                  }`}
                >
                  {isPrinting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الطباعة...
                    </>
                  ) : (
                    <>
                      <FaPrint />
                      طباعة التقرير
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Orders Table */}
          {reportData && reportData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
            >
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <FaListAlt className="text-[#E41E26] text-xl" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    تفاصيل الطلبات حسب الورديات
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({totalItems} طلب)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        رقم الفاتورة
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        الإجمالي
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        اسم الفرع
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        اسم الشيفت
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        بداية الشيفت
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        نهاية الشيفت
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
                        <td className="px-4 py-3 text-center font-bold text-[#E41E26] dark:text-[#FDB913]">
                          {formatCurrency(order.totalWithFee)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {order.branch?.name || "غير محدد"}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {order.orderShift?.name || "غير محدد"}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center justify-center gap-1">
                            {order.orderShift?.start
                              ? formatTimeTo12Hour(order.orderShift.start)
                              : "غير محدد"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center justify-center gap-1">
                            {order.orderShift?.end
                              ? formatTimeTo12Hour(order.orderShift.end)
                              : "غير محدد"}
                          </div>
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-t-2 border-gray-200 dark:border-gray-600">
                      <td
                        colSpan="5"
                        className="px-4 py-3 text-center font-bold text-gray-800 dark:text-white"
                      >
                        الإجمالي الكلي لجميع الفواتير:
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xl font-bold text-[#E41E26] dark:text-[#FDB913]">
                          {formatCurrency(totalPrice)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 sm:p-3 rounded-xl transition-all ${
                        currentPage === 1
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <FaChevronRight className="text-sm sm:text-base" />
                    </motion.button>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {getPaginationNumbers().map((pageNum, index) => (
                        <React.Fragment key={index}>
                          {pageNum === "..." ? (
                            <span className="px-2 sm:px-3 py-1 sm:py-2 text-gray-500">
                              ...
                            </span>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl font-semibold transition-all ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white shadow-lg"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {pageNum}
                            </motion.button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 sm:p-3 rounded-xl transition-all ${
                        currentPage === totalPages
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <FaChevronLeft className="text-sm sm:text-base" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(!reportData || reportData.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4 text-gray-400 dark:text-gray-500">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                لا توجد بيانات لعرضها
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                يرجى تحديد اليوم والفرع وتطبيق الفلترة لعرض التقرير
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderShiftsReport;
