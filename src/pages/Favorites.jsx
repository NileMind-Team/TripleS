import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaHome,
  FaArrowRight,
  FaFire,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const navigate = useNavigate();

  // Function to check if device is mobile
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Function to show notification based on device and content
  const showNotification = (type, title, text, options = {}) => {
    // Always use Swal for notifications with buttons
    if (options.showConfirmButton || options.showCancelButton) {
      Swal.fire({
        icon: type,
        title: title,
        text: text,
        timer: options.timer || null,
        showConfirmButton: options.showConfirmButton || false,
        confirmButtonText: options.confirmButtonText,
        showCancelButton: options.showCancelButton,
        cancelButtonText: options.cancelButtonText,
        confirmButtonColor: "#E41E26",
        cancelButtonColor: "#6B7280",
        ...options.swalOptions,
      });
      return;
    }

    // Use toast for simple notifications on mobile only
    if (isMobile()) {
      const toastOptions = {
        position: "top-right",
        autoClose: options.timer || 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        rtl: true,
        style: {
          width: "70%",
          margin: "10px auto",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          maxWidth: "400px",
          minWidth: "250px",
        },
        ...options.toastOptions,
      };

      if (type === "success") {
        toast.success(text, toastOptions);
      } else if (type === "error") {
        toast.error(text, toastOptions);
      } else if (type === "warning") {
        toast.warning(text, toastOptions);
      }
    } else {
      Swal.fire({
        icon: type,
        title: title,
        text: text,
        timer: options.timer || 2000,
        showConfirmButton: false,
        confirmButtonColor: "#E41E26",
        ...options.swalOptions,
      });
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axiosInstance.get("/api/Favorites/GetAll");
        setFavorites(response.data);

        const productsPromises = response.data.map(async (favorite) => {
          try {
            const productResponse = await axiosInstance.get(
              `/api/MenuItems/Get/${favorite.menuItemId}`
            );
            const productData = productResponse.data;

            return {
              id: productData.id,
              name: productData.name,
              category: productData.category?.name?.toLowerCase() || "meals",
              categoryId: productData.category?.id,
              price: productData.basePrice,
              image: productData.imageUrl
                ? `https://restaurant-template.runasp.net/${productData.imageUrl}`
                : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
              ingredients: [],
              description: productData.description,
              isActive: productData.isActive,
              calories: productData.calories,
              preparationTimeStart: productData.preparationTimeStart,
              preparationTimeEnd: productData.preparationTimeEnd,
              availabilityTime: {
                alwaysAvailable: productData.isAllTime,
                startTime:
                  productData.menuItemSchedules?.[0]?.startTime?.substring(
                    0,
                    5
                  ) || "",
                endTime:
                  productData.menuItemSchedules?.[0]?.endTime?.substring(
                    0,
                    5
                  ) || "",
              },
              availabilityDays: {
                everyday: productData.isAllTime,
                specificDays:
                  productData.menuItemSchedules?.map((schedule) =>
                    getDayName(schedule.day)
                  ) || [],
              },
              menuItemSchedules: productData.menuItemSchedules || [],
              itemOffer: productData.itemOffer,
              finalPrice: productData.itemOffer
                ? productData.itemOffer.isPercentage
                  ? productData.basePrice *
                    (1 - productData.itemOffer.discountValue / 100)
                  : productData.basePrice - productData.itemOffer.discountValue
                : productData.basePrice,
              hasOffer:
                productData.itemOffer && productData.itemOffer.isEnabled,
              favoriteId: favorite.id,
            };
          } catch (error) {
            console.error(
              `Error fetching product ${favorite.menuItemId}:`,
              error
            );
            return null;
          }
        });

        const products = await Promise.all(productsPromises);
        const validProducts = products.filter((product) => product !== null);
        setFavoriteProducts(validProducts);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        showNotification("error", "خطأ", "فشل في تحميل المفضلة", {
          timer: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
    fetchCartItemsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchCartItemsCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axiosInstance.get("/api/CartItems/GetAll");
      const cartItems = response.data;

      const totalCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      setCartItemsCount(totalCount);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItemsCount(0);
    }
  };

  const getDayName = (dayNumber) => {
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    return days[dayNumber - 1] || "";
  };

  const extractRequiredOptionsFromError = (errorDescription) => {
    if (!errorDescription) return [];

    let optionsText = errorDescription
      .replace("You must select at least one option for:", "")
      .replace(".", "")
      .trim();

    const optionsList = optionsText
      .split(/،|,|\sو\s/)
      .map((option) => option.trim())
      .filter(Boolean);

    return optionsList;
  };

  const formatOptionsForDisplay = (optionsList) => {
    if (optionsList.length === 0) return "";

    if (optionsList.length === 1) {
      return optionsList[0];
    }

    if (optionsList.length === 2) {
      return `${optionsList[0]} و ${optionsList[1]}`;
    }

    const lastOption = optionsList[optionsList.length - 1];
    const otherOptions = optionsList.slice(0, -1);
    return `${otherOptions.join("، ")} و ${lastOption}`;
  };

  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى السلة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E41E26",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إنشاء حساب جديد",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/register");
        }
      });
      return;
    }

    if (!product.isActive) {
      showNotification(
        "error",
        "المنتج غير متوفر",
        `${product.name} غير متوفر حالياً`,
        { timer: 2000 }
      );
      return;
    }

    try {
      await axiosInstance.post("/api/CartItems/AddCartItem", {
        menuItemId: product.id,
        quantity: 1,
        options: [],
      });

      await fetchCartItemsCount();

      showNotification(
        "success",
        "تم الإضافة إلى السلة!",
        `تم إضافة ${product.name} إلى سلة التسوق`,
        { timer: 1500 }
      );
    } catch (error) {
      console.error("Error adding to cart:", error);

      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        const missingOptionsError = errors.find(
          (err) => err.code === "MissingRequiredOptions"
        );

        if (missingOptionsError) {
          const requiredOptions = extractRequiredOptionsFromError(
            missingOptionsError.description
          );

          if (requiredOptions.length > 0) {
            const formattedOptions = formatOptionsForDisplay(requiredOptions);

            let errorMessage;
            if (requiredOptions.length === 1) {
              errorMessage = `يجب تحديد خيار واحد على الأقل من: ${formattedOptions}. الرجاء عرض تفاصيل المنتج لتحديد الخيارات المطلوبة.`;
            } else {
              errorMessage = `يجب تحديد خيار واحد على الأقل من كل من: ${formattedOptions}. الرجاء عرض تفاصيل المنتج لتحديد الخيارات المطلوبة.`;
            }

            Swal.fire({
              icon: "warning",
              title: "خيارات مطلوبة",
              text: errorMessage,
              showConfirmButton: true,
              confirmButtonText: "عرض التفاصيل",
              showCancelButton: true,
              cancelButtonText: "إلغاء",
              confirmButtonColor: "#E41E26",
              cancelButtonColor: "#6B7280",
            }).then((result) => {
              if (result.isConfirmed) {
                handleProductDetails(product);
              }
            });
            return;
          }
        }
      }

      showNotification("error", "خطأ", "فشل في إضافة المنتج إلى السلة", {
        timer: 2000,
      });
    }
  };

  const handleRemoveFromFavorites = async (favoriteId, productName) => {
    try {
      await axiosInstance.delete(`/api/Favorites/Delete/${favoriteId}`);

      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
      setFavoriteProducts(
        favoriteProducts.filter((product) => product.favoriteId !== favoriteId)
      );

      showNotification(
        "success",
        "تم الإزالة من المفضلة",
        `تم إزالة ${productName} من المفضلة`,
        { timer: 1500 }
      );
    } catch (error) {
      console.error("Error removing from favorites:", error);
      showNotification("error", "خطأ", "فشل في إزالة المنتج من المفضلة", {
        timer: 2000,
      });
    }
  };

  const handleProductDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const formatOfferText = (offer) => {
    if (!offer) return "";
    if (offer.isPercentage) {
      return `خصم ${offer.discountValue}%`;
    } else {
      return `خصم ${offer.discountValue} ج.م`;
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
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 sm:-left-20 -top-10 sm:-top-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border border-white/50 relative overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50"
      >
        <div className="relative h-36 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

          <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-4 sm:px-6 pb-6 sm:pb-8 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3"
            >
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <FaHeart className="text-white text-xl sm:text-2xl md:text-3xl" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                المفضلة
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-xs sm:text-sm md:text-base"
            >
              {favoriteProducts.length} منتج في المفضلة
            </motion.p>
          </div>
        </div>

        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
          {favoriteProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600/50 my-6"
            >
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaHeart className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  المفضلة فارغة
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                  لم تقم بإضافة أي منتجات إلى المفضلة بعد
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinueShopping}
                  className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto text-lg"
                >
                  <FaHome />
                  ابدأ التسوق الآن
                  <FaArrowRight />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 py-6"
              style={{ direction: "rtl" }}
            >
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product.favoriteId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white/80 backdrop-blur-sm dark:bg-gray-700/80 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50 cursor-pointer group w-full relative min-h-[180px] ${
                    !product.isActive ? "opacity-70" : ""
                  }`}
                  onClick={(e) => {
                    const isButtonClick =
                      e.target.closest("button") ||
                      e.target.closest(".no-product-details");

                    if (!isButtonClick) {
                      handleProductDetails(product);
                    }
                  }}
                >
                  {product.itemOffer && product.itemOffer.isEnabled && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 z-10"
                    >
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-1.5">
                        <FaFire
                          className="text-white animate-pulse"
                          size={12}
                        />
                        <span className="text-xs font-bold whitespace-nowrap">
                          {formatOfferText(product.itemOffer)}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div className="sm:hidden">
                    <div className="p-3">
                      <div className="flex">
                        <div className="w-28 flex-shrink-0 ml-3">
                          <div className="relative h-32 w-full overflow-hidden rounded-xl">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-[#E41E26] transition-colors line-clamp-1 mb-2"
                            dir={isArabic(product.name) ? "rtl" : "ltr"}
                          >
                            {product.name}
                          </h3>

                          <p
                            className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1 leading-relaxed"
                            dir={isArabic(product.description) ? "rtl" : "ltr"}
                          >
                            {product.description}
                          </p>

                          <div className="flex items-center gap-1 mb-3">
                            {product.itemOffer &&
                            product.itemOffer.isEnabled ? (
                              <>
                                <div className="text-gray-400 dark:text-gray-500 text-xs line-through">
                                  {product.price} ج.م
                                </div>
                                <div className="text-[#E41E26] font-bold text-sm">
                                  {product.finalPrice.toFixed(2)} ج.م
                                </div>
                              </>
                            ) : (
                              <div className="text-[#E41E26] font-bold text-sm">
                                {product.price} ج.م
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-3 pb-3">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!product.isActive}
                          className={`flex-1 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-xs no-product-details ${
                            product.isActive
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaShoppingCart className="w-3.5 h-3.5" />
                          <span>
                            {!product.isActive ? "غير متوفر" : "أضف إلى السلة"}
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductDetails(product);
                          }}
                          className="flex-1 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-xs no-product-details bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                          <span>عرض التفاصيل</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFavorites(
                              product.favoriteId,
                              product.name
                            );
                          }}
                          className="p-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center text-xs no-product-details text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <FaHeart size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3
                        className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2 group-hover:text-[#E41E26] transition-colors line-clamp-1"
                        dir={isArabic(product.name) ? "rtl" : "ltr"}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 line-clamp-1 leading-relaxed"
                        dir={isArabic(product.description) ? "rtl" : "ltr"}
                      >
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {product.itemOffer && product.itemOffer.isEnabled ? (
                            <>
                              <div className="text-gray-400 dark:text-gray-500 text-sm line-through">
                                {product.price} ج.م
                              </div>
                              <div className="text-[#E41E26] font-bold text-lg sm:text-xl">
                                {product.finalPrice.toFixed(2)} ج.م
                              </div>
                            </>
                          ) : (
                            <div className="text-[#E41E26] font-bold text-lg sm:text-xl">
                              {product.price} ج.م
                            </div>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFavorites(
                              product.favoriteId,
                              product.name
                            );
                          }}
                          className="p-2 sm:p-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center no-product-details text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <FaHeart size={18} />
                        </motion.button>{" "}
                      </div>

                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!product.isActive}
                          className={`flex-1 py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm no-product-details ${
                            product.isActive
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="xs:hidden">
                            {product.isActive ? "أضف إلى السلة" : "غير متوفر"}
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductDetails(product);
                          }}
                          className="flex-1 py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm no-product-details bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                        >
                          <FaEye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="xs:hidden">عرض التفاصيل</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Cart Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-full p-3 sm:p-4 shadow-2xl z-40 cursor-pointer hover:scale-110 transition-transform duration-200 no-product-details ${
          cartItemsCount === 0 ? "opacity-70" : ""
        }`}
        onClick={() => navigate("/cart")}
      >
        <div className="relative">
          <FaShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-[#E41E26] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold">
              {cartItemsCount}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Favorites;
