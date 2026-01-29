import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaShoppingBag,
  FaFilter,
  FaChevronDown,
  FaTrash,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
  FaReceipt,
  FaBox,
  FaTag,
  FaPlusCircle,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaPrint,
  FaStore,
  FaStickyNote,
  FaInfoCircle,
  FaListAlt,
  FaTruck,
  FaEnvelope,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const BASE_URL = "https://restaurant-template.runasp.net/";
  const wsRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [isAdminOrRestaurant, setIsAdminOrRestaurant] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [wsStatus, setWsStatus] = useState("🔌 Connecting...");

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

  const formatArabicGregorianDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    date.setHours(date.getHours() + 2);

    const year = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      year: "numeric",
      numberingSystem: "arab",
    });

    const month = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      month: "long",
      numberingSystem: "arab",
    });

    const day = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      day: "numeric",
      numberingSystem: "arab",
    });

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "م" : "ص";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const hoursStr = hours
      .toString()
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)] || digit)
      .join("");
    const minutesStr = minutes
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)] || digit)
      .join("");

    return `${day} ${month} ${year} الساعة ${hoursStr}:${minutesStr} ${ampm}`;
  };

  const formatShortArabicDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    date.setHours(date.getHours() + 2);

    const year = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      year: "numeric",
      numberingSystem: "arab",
    });

    const month = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      month: "short",
      numberingSystem: "arab",
    });

    const day = date.toLocaleDateString("ar-SA-u-ca-gregory", {
      calendar: "gregory",
      day: "numeric",
      numberingSystem: "arab",
    });

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "م" : "ص";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const hoursStr = hours
      .toString()
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)] || digit)
      .join("");
    const minutesStr = minutes
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)] || digit)
      .join("");

    return `${day} ${month} ${year} ${hoursStr}:${minutesStr} ${ampm}`;
  };

  const calculateItemFinalPrice = (item) => {
    if (!item) return 0;

    const basePrice =
      item.menuItemBasePriceSnapshotAtOrder > 0
        ? item.menuItemBasePriceSnapshotAtOrder
        : item.basePriceSnapshot ||
          item.menuItem?.basePrice ||
          item.basePriceAtOrder ||
          item.BasePriceSnapshot ||
          0;

    const optionsTotal =
      item.options?.reduce(
        (sum, option) => sum + (option.optionPriceAtOrder || 0),
        0
      ) || 0;

    const itemDiscount = item.totalDiscount || item.TotalDiscount || 0;

    const itemPriceBeforeDiscount =
      (basePrice + optionsTotal) * (item.quantity || item.Quantity || 1);
    const itemFinalPrice = itemPriceBeforeDiscount - itemDiscount;

    return Math.max(itemFinalPrice, 0);
  };

  const calculatePricesFromOrderDetails = (orderDetails) => {
    if (
      !orderDetails ||
      !orderDetails.items ||
      orderDetails.items.length === 0
    ) {
      return {
        subtotal:
          orderDetails?.totalWithoutFee || orderDetails?.TotalWithoutFee || 0,
        totalAdditions: 0,
        totalDiscount:
          orderDetails?.totalDiscount || orderDetails?.TotalDiscount || 0,
        totalBeforeDiscount:
          orderDetails?.totalWithoutFee || orderDetails?.TotalWithoutFee || 0,
        totalAfterDiscountBeforeDelivery:
          (orderDetails?.totalWithoutFee ||
            orderDetails?.TotalWithoutFee ||
            0) -
          (orderDetails?.totalDiscount || orderDetails?.TotalDiscount || 0),
        deliveryFee:
          orderDetails?.deliveryCost ||
          orderDetails?.deliveryFee?.fee ||
          orderDetails?.DeliveryFee?.Fee ||
          orderDetails?.DeliveryCost ||
          0,
        totalWithFee:
          orderDetails?.totalWithFee || orderDetails?.TotalWithFee || 0,
      };
    }

    let subtotal = 0;
    let totalAdditions = 0;
    let totalDiscount = 0;

    orderDetails.items.forEach((item) => {
      const basePrice =
        item.menuItemBasePriceSnapshotAtOrder > 0
          ? item.menuItemBasePriceSnapshotAtOrder
          : item.basePriceSnapshot ||
            item.menuItem?.basePrice ||
            item.BasePriceSnapshot ||
            0;

      subtotal += basePrice * (item.quantity || item.Quantity || 1);

      if (item.options && item.options.length > 0) {
        item.options.forEach((option) => {
          totalAdditions +=
            (option.optionPriceAtOrder || 0) *
            (item.quantity || item.Quantity || 1);
        });
      }

      if (
        (item.totalDiscount && item.totalDiscount > 0) ||
        (item.TotalDiscount && item.TotalDiscount > 0)
      ) {
        totalDiscount += item.totalDiscount || item.TotalDiscount || 0;
      }
    });

    const totalBeforeDiscount = subtotal + totalAdditions;
    const totalAfterDiscountBeforeDelivery =
      totalBeforeDiscount - totalDiscount;
    const deliveryFee =
      orderDetails.deliveryCost ||
      orderDetails.deliveryFee?.fee ||
      orderDetails.DeliveryFee?.Fee ||
      orderDetails.DeliveryCost ||
      0;
    const totalWithFee = totalAfterDiscountBeforeDelivery + deliveryFee;

    return {
      subtotal,
      totalAdditions,
      totalDiscount,
      totalBeforeDiscount,
      totalAfterDiscountBeforeDelivery,
      deliveryFee,
      totalWithFee,
    };
  };

  const getFinalTotal = (order) => {
    return order.totalWithFee || order.TotalWithFee || 0;
  };

  const formatDateForApi = (dateString, isStart = true) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    
    if (isStart) {
      date.setDate(date.getDate() - 1);
    }
    
    date.setHours(date.getHours() + 2);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (isStart) {
      return `${year}-${month}-${day}T22:00:00.000Z`;
    } else {
      return `${year}-${month}-${day}T21:59:59.999Z`;
    }
  };

  const buildFiltersArray = () => {
    const filtersArray = [];

    if (filter && filter !== "all") {
      filtersArray.push({
        propertyName: "status",
        propertyValue: filter,
        range: false,
      });
    }

    if (isAdminOrRestaurantOrBranch && selectedUserId) {
      filtersArray.push({
        propertyName: "userId",
        propertyValue: selectedUserId,
        range: false,
      });
    }

    if (dateRange.start || dateRange.end) {
      if (dateRange.start && dateRange.end) {
        const startDate = formatDateForApi(dateRange.start, true);
        const endDate = formatDateForApi(dateRange.end, false);
        filtersArray.push({
          propertyName: "createdAt",
          propertyValue: `${startDate},${endDate}`,
          range: true,
        });
      } else if (dateRange.start) {
        const startDate = formatDateForApi(dateRange.start, true);
        const endDate = formatDateForApi(dateRange.start, false);
        filtersArray.push({
          propertyName: "createdAt",
          propertyValue: `${startDate},${endDate}`,
          range: true,
        });
      } else if (dateRange.end) {
        const endDate = formatDateForApi(dateRange.end, false);
        filtersArray.push({
          propertyName: "createdAt",
          propertyValue: `${endDate},${endDate}`,
          range: true,
        });
      }
    }

    if (selectedBranchId) {
      filtersArray.push({
        propertyName: "branchId",
        propertyValue: selectedBranchId,
        range: false,
      });
    }

    return filtersArray;
  };

  const fetchOrders = async () => {
    if (isInitialLoad) {
      return;
    }

    try {
      setFetchingOrders(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setOrders([]);
        setFetchingOrders(false);
        return;
      }

      const requestBody = {
        pageNumber: currentPage,
        pageSize: pageSize,
        filters: buildFiltersArray(),
      };

      console.log("Request Body:", JSON.stringify(requestBody, null, 2));

      let url = "/api/Orders/GetAllWithPagination";
      let params = {};

      if (!isAdminOrRestaurantOrBranch) {
        url = "/api/Orders/GetAllForUser";
        if (filter !== "all") {
          params.status = filter;
        }
      }

      let response;
      if (isAdminOrRestaurantOrBranch) {
        response = await axiosInstance.post(url, requestBody);
      } else {
        response = await axiosInstance.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        });
      }

      const responseData = response.data;

      if (isAdminOrRestaurantOrBranch) {
        const ordersData = responseData.data || [];
        setOrders(ordersData);
        setTotalPages(responseData.totalPages || 1);
        setTotalItems(responseData.totalItems || 0);
        setCurrentPage(responseData.pageNumber || 1);
        setPageSize(responseData.pageSize || 10);
      } else {
        setOrders(responseData || []);
        setTotalPages(1);
        setTotalItems(responseData?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (!selectedOrder) {
        showMessage(
          "error",
          "خطأ",
          "فشل تحميل الطلبات. يرجى المحاولة مرة أخرى."
        );
      }
      setOrders([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setFetchingOrders(false);
    }
  };

  // WebSocket Connection
  const connectWebSocket = () => {
    const wsUrl = "wss://proxyserver.runasp.net/ws";
    const tenant = "Chicken_One";
    const joinGroup = `${tenant}-orders`;

    setWsStatus("🔌 Connecting...");

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.addEventListener("open", () => {
      setWsStatus("✅ Connected");
      console.log("WebSocket connection established");

      // Send JOIN message
      const joinMessage = `JOIN:${tenant}:${joinGroup}`;
      wsRef.current.send(joinMessage);
      console.log("Joined group:", joinMessage);
    });

    wsRef.current.addEventListener("message", (event) => {
      console.log("📦 WebSocket message received:", event.data);

      try {
        const wsOrder = JSON.parse(event.data);

        // Convert WebSocket order format to match our app format
        const normalizedOrder = normalizeWebSocketOrder(wsOrder);

        // Add new order to the beginning of the list
        setOrders((prevOrders) => {
          // Check if order already exists
          const existingOrderIndex = prevOrders.findIndex(
            (o) =>
              o.id === normalizedOrder.id ||
              o.orderNumber === normalizedOrder.orderNumber
          );

          if (existingOrderIndex === -1) {
            // New order, add to the beginning
            return [normalizedOrder, ...prevOrders];
          } else {
            // Update existing order
            const updatedOrders = [...prevOrders];
            updatedOrders[existingOrderIndex] = {
              ...updatedOrders[existingOrderIndex],
              ...normalizedOrder,
            };
            return updatedOrders;
          }
        });

        // Update total items count
        setTotalItems((prev) => prev + 1);

        // Show notification for new orders
        if (normalizedOrder.orderNumber) {
          showMessage(
            "info",
            "طلب جديد",
            `تم استلام طلب جديد #${normalizedOrder.orderNumber}`,
            { timer: 3000, forceSwal: false }
          );
        }
      } catch (err) {
        console.error("❌ WebSocket JSON Error:", err, event.data);
      }
    });

    wsRef.current.addEventListener("close", () => {
      setWsStatus("⚠️ Disconnected");
      console.log("WebSocket disconnected");

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          console.log("Attempting to reconnect WebSocket...");
          connectWebSocket();
        }
      }, 5000);
    });

    wsRef.current.addEventListener("error", (err) => {
      console.error("❌ WebSocket Error:", err);
      setWsStatus("❌ Connection Error");
    });
  };

  // Function to normalize WebSocket order format to match our app format
  const normalizeWebSocketOrder = (wsOrder) => {
    let createdAt = wsOrder.CreatedAt || wsOrder.createdAt;
    let updatedAt = wsOrder.UpdatedAt || wsOrder.updatedAt;
    let deliveredAt = wsOrder.DeliveredAt || wsOrder.deliveredAt;

    if (createdAt && createdAt.includes("T")) {
      const date = new Date(createdAt);
      date.setHours(date.getHours() - 2);
      createdAt = date.toISOString();
    }

    if (updatedAt && updatedAt.includes("T")) {
      const date = new Date(updatedAt);
      date.setHours(date.getHours() - 2);
      updatedAt = date.toISOString();
    }

    if (deliveredAt && deliveredAt.includes("T")) {
      const date = new Date(deliveredAt);
      date.setHours(date.getHours() - 2);
      deliveredAt = date.toISOString();
    }

    return {
      id: wsOrder.Id,
      orderNumber: wsOrder.OrderNumber || wsOrder.orderNumber,
      status: wsOrder.Status,
      userId: wsOrder.UserId,
      user: wsOrder.User
        ? {
            id: wsOrder.User.Id,
            firstName: wsOrder.User.FirstName,
            lastName: wsOrder.User.LastName,
            email: wsOrder.User.Email,
            phoneNumber: wsOrder.User.PhoneNumber,
            imageUrl: wsOrder.User.ImageUrl,
          }
        : null,
      deliveryFee: wsOrder.DeliveryFee
        ? {
            id: wsOrder.DeliveryFee.Id,
            areaName: wsOrder.DeliveryFee.AreaName,
            fee: wsOrder.DeliveryFee.Fee,
            estimatedTimeMin: wsOrder.DeliveryFee.EstimatedTimeMin,
            estimatedTimeMax: wsOrder.DeliveryFee.EstimatedTimeMax,
            branchId: wsOrder.DeliveryFee.BranchId,
          }
        : wsOrder.deliveryFee,
      location: wsOrder.Location
        ? {
            id: wsOrder.Location.Id,
            userId: wsOrder.Location.UserId,
            phoneNumber: wsOrder.Location.PhoneNumber,
            streetName: wsOrder.Location.StreetName,
            buildingNumber: wsOrder.Location.BuildingNumber,
            floorNumber: wsOrder.Location.FloorNumber,
            flatNumber: wsOrder.Location.FlatNumber,
            detailedDescription: wsOrder.Location.DetailedDescription,
            city: wsOrder.Location.City,
          }
        : wsOrder.location,
      branch: wsOrder.Branch
        ? {
            id: wsOrder.Branch.Id,
            name: wsOrder.Branch.Name,
            email: wsOrder.Branch.Email,
            address: wsOrder.Branch.Address,
            status: wsOrder.Branch.Status,
          }
        : wsOrder.branch,
      totalDiscount: wsOrder.TotalDiscount || wsOrder.totalDiscount,
      totalWithoutFee: wsOrder.TotalWithoutFee || wsOrder.totalWithoutFee,
      deliveryCost: wsOrder.DeliveryCost || wsOrder.deliveryCost,
      totalWithFee: wsOrder.TotalWithFee || wsOrder.totalWithFee,
      notes: wsOrder.Notes || wsOrder.notes,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deliveredAt: deliveredAt,
      items: wsOrder.Items
        ? wsOrder.Items.map((item) => ({
            id: item.Id,
            quantity: item.Quantity,
            note: item.Note,
            menuItem: item.MenuItem
              ? {
                  id: item.MenuItem.Id,
                  name: item.MenuItem.Name,
                  description: item.MenuItem.Description,
                  basePrice: item.MenuItem.BasePrice,
                  imageUrl: item.MenuItem.ImageUrl,
                }
              : item.menuItem,
            options: item.Options
              ? item.Options.map((opt) => ({
                  optionNameAtOrder:
                    opt.OptionNameAtOrder || opt.optionNameAtOrder,
                  optionPriceAtOrder:
                    opt.OptionPriceAtOrder || opt.optionPriceAtOrder,
                }))
              : item.options,
            nameSnapshot: item.NameSnapshot || item.nameSnapshot,
            descriptionSnapshot:
              item.DescriptionSnapshot || item.descriptionSnapshot,
            basePriceSnapshot: item.BasePriceSnapshot || item.basePriceSnapshot,
            imageUrlSnapshot: item.ImageUrlSnapshot || item.imageUrlSnapshot,
            totalPrice: item.TotalPrice || item.totalPrice,
            totalDiscount: item.TotalDiscount || item.totalDiscount,
          }))
        : wsOrder.items || [],
    };
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    setSelectedOrderForStatus(orders.find((order) => order.id === orderId));
    setNewStatus(currentStatus || "");
    setShowStatusModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedOrderForStatus || !newStatus) {
      showMessage("warning", "تحذير", "يرجى اختيار حالة جديدة");
      return;
    }

    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem("token");

      console.log("Updating order status...", {
        orderId: selectedOrderForStatus.id,
        newStatus: newStatus,
        token: token ? "Token exists" : "No token",
      });

      const response = await axiosInstance.put(
        `/api/Orders/UpdateStatus/${selectedOrderForStatus.id}`,
        { orderStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Status update response:", response);

      if (response.status === 200 || response.status === 204) {
        closeStatusModal();

        showMessage(
          "success",
          "تم بنجاح!",
          `تم تحديث حالة الطلب #${
            selectedOrderForStatus.orderNumber
          } إلى "${getStatusText(newStatus)}"`
        );

        setOrders(
          orders.map((order) =>
            order.id === selectedOrderForStatus.id
              ? { ...order, status: newStatus }
              : order
          )
        );

        if (selectedOrder?.id === selectedOrderForStatus.id && orderDetails) {
          setOrderDetails((prev) => ({
            ...prev,
            status: newStatus,
          }));
        }

        await fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);

      let errorMessage = "فشل تحديث حالة الطلب. يرجى المحاولة مرة أخرى.";
      if (error.response) {
        console.error("Error response data:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }

      showMessage("error", "خطأ", errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async (orderId, e) => {
    if (e) {
      e.stopPropagation();
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد إلغاء هذا الطلب؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، إلغِه!",
      cancelButtonText: "لا",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");

        await axiosInstance.put(
          `/api/Orders/UpdateStatus/${orderId}`,
          { orderStatus: "Cancelled" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "Cancelled",
                }
              : order
          )
        );

        if (selectedOrder?.id === orderId && orderDetails) {
          setOrderDetails((prev) => ({
            ...prev,
            status: "Cancelled",
          }));
        }

        showMessage("success", "تم الإلغاء!", "تم إلغاء الطلب بنجاح.");

        setTimeout(() => {
          fetchOrders();
        }, 500);
      } catch (error) {
        console.error("Error cancelling order:", error);
        showMessage("error", "خطأ", "فشل إلغاء الطلب. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const handleReprintOrder = async (orderId, e) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axiosInstance.get(
        `/api/Orders/ReprintOrder/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showMessage("success", "تم بنجاح!", "تم إرسال طلب إعادة الطباعة بنجاح");
      }
    } catch (error) {
      console.error("Error reprinting order:", error);
      showMessage(
        "error",
        "خطأ",
        "فشل إرسال طلب إعادة الطباعة. يرجى المحاولة مرة أخرى."
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownOpen &&
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target) &&
        !event.target.closest(".status-dropdown-trigger")
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusDropdownOpen]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setIsAdminOrRestaurant(false);
          setLoading(false);
          setIsInitialLoad(false);
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

        const hasAdminOrRestaurantRole =
          userRoles.includes("Admin") || userRoles.includes("Restaurant");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);
        setIsAdminOrRestaurant(hasAdminOrRestaurantRole);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
        setIsAdminOrRestaurant(false);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    if (isAdminOrRestaurantOrBranch) {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const token = localStorage.getItem("token");

          if (!token) {
            setUsers([]);
            return;
          }

          const response = await axiosInstance.get("/api/Users/GetAll", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUsers(response.data || []);
        } catch (error) {
          console.error("Error fetching users:", error);
          setUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [isAdminOrRestaurantOrBranch]);

  useEffect(() => {
    if (isAdminOrRestaurant) {
      const fetchBranches = async () => {
        try {
          setLoadingBranches(true);
          const token = localStorage.getItem("token");

          if (!token) {
            setBranches([]);
            return;
          }

          const response = await axiosInstance.get("/api/Branches/GetList", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setBranches(response.data || []);
        } catch (error) {
          console.error("Error fetching branches:", error);
          setBranches([]);
        } finally {
          setLoadingBranches(false);
        }
      };

      fetchBranches();
    }
  }, [isAdminOrRestaurant]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    dateRange,
    selectedUserId,
    selectedBranchId,
    isAdminOrRestaurantOrBranch,
    isInitialLoad,
    currentPage,
    pageSize,
  ]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isInitialLoad) {
      connectWebSocket();
    }

    // Cleanup WebSocket on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialLoad]);

  const mapStatus = (apiStatus) => {
    const statusMap = {
      Pending: "pending",
      Confirmed: "confirmed",
      Preparing: "preparing",
      OutForDelivery: "out_for_delivery",
      Delivered: "delivered",
      Cancelled: "cancelled",
    };
    return statusMap[apiStatus] || "pending";
  };

  const getStatusText = (apiStatus) => {
    const textMap = {
      Pending: "قيد الانتظار",
      Confirmed: "تم التأكيد",
      Preparing: "قيد التحضير",
      OutForDelivery: "قيد التوصيل",
      Delivered: "تم التوصيل",
      Cancelled: "ملغي",
    };
    return textMap[apiStatus] || apiStatus;
  };

  const getStatusIcon = (status) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "preparing":
        return <FaClock className="text-orange-500" />;
      case "out_for_delivery":
        return <FaShoppingBag className="text-purple-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "preparing":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIconForOption = (status) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "delivered":
        return <FaCheckCircle className="text-green-500 w-4 h-4" />;
      case "confirmed":
        return <FaCheckCircle className="text-blue-500 w-4 h-4" />;
      case "pending":
        return <FaClock className="text-yellow-500 w-4 h-4" />;
      case "preparing":
        return <FaClock className="text-orange-500 w-4 h-4" />;
      case "out_for_delivery":
        return <FaShoppingBag className="text-purple-500 w-4 h-4" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500 w-4 h-4" />;
      default:
        return <FaClock className="text-gray-500 w-4 h-4" />;
    }
  };

  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setLoadingOrderDetails(true);

    try {
      const token = localStorage.getItem("token");
      let details;

      if (isAdminOrRestaurantOrBranch) {
        const response = await axiosInstance.get(
          `/api/Orders/GetById/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        details = response.data;
      } else {
        const response = await axiosInstance.get(
          `/api/Orders/GetByIdForUser/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        details = response.data;
      }

      if (details && details.items) {
        details.items = details.items.map((item) => ({
          ...item,
          menuItemImageUrlSnapshotAtOrder:
            item.menuItemImageUrlSnapshotAtOrder ||
            item.imageUrlSnapshot ||
            (item.menuItem ? item.menuItem.imageUrl : null),
          menuItemNameSnapshotAtOrder:
            item.menuItemNameSnapshotAtOrder ||
            item.nameSnapshot ||
            (item.menuItem ? item.menuItem.name : "عنصر غير معروف"),
          menuItemDescriptionAtOrder:
            item.menuItemDescriptionAtOrder ||
            item.descriptionSnapshot ||
            (item.menuItem ? item.menuItem.description : ""),
          menuItemBasePriceSnapshotAtOrder:
            item.menuItemBasePriceSnapshotAtOrder > 0
              ? item.menuItemBasePriceSnapshotAtOrder
              : item.basePriceSnapshot || item.menuItem?.basePrice || 0,
          totalPrice:
            item.totalPrice < 0 ? Math.abs(item.totalPrice) : item.totalPrice,
        }));
      }

      if (details) {
        const calculatedPrices = calculatePricesFromOrderDetails(details);
        details.calculatedPrices = calculatedPrices;
      }

      setOrderDetails(details);
    } catch (error) {
      console.error("Error fetching order details:", error);
      showMessage("error", "خطأ", "فشل تحميل تفاصيل الطلب.");
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrderForStatus(null);
    setNewStatus("");
    setStatusDropdownOpen(false);
  };

  const handleDateRangeChange = (type, value) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilter("all");
    setDateRange({ start: "", end: "" });
    setSelectedUserId("");
    setSelectedBranchId("");
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    scrollToTop();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const getPaginationNumbers = () => {
    if (totalPages <= 1) return [1];

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

  const statusOptions = [
    { value: "Pending", label: "قيد الانتظار" },
    { value: "Confirmed", label: "تم التأكيد" },
    { value: "Preparing", label: "قيد التحضير" },
    { value: "OutForDelivery", label: "قيد التوصيل" },
    { value: "Delivered", label: "تم التوصيل" },
    { value: "Cancelled", label: "ملغي" },
  ];

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300`}
      >
        <div className="max-w-6xl mx-auto">
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
                  {isAdminOrRestaurantOrBranch ? "جميع الطلبات" : "طلباتي"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  {isAdminOrRestaurantOrBranch
                    ? "إدارة جميع الطلبات"
                    : "تتبع وإدارة طلباتك"}
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
                {totalItems} طلب
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                إجمالي
              </div>
            </div>
          </motion.div>

          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative z-30 dark:bg-gray-800/90"
          >
            <div className="flex flex-col gap-4">
              {/* Status, User and Branch Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Status Filter - Always shown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحالة
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "status" ? null : "status"
                        )
                      }
                      className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <FaFilter className="text-[#E41E26]" />
                        {filter === "all"
                          ? "جميع الحالات"
                          : getStatusText(filter)}
                      </span>
                      <motion.div
                        animate={{
                          rotate: openDropdown === "status" ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown className="text-[#E41E26]" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openDropdown === "status" && (
                        <motion.ul
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                        >
                          {[
                            { value: "all", label: "جميع الحالات" },
                            { value: "Pending", label: "قيد الانتظار" },
                            { value: "Confirmed", label: "تم التأكيد" },
                            { value: "Preparing", label: "قيد التحضير" },
                            {
                              value: "OutForDelivery",
                              label: "قيد التوصيل",
                            },
                            { value: "Delivered", label: "تم التوصيل" },
                            { value: "Cancelled", label: "ملغي" },
                          ].map((item) => (
                            <li
                              key={item.value}
                              onClick={() => {
                                setFilter(item.value);
                                setCurrentPage(1);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                            >
                              {item.label}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* User Filter - Only for admin users */}
                {isAdminOrRestaurantOrBranch && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المستخدم
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "user" ? null : "user"
                          )
                        }
                        className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <FaUser className="text-[#E41E26]" />
                          {selectedUserId
                            ? users.find((u) => u.id === selectedUserId)
                                ?.firstName +
                              " " +
                              users.find((u) => u.id === selectedUserId)
                                ?.lastName
                            : "جميع المستخدمين"}
                        </span>
                        <motion.div
                          animate={{
                            rotate: openDropdown === "user" ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown className="text-[#E41E26]" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {openDropdown === "user" && (
                          <motion.ul
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-64 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                          >
                            <li
                              onClick={() => {
                                setSelectedUserId("");
                                setCurrentPage(1);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                            >
                              جميع المستخدمين
                            </li>
                            {loadingUsers ? (
                              <li className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                جاري تحميل المستخدمين...
                              </li>
                            ) : (
                              users.map((user) => (
                                <li
                                  key={user.id}
                                  onClick={() => {
                                    setSelectedUserId(user.id);
                                    setCurrentPage(1);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                                      {user.imageUrl &&
                                      user.imageUrl !==
                                        "profiles/Default-Image.jpg" ? (
                                        <img
                                          src={`${BASE_URL}${user.imageUrl}`}
                                          alt={user.firstName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E41E26] to-[#FDB913] text-white text-xs">
                                          {user.firstName?.charAt(0)}
                                          {user.lastName?.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {user.firstName} {user.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Branch Filter - Only for Admin and Restaurant roles */}
                {isAdminOrRestaurant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الفرع
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "branch" ? null : "branch"
                          )
                        }
                        className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <FaStore className="text-[#E41E26]" />
                          {selectedBranchId
                            ? branches.find(
                                (b) => b.id.toString() === selectedBranchId
                              )?.name || "فرع غير معروف"
                            : "جميع الفروع"}
                        </span>
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
                            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                          >
                            <li
                              onClick={() => {
                                setSelectedBranchId("");
                                setCurrentPage(1);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                            >
                              جميع الفروع
                            </li>
                            {loadingBranches ? (
                              <li className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                جاري تحميل الفروع...
                              </li>
                            ) : (
                              branches.map((branch) => (
                                <li
                                  key={branch.id}
                                  onClick={() => {
                                    setSelectedBranchId(branch.id.toString());
                                    setCurrentPage(1);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E41E26] to-[#FDB913] flex items-center justify-center text-white text-xs font-bold">
                                      {branch.name.charAt(0)}
                                    </div>
                                    <div className="font-medium">
                                      {branch.name}
                                    </div>
                                  </div>
                                </li>
                              ))
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Filter - Modified for mobile */}
              <div className="space-y-4">
                <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 sm:items-end">
                  {/* على الشاشات الصغيرة: تاريخ البداية يأخذ العرض كامل */}
                  <div className="block sm:hidden space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاريخ البداية
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => {
                          handleDateRangeChange("start", e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاريخ النهاية
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => {
                          handleDateRangeChange("end", e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:flex-1 sm:grid sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاريخ البداية
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => {
                          handleDateRangeChange("start", e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاريخ النهاية
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => {
                          handleDateRangeChange("end", e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="flex pt-2 sm:pt-0">
                      {(dateRange.start ||
                        dateRange.end ||
                        (isAdminOrRestaurantOrBranch && selectedUserId) ||
                        (isAdminOrRestaurant && selectedBranchId) ||
                        filter !== "all") && (
                        <button
                          onClick={clearAllFilters}
                          className="w-full sm:w-auto px-4 py-3 bg-[#E41E26] text-white rounded-xl hover:bg-[#c91c23] transition-colors duration-200 text-sm sm:text-base whitespace-nowrap flex items-center justify-center gap-2"
                        >
                          <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                          مسح الكل
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State when fetching orders */}
          {fetchingOrders && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl mb-6 sm:mb-8 dark:bg-gray-800/80"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26] mb-4"></div>
            </motion.div>
          )}

          {/* Orders List */}
          <div className="space-y-4 sm:space-y-6 relative z-20">
            {!fetchingOrders && (
              <AnimatePresence>
                {orders.map((order, index) => {
                  const finalTotal = getFinalTotal(order);

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 dark:bg-gray-800/90"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 sm:gap-6 mb-3">
                            <div className="min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                                طلب #{order.orderNumber}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {formatArabicGregorianDate(order.createdAt)}
                              </p>
                              {isAdminOrRestaurantOrBranch && order.userId && (
                                <div className="flex items-center gap-2 mt-2">
                                  <FaUser className="text-gray-400 dark:text-gray-500 w-3 h-3" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {users.find((u) => u.id === order.userId)
                                      ?.firstName || "مستخدم غير معروف"}
                                  </span>
                                </div>
                              )}
                              {isAdminOrRestaurant &&
                                order.deliveryFee?.branchId && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <FaStore className="text-gray-400 dark:text-gray-500 w-3 h-3" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {branches.find(
                                        (b) =>
                                          b.id === order.deliveryFee?.branchId
                                      )?.name || "فرع غير معروف"}
                                    </span>
                                  </div>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                  order.status
                                )} whitespace-nowrap`}
                              >
                                {getStatusText(order.status)}
                              </div>
                            </div>
                          </div>

                          {/* Buttons Section */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {isAdminOrRestaurantOrBranch && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(order.id, order.status);
                                }}
                                className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                              >
                                <FaSyncAlt size={10} />
                                تغيير الحالة
                              </motion.button>
                            )}

                            {/* زر إلغاء الطلب - يظهر فقط للمستخدمين الذين لديهم صلاحيات Admin، Restaurant أو Branch */}
                            {isAdminOrRestaurantOrBranch &&
                              order.status !== "Cancelled" &&
                              order.status !== "Delivered" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) =>
                                    handleCancelOrder(order.id, e)
                                  }
                                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                                >
                                  <FaTrash size={10} />
                                  إلغاء الطلب
                                </motion.button>
                              )}

                            {isAdminOrRestaurantOrBranch && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleReprintOrder(order.id, e)}
                                className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                              >
                                <FaPrint size={10} />
                                إعادة طباعة
                              </motion.button>
                            )}
                          </div>

                          {/* Customer/Delivery Info */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-[#E41E26] flex-shrink-0 w-3 h-3" />
                              <span className="truncate">
                                {order.location
                                  ? order.location.streetName ||
                                    "لم يتم تحديد العنوان"
                                  : "الاستلام من المطعم"}
                              </span>
                            </div>
                            {order.location?.phoneNumber && (
                              <div className="flex items-center gap-2 sm:ml-4">
                                <FaPhone className="text-[#E41E26] flex-shrink-0 w-3 h-3" />
                                <span>{order.location.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Total and Action */}
                        <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end lg:items-start gap-3 sm:gap-2 lg:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                          <div className="text-left sm:text-right lg:text-left">
                            <div className="text-lg sm:text-xl font-bold text-[#E41E26]">
                              ج.م {finalTotal.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                              المبلغ الإجمالي
                              {order.totalDiscount > 0 && (
                                <span className="ml-2 text-green-600 dark:text-green-400 flex items-center gap-1">
                                  <FaTag className="w-3 h-3" />
                                  -ج.م {order.totalDiscount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[#E41E26]">
                            {getStatusIcon(order.status)}
                            <span className="text-sm font-semibold whitespace-nowrap">
                              عرض التفاصيل
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {!fetchingOrders && orders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShoppingBag className="text-gray-400 dark:text-gray-500 text-xl sm:text-3xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  لا توجد طلبات
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base px-4">
                  {filter !== "all" ||
                  dateRange.start ||
                  dateRange.end ||
                  selectedUserId ||
                  selectedBranchId
                    ? "حاول تعديل معايير التصفية"
                    : "لم تقم بوضع أي طلبات بعد"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                >
                  ابدأ التسوق
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Pagination - Show only for admin users with pagination */}
          {isAdminOrRestaurantOrBranch && totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
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
        </div>
      </div>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedOrderForStatus && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeStatusModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-visible mx-auto relative">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaSyncAlt className="text-white text-xl sm:text-2xl" />
                      <h2 className="text-lg sm:text-xl font-bold text-white">
                        تغيير حالة الطلب
                      </h2>
                    </div>
                    <button
                      onClick={closeStatusModal}
                      className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <FaTimes className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base mt-2">
                    طلب #{selectedOrderForStatus.orderNumber}
                  </p>
                </div>

                {/* Modal Content */}
                <div className="p-5 sm:p-6 relative">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        الحالة الحالية:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          selectedOrderForStatus.status
                        )}`}
                      >
                        {getStatusText(selectedOrderForStatus.status)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        اختر الحالة الجديدة:
                      </label>

                      {/* Custom Dropdown - Same design as main filter */}
                      <div className="relative" ref={statusDropdownRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setStatusDropdownOpen(!statusDropdownOpen)
                          }
                          className="status-dropdown-trigger w-full flex items-center justify-between border border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <span className="flex items-center gap-2">
                            <FaFilter className="text-blue-500" />
                            {newStatus
                              ? getStatusText(newStatus)
                              : "اختر حالة جديدة"}
                          </span>
                          <motion.div
                            animate={{ rotate: statusDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaChevronDown className="text-blue-500" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {statusDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-[1000] mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                              }}
                            >
                              {statusOptions.map((option) => (
                                <div
                                  key={option.value}
                                  onClick={() => {
                                    setNewStatus(option.value);
                                    setStatusDropdownOpen(false);
                                  }}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-600 dark:hover:to-gray-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-all border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                >
                                  <div className="flex items-center gap-3">
                                    {getStatusIconForOption(option.value)}
                                    <span>{option.label}</span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {newStatus &&
                        newStatus !== selectedOrderForStatus.status && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mt-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                  سيتم تغيير الحالة من:
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                      selectedOrderForStatus.status
                                    )}`}
                                  >
                                    {getStatusText(
                                      selectedOrderForStatus.status
                                    )}
                                  </div>
                                  <span className="text-gray-500">→</span>
                                  <div
                                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                      newStatus
                                    )}`}
                                  >
                                    {getStatusText(newStatus)}
                                  </div>
                                </div>
                              </div>
                              {getStatusIconForOption(newStatus)}
                            </div>
                          </motion.div>
                        )}
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeStatusModal}
                      disabled={updatingStatus}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={submitStatusUpdate}
                      disabled={updatingStatus || !newStatus}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          جاري التحديث...
                        </div>
                      ) : (
                        "تحديث الحالة"
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOrderDetails}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-auto my-auto h-full sm:h-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center gap-3 min-w-0">
                    <FaReceipt className="text-[#E41E26] text-xl sm:text-2xl flex-shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 truncate">
                        طلب #{selectedOrder.orderNumber}
                      </h2>
                      {orderDetails && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(
                              orderDetails.status
                            )} whitespace-nowrap self-start`}
                          >
                            {getStatusText(orderDetails.status)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {formatShortArabicDate(orderDetails.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeOrderDetails}
                    className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 flex-shrink-0 ml-2"
                  >
                    <FaTimes className="text-gray-500 dark:text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  {loadingOrderDetails ? (
                    <div className="flex flex-col items-center justify-center h-48 sm:h-64">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-[#E41E26] mb-4"></div>
                    </div>
                  ) : orderDetails ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Customer Information */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-base sm:text-lg">
                          <FaUser className="text-[#E41E26] flex-shrink-0" />
                          معلومات العميل
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {/* اسم العميل */}
                          {orderDetails.user?.firstName && (
                            <div className="flex items-start gap-2 sm:gap-3">
                              <FaUser className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                  {orderDetails.user.firstName}{" "}
                                  {orderDetails.user.lastName || ""}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* البريد الإلكتروني */}
                          {orderDetails.user?.email && (
                            <div className="flex items-start gap-2 sm:gap-3">
                              <FaEnvelope className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                  {orderDetails.user.email}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* رقم الهاتف */}
                          {orderDetails.user?.phoneNumber && (
                            <div className="flex items-start gap-2 sm:gap-3">
                              <FaPhone className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                  {orderDetails.user.phoneNumber}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* العنوان */}
                          {orderDetails.location ? (
                            <div className="flex items-start gap-2 sm:gap-3">
                              <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                  {orderDetails.location.streetName || ""}{" "}
                                  {orderDetails.location.buildingNumber || ""}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                                  {orderDetails.location.city?.name || ""} -
                                  الطابق{" "}
                                  {orderDetails.location.floorNumber || ""}، شقة{" "}
                                  {orderDetails.location.flatNumber || ""}
                                </p>
                                {orderDetails.location.detailedDescription && (
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
                                    {orderDetails.location.detailedDescription}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 sm:gap-3">
                              <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                  الاستلام من المطعم
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Branch Information for Admin/Restaurant */}
                      {isAdminOrRestaurant &&
                        orderDetails.deliveryFee?.branchId && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-base sm:text-lg">
                              <FaStore className="text-[#E41E26] flex-shrink-0" />
                              معلومات الفرع
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E41E26] to-[#FDB913] flex items-center justify-center text-white font-bold">
                                  {branches
                                    .find(
                                      (b) =>
                                        b.id ===
                                        orderDetails.deliveryFee?.branchId
                                    )
                                    ?.name?.charAt(0) || "ف"}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-gray-200">
                                    {branches.find(
                                      (b) =>
                                        b.id ===
                                        orderDetails.deliveryFee?.branchId
                                    )?.name || "فرع غير معروف"}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    منطقة التوصيل:{" "}
                                    {orderDetails.deliveryFee?.areaName ||
                                      "غير محدد"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Order Items */}
                      {orderDetails.items && orderDetails.items.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-base sm:text-lg">
                            <FaBox className="text-[#E41E26] flex-shrink-0" />
                            العناصر المطلوبة ({orderDetails.items.length})
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            {orderDetails.items.map((item, index) => {
                              const itemFinalPrice =
                                calculateItemFinalPrice(item);

                              const imageUrl =
                                item.menuItemImageUrlSnapshotAtOrder ||
                                item.imageUrlSnapshot ||
                                item.menuItem?.imageUrl;
                              const itemName =
                                item.menuItemNameSnapshotAtOrder ||
                                item.nameSnapshot ||
                                item.menuItem?.name ||
                                "عنصر غير معروف";
                              const itemDescription =
                                item.menuItemDescriptionAtOrder ||
                                item.descriptionSnapshot ||
                                item.menuItem?.description ||
                                "";
                              const basePrice =
                                item.menuItemBasePriceSnapshotAtOrder > 0
                                  ? item.menuItemBasePriceSnapshotAtOrder
                                  : item.basePriceSnapshot ||
                                    item.menuItem?.basePrice ||
                                    0;
                              // eslint-disable-next-line no-unused-vars
                              const totalPrice =
                                item.totalPrice < 0
                                  ? Math.abs(item.totalPrice)
                                  : item.totalPrice;

                              let itemAdditions = 0;
                              if (item.options && item.options.length > 0) {
                                item.options.forEach((option) => {
                                  itemAdditions +=
                                    option.optionPriceAtOrder || 0;
                                });
                              }

                              const itemDiscount = item.totalDiscount || 0;

                              const basePriceWithAdditions =
                                (basePrice + itemAdditions) *
                                (item.quantity || 1);

                              const displayBasePrice =
                                basePrice === 0
                                  ? "السعر حسب الطلب"
                                  : `ج.م ${basePrice.toFixed(2)}`;

                              return (
                                <div
                                  key={index}
                                  className="border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl overflow-hidden"
                                >
                                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-gray-800">
                                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                      {imageUrl ? (
                                        <img
                                          src={`${BASE_URL}${imageUrl}`}
                                          alt={itemName}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z'/%3E%3C/svg%3E";
                                          }}
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                                          <FaBox className="text-gray-400 dark:text-gray-500 text-lg sm:text-xl" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base truncate">
                                        {itemName}
                                      </h4>
                                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        الكمية: {item.quantity}
                                      </p>
                                      {itemDescription && (
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                          {itemDescription}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                                        ج.م {itemFinalPrice.toFixed(2)}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 hidden xs:block">
                                        الأساسي: {displayBasePrice} لكل
                                      </p>
                                      {itemAdditions > 0 && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                          <FaPlusCircle className="inline w-2 h-2 mr-1" />
                                          إضافات: +ج.م{" "}
                                          {itemAdditions.toFixed(2)}
                                        </p>
                                      )}
                                      {itemDiscount > 0 && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                          <FaTag className="inline w-2 h-2 mr-1" />
                                          خصم: -ج.م {itemDiscount.toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* إضافات المنتج */}
                                  {item.options && item.options.length > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 p-3 sm:p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <FaListAlt className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                                        <h5 className="font-medium text-blue-800 dark:text-blue-300 text-sm sm:text-base">
                                          إضافات المنتج
                                        </h5>
                                      </div>
                                      <div className="space-y-2">
                                        {item.options.map(
                                          (option, optIndex) => (
                                            <div
                                              key={optIndex}
                                              className="flex items-center justify-between bg-white dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800"
                                            >
                                              <div className="flex items-center gap-2">
                                                <FaPlusCircle className="text-blue-500 w-3 h-3" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                  {option.optionNameAtOrder ||
                                                    "إضافة"}
                                                </span>
                                              </div>
                                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                +ج.م{" "}
                                                {option.optionPriceAtOrder?.toFixed(
                                                  2
                                                ) || "0.00"}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {item.note && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-800 p-3 sm:p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <FaStickyNote className="text-yellow-600 dark:text-yellow-400 w-4 h-4" />
                                        <h5 className="font-medium text-yellow-800 dark:text-yellow-300 text-sm sm:text-base">
                                          ملاحظات خاصة على المنتج
                                        </h5>
                                      </div>
                                      <p className="text-sm text-yellow-700 dark:text-yellow-400 bg-white dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-yellow-100 dark:border-yellow-800">
                                        {item.note}
                                      </p>
                                    </div>
                                  )}

                                  <div className="bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700 p-3 sm:p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                      <div className="flex items-center gap-2">
                                        <FaInfoCircle className="text-gray-400 dark:text-gray-500 w-3 h-3" />
                                        <span className="text-gray-600 dark:text-gray-400">
                                          السعر الأساسي:
                                        </span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                          {displayBasePrice}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <FaInfoCircle className="text-gray-400 dark:text-gray-500 w-3 h-3" />
                                        <span className="text-gray-600 dark:text-gray-400">
                                          إجمالي الإضافات:
                                        </span>
                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                          +ج.م {itemAdditions.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <FaInfoCircle className="text-gray-400 dark:text-gray-500 w-3 h-3" />
                                        <span className="text-gray-600 dark:text-gray-400">
                                          السعر + الإضافات:
                                        </span>
                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                          ج.م{" "}
                                          {basePriceWithAdditions.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <FaInfoCircle className="text-gray-400 dark:text-gray-500 w-3 h-3" />
                                        <span className="text-gray-600 dark:text-gray-400">
                                          الخصم:
                                        </span>
                                        <span className="font-medium text-green-600 dark:text-green-400">
                                          -ج.م {itemDiscount.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="col-span-full flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <FaInfoCircle className="text-[#E41E26] w-3 h-3" />
                                        <span className="text-gray-600 dark:text-gray-400">
                                          السعر النهائي (بعد الخصم والاضافات):
                                        </span>
                                        <span className="font-bold text-[#E41E26]">
                                          ج.م {itemFinalPrice.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-base sm:text-lg">
                          ملخص الطلب
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                              المجموع الجزئي (العناصر):
                            </span>
                            <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">
                              ج.م{" "}
                              {(
                                orderDetails.calculatedPrices?.subtotal ||
                                orderDetails.totalWithoutFee ||
                                0
                              ).toFixed(2)}
                            </span>
                          </div>

                          {orderDetails.calculatedPrices?.totalAdditions >
                            0 && (
                            <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                              <span className="flex items-center gap-1 text-sm sm:text-base">
                                <FaPlusCircle className="w-3 h-3" />
                                إجمالي الاضافات:
                              </span>
                              <span className="font-medium text-sm sm:text-base">
                                +ج.م{" "}
                                {orderDetails.calculatedPrices?.totalAdditions?.toFixed(
                                  2
                                ) || "0.00"}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                              الإجمالي قبل التوصيل:
                            </span>
                            <span className="font-medium text-sm sm:text-base text-blue-600 dark:text-blue-400">
                              ج.م{" "}
                              {(
                                orderDetails.calculatedPrices
                                  ?.totalBeforeDiscount ||
                                (orderDetails.totalWithoutFee || 0) +
                                  (orderDetails.calculatedPrices
                                    ?.totalAdditions || 0)
                              ).toFixed(2)}
                            </span>
                          </div>

                          {(orderDetails.calculatedPrices?.totalDiscount > 0 ||
                            orderDetails.totalDiscount > 0) && (
                            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                              <span className="flex items-center gap-1 text-sm sm:text-base">
                                <FaTag className="w-3 h-3" />
                                الخصم الكلي:
                              </span>
                              <span className="font-medium text-sm sm:text-base">
                                -ج.م{" "}
                                {(
                                  orderDetails.calculatedPrices
                                    ?.totalDiscount ||
                                  orderDetails.totalDiscount ||
                                  0
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                              الإجمالي بعد الخصم وقبل التوصيل:
                            </span>
                            <span className="font-medium text-sm sm:text-base text-green-600 dark:text-green-400">
                              ج.م{" "}
                              {(
                                orderDetails.calculatedPrices
                                  ?.totalAfterDiscountBeforeDelivery ||
                                (orderDetails.totalWithoutFee || 0) -
                                  (orderDetails.totalDiscount || 0)
                              ).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                              رسوم التوصيل:
                            </span>
                            <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 flex items-center gap-1">
                              <FaTruck className="text-[#E41E26]" />
                              ج.م{" "}
                              {(
                                orderDetails.calculatedPrices?.deliveryFee ||
                                orderDetails.deliveryCost ||
                                orderDetails.deliveryFee?.fee ||
                                0
                              ).toFixed(2)}
                            </span>
                          </div>

                          {orderDetails.deliveryFee && (
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 pl-3 sm:pl-4">
                              <i>
                                {orderDetails.deliveryFee.areaName} -{" "}
                                {orderDetails.deliveryFee.estimatedTimeMin}-
                                {orderDetails.deliveryFee.estimatedTimeMax}{" "}
                                دقيقة
                              </i>
                            </div>
                          )}

                          <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3">
                            <div className="flex justify-between items-center font-bold text-base sm:text-lg">
                              <span className="text-gray-800 dark:text-gray-200">
                                الإجمالي النهائي:
                              </span>
                              <span className="text-[#E41E26]">
                                ج.م{" "}
                                {(
                                  orderDetails.calculatedPrices?.totalWithFee ||
                                  orderDetails.totalWithFee ||
                                  (orderDetails.totalWithoutFee || 0) -
                                    (orderDetails.totalDiscount || 0) +
                                    (orderDetails.deliveryCost ||
                                      orderDetails.deliveryFee?.fee ||
                                      0)
                                ).toFixed(2)}
                              </span>
                            </div>

                            {(orderDetails.calculatedPrices?.totalDiscount >
                              0 ||
                              orderDetails.totalDiscount > 0) && (
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="text-green-600 dark:text-green-400">
                                  لقد وفرت ج.م{" "}
                                  {(
                                    orderDetails.calculatedPrices
                                      ?.totalDiscount ||
                                    orderDetails.totalDiscount ||
                                    0
                                  ).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {orderDetails.notes && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm sm:text-base">
                              <FaStickyNote className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                              ملاحظات عامة على الطلب
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800">
                              {orderDetails.notes}
                            </p>
                          </div>
                        )}

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-sm sm:text-base">
                            <FaInfoCircle className="text-[#E41E26] flex-shrink-0" />
                            معلومات إضافية
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                رقم الطلب:
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {orderDetails.orderNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                حالة الطلب:
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  orderDetails.status
                                )}`}
                              >
                                {getStatusText(orderDetails.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                تاريخ الإنشاء:
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {formatShortArabicDate(orderDetails.createdAt)}
                              </span>
                            </div>
                            {orderDetails.updatedAt && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                  تاريخ التحديث:
                                </span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {formatShortArabicDate(
                                    orderDetails.updatedAt
                                  )}
                                </span>
                              </div>
                            )}
                            {orderDetails.deliveredAt && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                  تاريخ التسليم:
                                </span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {formatShortArabicDate(
                                    orderDetails.deliveredAt
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        {isAdminOrRestaurantOrBranch && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(
                                orderDetails.id,
                                orderDetails.status
                              );
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-sm sm:text-base"
                          >
                            <FaSyncAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                            تغيير حالة الطلب
                          </motion.button>
                        )}

                        {isAdminOrRestaurantOrBranch &&
                          orderDetails.status !== "Cancelled" &&
                          orderDetails.status !== "Delivered" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) =>
                                handleCancelOrder(orderDetails.id, e)
                              }
                              className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm sm:text-base"
                            >
                              <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                              إلغاء الطلب
                            </motion.button>
                          )}

                        {isAdminOrRestaurantOrBranch && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) =>
                              handleReprintOrder(orderDetails.id, e)
                            }
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all text-sm sm:text-base"
                          >
                            <FaPrint className="w-3 h-3 sm:w-4 sm:h-4" />
                            إعادة طباعة
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <FaTimesCircle className="text-red-500 text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                        فشل تحميل تفاصيل الطلب
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        يرجى المحاولة مرة أخرى لاحقاً
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
