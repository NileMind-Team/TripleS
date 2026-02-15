import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaShoppingCart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaList,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaSave,
  FaTimes,
  FaLayerGroup,
  FaTag,
  FaHeart,
  FaRegHeart,
  FaFire,
  FaPercent,
  FaCheck,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeroSwipper from "./HeroSwipper";
import { Helmet } from "react-helmet-async";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  // eslint-disable-next-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [categories, setCategories] = useState([
    { id: "all", name: "جميع العناصر" },
    { id: "offers", name: "العروض" },
  ]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", isActive: true });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [pageSize, setPageSize] = useState(8);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [selectedProductForAddons, setSelectedProductForAddons] =
    useState(null);
  const [productAddons, setProductAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [modalNotes, setModalNotes] = useState("");
  const [showModalNotes, setShowModalNotes] = useState(false);

  const categoriesContainerRef = useRef(null);
  const categoriesSectionRef = useRef(null);
  const topOfPageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // Function to show notification based on device and content
  const showNotification = (type, title, text, options = {}) => {
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
        confirmButtonColor: "#2E3D88",
        cancelButtonColor: "#6B7280",
        ...options.swalOptions,
      });
      return;
    }

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
          borderRadius: "12px",
          margin: "10px",
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
        confirmButtonColor: "#2E3D88",
        ...options.swalOptions,
      });
    }
  };

  // Function to preload images
  const preloadImages = (imageUrls) => {
    return new Promise((resolve) => {
      if (imageUrls.length === 0) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const totalImages = imageUrls.length;

      imageUrls.forEach((src) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        img.src = src;
      });
    });
  };

  // Skeleton Loading Component
  const ProductSkeleton = ({ count = 8 }) => {
    return (
      <div
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        style={{ direction: "rtl" }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 w-full relative min-h-[180px] animate-pulse"
          >
            {/* Mobile View Skeleton */}
            <div className="sm:hidden">
              <div className="p-3">
                <div className="flex">
                  <div className="w-28 flex-shrink-0 ml-3">
                    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              <div className="px-3 pb-3">
                <div className="flex gap-2">
                  <div className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>

            {/* Desktop View Skeleton */}
            <div className="hidden sm:block">
              <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700"></div>

              <div className="p-3 sm:p-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                </div>

                <div className="flex gap-2 mt-3 sm:mt-4">
                  <div className="flex-1 py-2 sm:py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 py-2 sm:py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const scrollToCategories = useCallback(() => {
    if (categoriesSectionRef.current) {
      const element = categoriesSectionRef.current;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (location.state) {
      const { selectedCategoryFromFooter, scrollToCategories: shouldScroll } =
        location.state;

      if (selectedCategoryFromFooter) {
        setSelectedCategory(selectedCategoryFromFooter);
        setCurrentPage(1);

        navigate(".", { replace: true, state: {} });

        if (shouldScroll) {
          setTimeout(() => {
            scrollToCategories();
          }, 300);
        }
      }
    }
  }, [location.state, navigate, scrollToCategories]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const roles = userData.roles || [];
        setUserRoles(roles);

        const hasAdminOrRestaurantOrBranchRole =
          roles.includes("Admin") ||
          roles.includes("Restaurant") ||
          roles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/Categories/GetAll");
        const categoriesData = response.data;

        const transformedCategories = [
          { id: "all", name: "جميع العناصر" },
          { id: "offers", name: "العروض" },
          ...categoriesData.map((category) => ({
            id: category.id.toString(),
            name: category.name,
            isActive: category.isActive,
            originalId: category.id,
          })),
        ];

        setCategories(transformedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showNotification("error", "خطأ", "فشل في تحميل التصنيفات", {
          timer: 2000,
        });
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentPage]);

  const buildFiltersArray = () => {
    const filtersArray = [];

    if (selectedCategory !== "all" && selectedCategory !== "offers") {
      filtersArray.push({
        propertyName: "category.id",
        propertyValue: selectedCategory.toString(),
        range: false,
      });
    }
    return filtersArray;
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setImagesLoaded(false);

      const requestBody = {
        pageNumber: currentPage,
        pageSize: pageSize,
        filters: buildFiltersArray(),
      };

      const queryParams =
        selectedCategory === "offers" ? { isHasOffer: true } : {};

      const response = await axiosInstance.post(
        "/api/MenuItems/GetAll",
        requestBody,
        { params: queryParams },
      );

      const responseData = response.data;
      const productsData = responseData.items || responseData.data || [];

      const transformedProducts = productsData.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category?.name?.toLowerCase() || "meals",
        categoryId: product.category?.id,
        price: product.basePrice,
        isPriceBasedOnRequest: product.basePrice === 0,
        image: product.imageUrl
          ? `https://restaurant-template.runasp.net/${product.imageUrl}`
          : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
        ingredients: [],
        description: product.description,
        isActive: product.isActive,
        isAvailable: product.isAvailable !== false, // Assuming true if not specified
        calories: product.calories,
        preparationTimeStart: product.preparationTimeStart,
        preparationTimeEnd: product.preparationTimeEnd,
        availabilityTime: {
          alwaysAvailable: product.isAllTime,
          startTime:
            product.menuItemSchedules?.[0]?.startTime?.substring(0, 5) || "",
          endTime:
            product.menuItemSchedules?.[0]?.endTime?.substring(0, 5) || "",
        },
        availabilityDays: {
          everyday: product.isAllTime,
          specificDays:
            product.menuItemSchedules?.map((schedule) =>
              getDayName(schedule.day),
            ) || [],
        },
        menuItemSchedules: product.menuItemSchedules || [],
        itemOffer: product.itemOffer,
        finalPrice: product.itemOffer
          ? product.itemOffer.isPercentage
            ? product.basePrice * (1 - product.itemOffer.discountValue / 100)
            : product.basePrice - product.itemOffer.discountValue
          : product.basePrice,
        hasOffer: product.itemOffer && product.itemOffer.isEnabled,
      }));

      setProducts(transformedProducts);

      if (selectedCategory === "offers") {
        const offersProducts = transformedProducts.filter(
          (product) => product.itemOffer && product.itemOffer.isEnabled,
        );
        setFilteredProducts(offersProducts);

        const totalItems = offersProducts.length;
        setTotalPages(Math.ceil(totalItems / pageSize));
      } else {
        setFilteredProducts(transformedProducts);

        setTotalPages(
          responseData.totalPages ||
            Math.ceil(
              (responseData.totalCount || productsData.length) / pageSize,
            ),
        );
      }

      const imageUrls = transformedProducts.map((product) => product.image);
      await preloadImages(imageUrls);
      setImagesLoaded(true);
      setProductsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      showNotification("error", "خطأ", "فشل في تحميل المنتجات", {
        timer: 2000,
      });
      setProducts([]);
      setFilteredProducts([]);
      setImagesLoaded(true);
      setProductsLoading(false);
    }
  };

  const fetchCartItemsCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axiosInstance.get("/api/CartItems/GetAll");
      const cartItems = response.data;

      const totalCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      setCartItemsCount(totalCount);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItemsCount(0);
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axiosInstance.get("/api/Favorites/GetAll");
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
    fetchCartItemsCount();
  }, []);

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

  useEffect(() => {
    if (!searchTerm) {
      if (selectedCategory === "offers") {
        const offersProducts = products.filter(
          (product) => product.itemOffer && product.itemOffer.isEnabled,
        );
        setFilteredProducts(offersProducts);
      } else {
        setFilteredProducts(products);
      }
      return;
    }

    let filtered = products;

    if (selectedCategory === "offers") {
      filtered = filtered.filter(
        (product) => product.itemOffer && product.itemOffer.isEnabled,
      );
    }

    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategory]);

  const isProductInFavorites = (productId) => {
    return favorites.some((fav) => fav.menuItemId === productId);
  };

  const handleToggleFavorite = async (product, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى المفضلة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3D88",
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

    try {
      if (isProductInFavorites(product.id)) {
        const favoriteItem = favorites.find(
          (fav) => fav.menuItemId === product.id,
        );
        await axiosInstance.delete(`/api/Favorites/Delete/${favoriteItem.id}`);
        setFavorites(favorites.filter((fav) => fav.menuItemId !== product.id));

        showNotification(
          "success",
          "تم الإزالة",
          `تم إزالة ${product.name} من المفضلة`,
          { timer: 1500 },
        );
      } else {
        await axiosInstance.post("/api/Favorites/Add", {
          menuItemId: product.id,
        });

        const response = await axiosInstance.get("/api/Favorites/GetAll");
        setFavorites(response.data);

        showNotification(
          "success",
          "تم الإضافة",
          `تم إضافة ${product.name} إلى المفضلة`,
          { timer: 1500 },
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showNotification("error", "خطأ", "فشل في تحديث المفضلة", { timer: 2000 });
    }
  };

  const handleProductDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  // Updated function to fetch product addons
  const fetchProductAddons = async (productId) => {
    try {
      setModalLoading(true);
      const response = await axiosInstance.get(
        `/api/MenuItems/Get/${productId}`,
      );
      const productData = response.data;

      const transformedAddons =
        productData.typesWithOptions?.map((type) => ({
          id: type.id,
          title: type.name,
          type: type.canSelectMultipleOptions ? "multiple" : "single",
          required: type.isSelectionRequired,
          canSelectMultipleOptions: type.canSelectMultipleOptions,
          isSelectionRequired: type.isSelectionRequired,
          options:
            type.menuItemOptions?.map((option) => ({
              id: option.id,
              name: option.name,
              price: option.price,
              typeId: type.id,
            })) || [],
        })) || [];

      setProductAddons(transformedAddons);
      setModalLoading(false);
      return transformedAddons;
    } catch (error) {
      console.error("Error fetching product addons:", error);
      setModalLoading(false);
      return [];
    }
  };

  // Updated function to handle add to cart with addons modal
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى السلة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3D88",
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

    if (!isProductAvailableForCart(product)) {
      showNotification(
        "error",
        "المنتج غير متوفر",
        `${product.name} غير متوفر حالياً`,
        { timer: 2000 },
      );
      return;
    }

    // First check if product has required addons
    try {
      // Fetch product details to check for required addons
      const addons = await fetchProductAddons(product.id);

      // Check if there are any required addons
      const requiredAddons = addons.filter(
        (addon) => addon.isSelectionRequired,
      );

      if (requiredAddons.length > 0) {
        // Show addons modal instead of going to details page
        setSelectedProductForAddons(product);
        setProductAddons(addons);
        setSelectedAddons({}); // Reset selected addons
        setModalNotes(""); // Reset notes
        setShowAddonsModal(true);
        return;
      }

      // If no required addons, add directly to cart
      await addProductToCartDirectly(product.id, []);
    } catch (error) {
      console.error("Error checking product addons:", error);
      // If there's an error fetching addons, try to add directly
      try {
        await addProductToCartDirectly(product.id, []);
      } catch (innerError) {
        console.error("Error adding to cart:", innerError);
        showNotification("error", "خطأ", "فشل في إضافة المنتج إلى السلة", {
          timer: 2000,
        });
      }
    }
  };

  // Function to add product to cart directly (without modal)
  const addProductToCartDirectly = async (productId, options = []) => {
    setAddingToCart(productId);

    try {
      await axiosInstance.post("/api/CartItems/AddCartItem", {
        menuItemId: productId,
        note: "",
        quantity: 1,
        options: options,
      });

      await fetchCartItemsCount();

      const product = products.find((p) => p.id === productId);
      if (product) {
        showNotification(
          "success",
          "تم الإضافة إلى السلة!",
          `تم إضافة ${product.name} إلى سلة التسوق`,
          { timer: 1500 },
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    } finally {
      setTimeout(() => {
        setAddingToCart(null);
      }, 500);
    }
  };

  // Function to handle addon selection in modal
  const handleAddonSelect = (addonId, optionId, type) => {
    setSelectedAddons((prev) => {
      const newSelectedAddons = { ...prev };

      if (type === "single") {
        newSelectedAddons[addonId] = [optionId];
      } else {
        const currentSelections = newSelectedAddons[addonId] || [];

        if (currentSelections.includes(optionId)) {
          newSelectedAddons[addonId] = currentSelections.filter(
            (id) => id !== optionId,
          );
        } else {
          newSelectedAddons[addonId] = [...currentSelections, optionId];
        }

        if (newSelectedAddons[addonId].length === 0) {
          delete newSelectedAddons[addonId];
        }
      }

      return newSelectedAddons;
    });
  };

  // Function to add product with selected addons
  const handleAddToCartWithAddons = async () => {
    if (!selectedProductForAddons) return;

    // Check if all required addons are selected
    const requiredAddons = productAddons.filter(
      (addon) => addon.isSelectionRequired,
    );
    const missingRequiredAddons = requiredAddons.filter(
      (addon) => !selectedAddons[addon.id],
    );

    if (missingRequiredAddons.length > 0) {
      showNotification(
        "warning",
        "خيارات مطلوبة",
        `يرجى اختيار ${missingRequiredAddons
          .map((addon) => addon.title)
          .join(" و ")}`,
        { timer: 2000 },
      );
      return;
    }

    // Prepare options array
    const options = [];
    Object.values(selectedAddons).forEach((optionIds) => {
      optionIds.forEach((optionId) => {
        options.push(optionId);
      });
    });

    // Add to cart
    try {
      setAddingToCart(selectedProductForAddons.id);

      await axiosInstance.post("/api/CartItems/AddCartItem", {
        menuItemId: selectedProductForAddons.id,
        note: modalNotes.trim(), // إرسال الملاحظات مع الطلب
        quantity: 1,
        options: options,
      });

      await fetchCartItemsCount();

      showNotification(
        "success",
        "تم الإضافة إلى السلة!",
        `تم إضافة ${selectedProductForAddons.name} إلى سلة التسوق`,
        { timer: 1500 },
      );

      // Close modal and reset states
      handleCloseAddonsModal();
    } catch (error) {
      console.error("Error adding to cart with addons:", error);
      showNotification("error", "خطأ", "فشل في إضافة المنتج إلى السلة", {
        timer: 2000,
      });
    } finally {
      setTimeout(() => {
        setAddingToCart(null);
      }, 500);
    }
  };

  // Function to close addons modal
  const handleCloseAddonsModal = () => {
    setShowAddonsModal(false);
    setSelectedProductForAddons(null);
    setProductAddons([]);
    setSelectedAddons({});
    setModalNotes(""); // Reset notes
    setShowModalNotes(false); // Reset notes modal state
    setModalLoading(false);
  };

  const handleEditProduct = (product, e) => {
    e.stopPropagation();
    navigate("/products/edit", { state: { productId: product.id } });
  };

  const handleManageOffers = async (product, e) => {
    e.stopPropagation();

    try {
      const response = await axiosInstance.get("/api/ItemOffers/GetAll");
      const offersData = response.data;

      const existingOffer = offersData.find(
        (offer) => offer.menuItemId === product.id,
      );

      if (existingOffer) {
        navigate("/admin/item-offers", {
          state: {
            selectedProductId: product.id,
            selectedOfferId: existingOffer.id,
          },
        });
      } else {
        navigate("/admin/item-offers", {
          state: {
            selectedProductId: product.id,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const handleDeleteProduct = async (productId, e) => {
    e.stopPropagation();

    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3D88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/MenuItems/Delete/${productId}`);

          setProducts(products.filter((product) => product.id !== productId));
          showNotification("success", "تم الحذف!", "تم حذف المنتج بنجاح", {
            timer: 2000,
          });
          fetchProducts();
        } catch (error) {
          console.error("Error deleting product:", error);
          showNotification("error", "خطأ", "فشل في حذف المنتج", {
            timer: 2000,
          });
        }
      }
    });
  };

  // تحديث دالة handleToggleActive لتأخذ بعين الاعتبار كلا من isActive و isAvailable
  const isProductActive = (product) => {
    // المنتج يعتبر مفعل إذا كان isActive = true و isAvailable = true
    return product.isActive && product.isAvailable;
  };

  const handleToggleActive = async (productId, e) => {
    e.stopPropagation();

    const productToToggle = products.find((p) => p.id === productId);
    if (productToToggle && productToToggle.categoryId) {
      const category = categories.find(
        (cat) => cat.originalId === productToToggle.categoryId,
      );
      if (category && !category.isActive) {
        showNotification(
          "error",
          "لا يمكن التعديل",
          "لا يمكن تعديل حالة المنتج لأن الفئة معطلة",
          { timer: 2000 },
        );
        return;
      }
    }

    try {
      // تحديث حالة المنتج
      await axiosInstance.put(
        `/api/MenuItems/ChangeMenuItemActiveStatus/${productId}`,
      );

      fetchProducts();

      const product = products.find((p) => p.id === productId);
      const isCurrentlyActive = isProductActive(product);
      showNotification(
        "success",
        "تم تحديث الحالة!",
        `تم ${isCurrentlyActive ? "تعطيل" : "تفعيل"} المنتج`,
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      showNotification("error", "خطأ", "فشل في تحديث حالة المنتج", {
        timer: 2000,
      });
    }
  };

  const handleAddNewProduct = () => {
    navigate("/products/new");
  };

  const handleEditCategory = (category) => {
    if (category.id === "all" || category.id === "offers") {
      showNotification(
        "error",
        "لا يمكن التعديل",
        "لا يمكن تعديل هذا التصنيف",
        { timer: 2000 },
      );
      return;
    }
    setEditingCategory({ ...category });
    setNewCategory({ name: "", isActive: true });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) {
      showNotification("error", "خطأ", "اسم التصنيف مطلوب", { timer: 2000 });
      return;
    }

    if (editingCategory.id === "all" || editingCategory.id === "offers") {
      showNotification(
        "error",
        "لا يمكن التعديل",
        "لا يمكن تعديل هذا التصنيف",
        { timer: 2000 },
      );
      return;
    }

    try {
      await axiosInstance.put(
        `/api/Categories/Update/${editingCategory.originalId}`,
        {
          name: editingCategory.name,
          isActive: editingCategory.isActive,
        },
      );

      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...editingCategory } : cat,
        ),
      );

      setEditingCategory(null);
      showNotification("success", "تم التحديث!", "تم تحديث التصنيف بنجاح", {
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      showNotification("error", "خطأ", "فشل في تحديث التصنيف", { timer: 2000 });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      showNotification("error", "خطأ", "اسم التصنيف مطلوب", { timer: 2000 });
      return;
    }

    try {
      const response = await axiosInstance.post("/api/Categories/Add", null, {
        params: {
          Name: newCategory.name,
          IsActive: newCategory.isActive,
        },
      });

      const newCategoryData = response.data;

      const newCat = {
        id: newCategoryData.id.toString(),
        name: newCategoryData.name,
        isActive: newCategoryData.isActive,
        originalId: newCategoryData.id,
      };

      setCategories([...categories, newCat]);
      setNewCategory({ name: "", isActive: true });

      showNotification(
        "success",
        "تم الإضافة!",
        "تم إضافة التصنيف الجديد بنجاح",
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error adding category:", error);
      showNotification("error", "خطأ", "فشل في إضافة التصنيف", { timer: 2000 });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (categoryId === "all" || categoryId === "offers") {
      showNotification("error", "لا يمكن الحذف", "لا يمكن حذف هذا التصنيف", {
        timer: 2000,
      });
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);

    const productsInCategory = products.filter(
      (product) => product.categoryId === category.originalId,
    );

    if (productsInCategory.length > 0) {
      Swal.fire({
        title: "لا يمكن حذف التصنيف",
        text: `يوجد ${productsInCategory.length} منتج في هذا التصنيف. يرجى إعادة تعيين أو حذف هذه المنتجات أولاً.`,
        icon: "warning",
        confirmButtonColor: "#2E3D88",
        confirmButtonText: "حسناً",
      });
      return;
    }

    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2E3D88",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(
            `/api/Categories/Delete/${category.originalId}`,
          );

          setCategories(categories.filter((cat) => cat.id !== categoryId));

          if (selectedCategory === categoryId) {
            setSelectedCategory("all");
          }

          showNotification("success", "تم الحذف!", "تم حذف التصنيف بنجاح", {
            timer: 2000,
          });
        } catch (error) {
          console.error("Error deleting category:", error);
          showNotification("error", "خطأ", "فشل في حذف التصنيف", {
            timer: 2000,
          });
        }
      }
    });
  };

  const handleToggleCategoryActive = async (categoryId, e) => {
    e.stopPropagation();

    if (categoryId === "all" || categoryId === "offers") {
      showNotification(
        "error",
        "لا يمكن التعديل",
        "لا يمكن تعديل هذا التصنيف",
        { timer: 2000 },
      );
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);

    try {
      await axiosInstance.put(
        `/api/Categories/ChangeCategoryActiveStatus/${category.originalId}`,
      );

      setCategories(
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat,
        ),
      );

      showNotification(
        "success",
        "تم تحديث الحالة!",
        `تم ${category.isActive ? "تعطيل" : "تفعيل"} التصنيف`,
        { timer: 1500 },
      );
    } catch (error) {
      console.error("Error updating category status:", error);
      showNotification("error", "خطأ", "فشل في تحديث حالة التصنيف", {
        timer: 2000,
      });
    }
  };

  const handleOpenCategoriesManager = () => {
    setShowCategoriesManager(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseCategoriesManager = () => {
    setShowCategoriesManager(false);
    setEditingCategory(null);
    setNewCategory({ name: "", isActive: true });
    document.body.style.overflow = "auto";
  };

  const scrollCategories = (direction) => {
    const container = categoriesContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - categoriesContainerRef.current.offsetLeft);
    setScrollLeft(categoriesContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - categoriesContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - categoriesContainerRef.current.offsetLeft);
    setScrollLeft(categoriesContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - categoriesContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
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

  const formatPriceDisplay = (product) => {
    if (product.isPriceBasedOnRequest) {
      return (
        <div className="text-[#2E3D88] font-bold text-lg sm:text-xl">
          السعر حسب الطلب
        </div>
      );
    }

    if (product.itemOffer && product.itemOffer.isEnabled) {
      return (
        <>
          <div className="text-gray-400 dark:text-gray-500 text-sm line-through">
            {product.price} ج.م
          </div>
          <div className="text-[#2E3D88] font-bold text-lg sm:text-xl">
            {product.finalPrice.toFixed(2)} ج.م
          </div>
        </>
      );
    }

    return (
      <div className="text-[#2E3D88] font-bold text-lg sm:text-xl">
        {product.price} ج.م
      </div>
    );
  };

  const formatPriceDisplayMobile = (product) => {
    if (product.isPriceBasedOnRequest) {
      return (
        <div className="text-[#2E3D88] font-bold text-sm">السعر حسب الطلب</div>
      );
    }

    if (product.itemOffer && product.itemOffer.isEnabled) {
      return (
        <>
          <div className="text-gray-400 dark:text-gray-500 text-xs line-through">
            {product.price} ج.م
          </div>
          <div className="text-[#2E3D88] font-bold text-sm">
            {product.finalPrice.toFixed(2)} ج.م
          </div>
        </>
      );
    }

    return (
      <div className="text-[#2E3D88] font-bold text-sm">
        {product.price} ج.م
      </div>
    );
  };

  const isProductCategoryDisabled = (product) => {
    if (!product.categoryId) {
      return false;
    }

    const category = categories.find(
      (cat) => cat.originalId === product.categoryId,
    );

    if (!category) {
      return true;
    }

    return !category.isActive;
  };

  const isProductAvailableForCart = (product) => {
    // المنتج متاح إذا كان:
    // 1. isActive = true
    // 2. isAvailable = true
    // 3. الفئة مفعلة

    if (!product.isActive) {
      return false;
    }

    if (!product.isAvailable) {
      return false;
    }

    if (isProductCategoryDisabled(product)) {
      return false;
    }

    return true;
  };

  const canToggleProductActive = (product) => {
    if (!product.categoryId) return true;

    const category = categories.find(
      (cat) => cat.originalId === product.categoryId,
    );
    return !category || category.isActive;
  };

  const checkLogin = (action) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: `يجب تسجيل الدخول للوصول إلى ${action}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2E3D88",
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
      return false;
    }
    return true;
  };

  const handleNavigateToFavorites = () => {
    if (!checkLogin("صفحة المفضلة")) return;
    navigate("/favorites");
  };

  const handleNavigateToCart = () => {
    if (!checkLogin("سلة التسوق")) return;
    navigate("/cart");
  };

  const handleCategorySelectFromFooter = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setTimeout(() => {
      scrollToCategories();
    }, 100);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      scrollToCategories();
    }, 100);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setTimeout(() => {
        scrollToCategories();
      }, 100);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setTimeout(() => {
        scrollToCategories();
      }, 100);
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

  useEffect(() => {
    const handleCategorySelectedFromFooter = (event) => {
      const { categoryId, fromHomePage } = event.detail;
      if (fromHomePage) {
        handleCategorySelectFromFooter(categoryId);
      } else {
        handleCategorySelectFromFooter(categoryId);
      }
    };

    window.addEventListener(
      "categorySelectedFromFooter",
      handleCategorySelectedFromFooter,
    );

    return () => {
      window.removeEventListener(
        "categorySelectedFromFooter",
        handleCategorySelectedFromFooter,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToCategories]);

  const isAdmin = userRoles.includes("Admin");
  const isRestaurant = userRoles.includes("Restaurant");
  const isBranch = userRoles.includes("Branch");

  const canShowAdminButtons = isAdmin || isRestaurant;
  const canShowToggleButton = isAdmin || isRestaurant || isBranch;

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

      {/* Addons Modal - Responsive بدون اسكرول داخلي */}
      {showAddonsModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={handleCloseAddonsModal}
          />
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4"
            onClick={handleCloseAddonsModal}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-full max-w-[95vw] sm:max-w-2xl mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
            >
              <div className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white p-4 sm:p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-white/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                      <FaLayerGroup className="text-lg sm:text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                        اختيار الإضافات
                      </h2>
                      <p className="text-white/80 mt-1 text-sm sm:text-base">
                        {selectedProductForAddons?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseAddonsModal}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white hover:bg-white/30 flex-shrink-0"
                  >
                    <FaTimes className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              <div
                className="p-3 sm:p-4 md:p-6 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 12rem)" }}
              >
                {modalLoading ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-4 border-b-4 border-[#2E3D88]"></div>
                  </div>
                ) : productAddons.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                      لا توجد إضافات مطلوبة لهذا المنتج
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
                        يرجى اختيار الإضافات المطلوبة لهذا المنتج:
                      </p>

                      <div className="space-y-3 sm:space-y-4 md:space-y-6">
                        {productAddons.map((addon) => (
                          <div
                            key={addon.id}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 dark:text-gray-200">
                                  {addon.title}
                                </h3>
                                <div className="flex gap-1 sm:gap-2">
                                  {addon.isSelectionRequired && (
                                    <span className="text-[10px] sm:text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                      مطلوب
                                    </span>
                                  )}
                                  {addon.canSelectMultipleOptions && (
                                    <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                      متعدد
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2">
                              {addon.options.map((option) => {
                                const isSelected = selectedAddons[
                                  addon.id
                                ]?.includes(option.id);
                                return (
                                  <div key={option.id} className="w-full">
                                    <button
                                      onClick={() =>
                                        handleAddonSelect(
                                          addon.id,
                                          option.id,
                                          addon.type,
                                        )
                                      }
                                      className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                                        isSelected
                                          ? "border-[#2E3D88] bg-blue-50 dark:bg-blue-900/20"
                                          : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1 sm:gap-2 truncate min-w-0">
                                        <span
                                          className={`font-medium text-xs sm:text-sm md:text-base truncate ${
                                            isSelected
                                              ? "text-[#2E3D88]"
                                              : "text-gray-700 dark:text-gray-300"
                                          }`}
                                        >
                                          {option.name}
                                        </span>
                                        {isSelected && (
                                          <FaCheck className="text-[#2E3D88] flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                                        )}
                                      </div>

                                      {option.price > 0 && (
                                        <span className="text-xs sm:text-sm md:text-base text-green-600 dark:text-green-400 font-semibold whitespace-nowrap flex-shrink-0 mr-1 sm:mr-2">
                                          +{option.price} ج.م
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        <div
                          onClick={() => setShowModalNotes(true)}
                          className={`w-full rounded-lg sm:rounded-xl p-3 sm:p-4 text-center transition-all duration-300 cursor-pointer ${
                            modalNotes
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-solid border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500"
                              : "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border-2 border-dashed border-indigo-300 dark:border-indigo-600 hover:border-solid hover:border-indigo-400 dark:hover:border-indigo-500"
                          }`}
                          dir="rtl"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div
                              className={`p-2 rounded-full ${
                                modalNotes
                                  ? "bg-green-100 dark:bg-green-800/50"
                                  : "bg-indigo-100 dark:bg-indigo-800/50"
                              }`}
                            >
                              <svg
                                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                  modalNotes
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-indigo-600 dark:text-indigo-400"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4
                                className={`font-semibold text-sm sm:text-base md:text-lg ${
                                  modalNotes
                                    ? "text-green-700 dark:text-green-300"
                                    : "text-indigo-700 dark:text-indigo-300"
                                }`}
                              >
                                {modalNotes
                                  ? "تعليمات إضافية"
                                  : "إضافة تعليمات إضافية"}
                              </h4>
                              <p
                                className={`text-xs sm:text-sm mt-1 ${
                                  modalNotes
                                    ? "text-green-600/70 dark:text-green-400/70"
                                    : "text-indigo-600/70 dark:text-indigo-400/70"
                                }`}
                              >
                                {modalNotes
                                  ? `انقر لتعديل التعليمات: ${modalNotes.substring(
                                      0,
                                      60,
                                    )}${modalNotes.length > 60 ? "..." : ""}`
                                  : "انقر لإضافة تعليمات إضافية"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
                      <button
                        onClick={handleCloseAddonsModal}
                        className="flex-1 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleAddToCartWithAddons}
                        disabled={addingToCart === selectedProductForAddons?.id}
                        className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base ${
                          addingToCart === selectedProductForAddons?.id
                            ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white cursor-wait"
                            : "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-lg transition-all"
                        }`}
                      >
                        {addingToCart === selectedProductForAddons?.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white"></div>
                            <span>يتم الإضافة...</span>
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>أضف إلى السلة</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showModalNotes && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[102]"
            onClick={() => setShowModalNotes(false)}
          />
          <div
            className="fixed inset-0 z-[103] flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowModalNotes(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-md mx-2 sm:mx-4 p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-800/50 p-2 rounded-full">
                    <svg
                      className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    تعليمات إضافية
                  </h3>
                </div>
                <button
                  onClick={() => setShowModalNotes(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  اكتب أي ملاحظات
                </p>

                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="اكتب تعليماتك هنا..."
                  className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent resize-none"
                  dir="rtl"
                  maxLength={500}
                  autoFocus
                />

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    اختياري
                  </span>
                  <span
                    className={`text-xs ${
                      modalNotes.length >= 450
                        ? "text-red-500"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {modalNotes.length}/500
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModalNotes("");
                    showNotification(
                      "info",
                      "تم المسح",
                      "تم مسح التعليمات الإضافية",
                      { timer: 1500 },
                    );
                  }}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaTrash className="text-sm" />
                  مسح
                </button>
                <button
                  onClick={() => setShowModalNotes(false)}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    setShowModalNotes(false);
                    showNotification(
                      "success",
                      "تم بنجاح!",
                      "تم حفظ التعليمات الإضافية",
                      { timer: 1500 },
                    );
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaCheck className="text-sm" />
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="min-h-screen bg-gradient-to-br from-white via-[#f0f3ff] to-[#d9e0f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 font-sans relative overflow-x-hidden">
        <div ref={topOfPageRef}></div>

        <HeroSwipper />

        <div
          ref={categoriesSectionRef}
          className="relative max-w-6xl mx-auto -mt-8 md:-mt-12 px-2 sm:px-4 z-20 w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 md:p-4 relative w-full">
            <button
              onClick={() => scrollCategories("left")}
              className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#2E3D88] z-10 shadow-lg"
            >
              <FaChevronLeft size={14} className="sm:w-4" />
            </button>

            <div
              ref={categoriesContainerRef}
              className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-4 px-6 sm:px-8 cursor-grab active:cursor-grabbing select-none"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                direction: "rtl",
              }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setCurrentPage(1);
                    setTimeout(() => {
                      scrollToCategories();
                    }, 50);
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  } ${
                    !category.isActive &&
                    category.id !== "all" &&
                    category.id !== "offers"
                      ? "opacity-60"
                      : ""
                  }`}
                  style={{ direction: "rtl" }}
                >
                  <span className="whitespace-nowrap">{category.name}</span>
                  {category.id !== "all" &&
                    category.id !== "offers" &&
                    !category.isActive && (
                      <span className="text-xs text-red-500">(معطل)</span>
                    )}
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollCategories("right")}
              className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#2E3D88] z-10 shadow-lg"
            >
              <FaChevronRight size={14} className="sm:w-4" />
            </button>
          </div>
        </div>

        {/* Products Grid - Show skeleton until both data and images are loaded */}
        <div className="relative z-10 w-full">
          {productsLoading || !imagesLoaded ? (
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full">
              <ProductSkeleton count={pageSize} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full">
              <div className="text-center py-12 md:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2">
                <FaEye className="mx-auto text-4xl md:text-6xl text-gray-400 mb-4" />
                <h3 className="text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {selectedCategory === "offers"
                    ? "لا توجد عروض حالياً"
                    : "لم يتم العثور على منتجات"}
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-4 px-4">
                  {selectedCategory === "offers"
                    ? "لا توجد منتجات تحتوي على عروض حالياً"
                    : "حاول تعديل معايير التصفية"}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentPage(1);
                    setTimeout(() => {
                      scrollToCategories();
                    }, 50);
                  }}
                  className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white px-6 py-3 rounded-xl font-semibold shadow-lg text-sm md:text-base"
                >
                  عرض جميع المنتجات
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full relative">
              <div
                className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                style={{ direction: "rtl" }}
              >
                {filteredProducts.map((product) => (
                  <div
                    key={`${product.id}-${currentPage}`}
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer w-full relative min-h-[180px] ${
                      !isProductAvailableForCart(product) ? "opacity-70" : ""
                    } ${isProductCategoryDisabled(product) ? "opacity-80" : ""}`}
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
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-1.5">
                          <FaFire className="text-white" size={12} />
                          <span className="text-xs font-bold whitespace-nowrap">
                            {formatOfferText(product.itemOffer)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Admin/Restaurant/Branch Buttons */}
                    {(canShowAdminButtons || canShowToggleButton) && (
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                        {/* Toggle Active Button - Available for Admin, Restaurant, and Branch */}
                        {canShowToggleButton && (
                          <button
                            onClick={(e) => {
                              if (!canToggleProductActive(product)) {
                                showNotification(
                                  "error",
                                  "لا يمكن التعديل",
                                  "لا يمكن تعديل حالة المنتج لأن الفئة معطلة",
                                  { timer: 2000 },
                                );
                                return;
                              }
                              handleToggleActive(product.id, e);
                            }}
                            disabled={!canToggleProductActive(product)}
                            className={`p-2 rounded-lg shadow-lg text-xs no-product-details ${
                              isProductActive(product)
                                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            } ${
                              !canToggleProductActive(product)
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {isProductActive(product) ? (
                              <FaTimesCircle size={12} />
                            ) : (
                              <FaCheckCircle size={12} />
                            )}
                          </button>
                        )}

                        {/* Admin/Restaurant Only Buttons */}
                        {canShowAdminButtons && (
                          <>
                            <button
                              onClick={(e) => handleEditProduct(product, e)}
                              className="bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 no-product-details"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={(e) => handleManageOffers(product, e)}
                              className="bg-purple-500 text-white p-2 rounded-lg shadow-lg hover:bg-purple-600 no-product-details"
                            >
                              <FaPercent size={12} />
                            </button>
                            <button
                              onClick={(e) =>
                                handleDeleteProduct(product.id, e)
                              }
                              className="bg-red-500 text-white p-2 rounded-lg shadow-lg hover:bg-red-600 no-product-details"
                            >
                              <FaTrash size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="sm:hidden">
                      <div className="p-3">
                        <div className="flex">
                          <div className="w-28 flex-shrink-0 ml-3">
                            <div className="relative h-32 w-full overflow-hidden rounded-xl">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-bold text-sm text-gray-800 dark:text-gray-200 hover:text-[#2E3D88] line-clamp-1 mb-2"
                              dir={isArabic(product.name) ? "rtl" : "ltr"}
                            >
                              {product.name}
                            </h3>

                            <p
                              className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1 leading-relaxed"
                              dir={
                                isArabic(product.description) ? "rtl" : "ltr"
                              }
                            >
                              {product.description}
                            </p>

                            <div className="flex items-center gap-1 mb-3">
                              {formatPriceDisplayMobile(product)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 pb-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              if (isProductAvailableForCart(product)) {
                                handleAddToCart(product, e);
                              }
                            }}
                            disabled={
                              !isProductAvailableForCart(product) ||
                              addingToCart === product.id
                            }
                            className={`flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs no-product-details ${
                              addingToCart === product.id
                                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white cursor-wait"
                                : isProductAvailableForCart(product)
                                  ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white"
                                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
                            }`}
                          >
                            {addingToCart === product.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                <span>يتم الإضافة...</span>
                              </>
                            ) : (
                              <>
                                <FaShoppingCart className="w-3.5 h-3.5" />
                                <span>
                                  {!isProductAvailableForCart(product)
                                    ? "غير متوفر"
                                    : "أضف إلى السلة"}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductDetails(product);
                            }}
                            className="flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs no-product-details bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                          >
                            <FaEye className="w-3.5 h-3.5" />
                            <span>عرض التفاصيل</span>
                          </button>

                          <button
                            onClick={(e) => handleToggleFavorite(product, e)}
                            className={`p-2.5 rounded-xl font-semibold flex items-center justify-center text-xs no-product-details ${
                              isProductInFavorites(product.id)
                                ? "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                : "text-gray-400 bg-gray-50 dark:bg-gray-700 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                          >
                            {isProductInFavorites(product.id) ? (
                              <FaHeart size={16} />
                            ) : (
                              <FaRegHeart size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-3 sm:p-4">
                        <h3
                          className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2 hover:text-[#2E3D88] line-clamp-1"
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
                            {formatPriceDisplay(product)}
                          </div>
                          <button
                            onClick={(e) => handleToggleFavorite(product, e)}
                            className={`p-2 rounded-full no-product-details ${
                              isProductInFavorites(product.id)
                                ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                : "text-gray-400 bg-gray-50 dark:bg-gray-700 hover:text-red-500"
                            }`}
                          >
                            {isProductInFavorites(product.id) ? (
                              <FaHeart size={18} />
                            ) : (
                              <FaRegHeart size={18} />
                            )}
                          </button>
                        </div>

                        <div className="flex gap-2 mt-3 sm:mt-4">
                          <button
                            onClick={(e) => {
                              if (isProductAvailableForCart(product)) {
                                handleAddToCart(product, e);
                              }
                            }}
                            disabled={
                              !isProductAvailableForCart(product) ||
                              addingToCart === product.id
                            }
                            className={`flex-1 py-2 sm:py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm no-product-details ${
                              addingToCart === product.id
                                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white cursor-wait"
                                : isProductAvailableForCart(product)
                                  ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white"
                                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
                            }`}
                          >
                            {addingToCart === product.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                <span className="xs:hidden">
                                  يتم الإضافة...
                                </span>
                              </>
                            ) : (
                              <>
                                <FaShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="xs:hidden">
                                  {!isProductAvailableForCart(product)
                                    ? "غير متوفر"
                                    : "أضف إلى السلة"}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductDetails(product);
                            }}
                            className="flex-1 py-2 sm:py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm no-product-details bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                          >
                            <FaEye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="xs:hidden">عرض التفاصيل</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center">
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Button */}
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white rounded-full p-3 sm:p-4 shadow-2xl z-40 cursor-pointer hover:scale-110 no-product-details ${
            cartItemsCount === 0 ? "opacity-70" : ""
          }`}
          onClick={handleNavigateToCart}
        >
          <div className="relative">
            <FaShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#2E3D88] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold">
                {cartItemsCount}
              </span>
            )}
          </div>
        </div>

        {/* Floating Buttons - Always Visible Favorites Button */}
        <div className="fixed bottom-4 left-4 flex flex-col gap-3 z-40">
          {/* Favorites Button - Always Visible */}
          <button
            onClick={handleNavigateToFavorites}
            className="relative bg-gradient-to-r from-[#FF3366] to-[#FF6B9D] text-white rounded-full p-3 sm:p-4 shadow-2xl hover:scale-110 no-product-details"
          >
            <div className="relative flex items-center justify-center">
              <FaHeart className="w-4 h-4 sm:w-6 sm:h-6" />

              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#FF3366] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold shadow-md">
                  {favorites.length}
                </span>
              )}
            </div>

            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                منتجاتي المفضلة
                <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
          </button>

          {/* Admin Only Buttons - Only for Admin and Restaurant, NOT for Branch */}
          {canShowAdminButtons && (
            <>
              <button
                onClick={handleAddNewProduct}
                className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:scale-110 no-product-details"
              >
                <FaPlus className="w-4 h-4 sm:w-6 sm:h-6" />

                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    إضافة منتج جديد
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleOpenCategoriesManager}
                className="relative bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:scale-110 no-product-details"
              >
                <FaList className="w-4 h-4 sm:w-6 sm:h-6" />

                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    إدارة التصنيفات
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Categories Manager Modal */}
        {showCategoriesManager && canShowAdminButtons && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCloseCategoriesManager}
            />

            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
              onClick={handleCloseCategoriesManager}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl mx-auto my-auto max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                dir="rtl"
              >
                <div className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white p-4 sm:p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-white/20 p-2 sm:p-3 rounded-2xl backdrop-blur-sm">
                        <FaLayerGroup className="text-xl sm:text-2xl" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">
                          إدارة التصنيفات
                        </h2>
                        <p className="text-white/80 mt-1 text-sm sm:text-base">
                          إضافة، تعديل وحذف التصنيفات
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseCategoriesManager}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white hover:bg-white/30 no-product-details"
                    >
                      <FaTimes size={16} className="sm:w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="bg-[#2E3D88]/10 p-2 rounded-xl">
                        <FaPlus className="text-[#2E3D88] text-base sm:text-lg" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                        إضافة تصنيف جديد
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                          اسم التصنيف
                        </label>
                        <div className="relative">
                          <FaTag className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="text"
                            value={newCategory.name}
                            onChange={(e) =>
                              setNewCategory({
                                ...newCategory,
                                name: e.target.value,
                              })
                            }
                            placeholder="أدخل اسم التصنيف الجديد..."
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#2E3D88] focus:border-[#2E3D88] outline-none text-right text-base font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                          حالة التصنيف
                        </label>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={newCategory.isActive}
                                onChange={(e) =>
                                  setNewCategory({
                                    ...newCategory,
                                    isActive: e.target.checked,
                                  })
                                }
                                className="sr-only"
                              />
                              <div
                                className={`block w-14 sm:w-16 h-7 sm:h-8 rounded-full ${
                                  newCategory.isActive
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              ></div>
                              <div
                                className={`absolute right-1 top-1 bg-white w-5 sm:w-6 h-5 sm:h-6 rounded-full shadow-lg ${
                                  newCategory.isActive
                                    ? "transform translate-x-[-1.5rem] sm:translate-x-[-1.75rem]"
                                    : ""
                                }`}
                              ></div>
                            </div>
                          </label>
                          <span
                            className={`font-semibold text-base sm:text-lg ${
                              newCategory.isActive
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {newCategory.isActive ? "مفعل" : "معطل"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-start mt-4 sm:mt-6">
                      <button
                        onClick={handleAddCategory}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-lg flex items-center gap-2 sm:gap-3 text-sm sm:text-base no-product-details"
                      >
                        <FaPlus />
                        إضافة تصنيف جديد
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="bg-[#4A5DB0]/10 p-2 rounded-xl">
                        <FaList className="text-[#4A5DB0] text-base sm:text-lg" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                        التصنيفات الحالية ({categories.length - 2})
                      </h3>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className={`bg-white dark:bg-gray-700 border-2 ${
                            category.id === "all" || category.id === "offers"
                              ? "border-gray-300 dark:border-gray-600"
                              : "border-gray-200 dark:border-gray-600 hover:border-[#2E3D88]/30 dark:hover:border-[#2E3D88]/30"
                          } rounded-2xl p-4 sm:p-6 hover:shadow-lg`}
                        >
                          {editingCategory &&
                          editingCategory.id === category.id ? (
                            <div className="space-y-4 sm:space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="lg:col-span-2">
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                                    اسم التصنيف
                                  </label>
                                  <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) =>
                                      setEditingCategory({
                                        ...editingCategory,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#2E3D88] focus:border-[#2E3D88] outline-none text-right text-base font-medium"
                                    dir="rtl"
                                  />
                                </div>

                                <div className="flex flex-col justify-center">
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                                    حالة التصنيف
                                  </label>
                                  <div className="flex items-center gap-3 sm:gap-4">
                                    <label className="flex items-center cursor-pointer">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={editingCategory.isActive}
                                          onChange={(e) =>
                                            setEditingCategory({
                                              ...editingCategory,
                                              isActive: e.target.checked,
                                            })
                                          }
                                          className="sr-only"
                                        />
                                        <div
                                          className={`block w-14 sm:w-16 h-7 sm:h-8 rounded-full ${
                                            editingCategory.isActive
                                              ? "bg-green-500"
                                              : "bg-gray-400"
                                          }`}
                                        ></div>
                                        <div
                                          className={`absolute right-1 top-1 bg-white w-5 sm:w-6 h-5 sm:h-6 rounded-full shadow-lg ${
                                            editingCategory.isActive
                                              ? "transform translate-x-[-1.5rem] sm:translate-x-[-1.75rem]"
                                              : ""
                                          }`}
                                        ></div>
                                      </div>
                                    </label>
                                    <span
                                      className={`font-semibold text-base sm:text-lg ${
                                        editingCategory.isActive
                                          ? "text-green-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {editingCategory.isActive
                                        ? "مفعل"
                                        : "معطل"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 sm:gap-3 justify-start pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => setEditingCategory(null)}
                                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm sm:text-base no-product-details"
                                >
                                  إلغاء التعديل
                                </button>
                                <button
                                  onClick={handleSaveCategory}
                                  className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 text-sm sm:text-base no-product-details"
                                >
                                  <FaSave />
                                  حفظ التغييرات
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div
                                  className={`p-2 sm:p-3 rounded-xl ${
                                    category.id === "all"
                                      ? "bg-gray-100 dark:bg-gray-600"
                                      : category.id === "offers"
                                        ? "bg-orange-100 dark:bg-orange-900/30"
                                        : category.isActive
                                          ? "bg-green-100 dark:bg-green-900/30"
                                          : "bg-red-100 dark:bg-red-900/30"
                                  }`}
                                >
                                  {category.id === "offers" ? (
                                    <FaFire className="text-orange-600 text-base sm:text-lg" />
                                  ) : (
                                    <FaTag
                                      className={`text-base sm:text-lg ${
                                        category.id === "all"
                                          ? "text-gray-600 dark:text-gray-400"
                                          : category.isActive
                                            ? "text-green-600"
                                            : "text-red-600"
                                      }`}
                                    />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base sm:text-lg mb-1">
                                    {category.name}
                                  </h4>
                                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                    {category.id === "offers" ? (
                                      <span className="text-orange-600 font-medium">
                                        {
                                          products.filter(
                                            (p) =>
                                              p.itemOffer &&
                                              p.itemOffer.isEnabled,
                                          ).length
                                        }{" "}
                                        منتج
                                      </span>
                                    ) : (
                                      category.id !== "all" && (
                                        <>
                                          <span
                                            className={`px-2 py-1 rounded-full font-medium ${
                                              category.isActive
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            }`}
                                          >
                                            {category.isActive
                                              ? "مفعل"
                                              : "معطل"}
                                          </span>
                                          <span className="text-gray-500 dark:text-gray-400">
                                            {
                                              products.filter(
                                                (p) =>
                                                  p.categoryId ===
                                                  category.originalId,
                                              ).length
                                            }{" "}
                                            منتج
                                          </span>
                                        </>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-1 sm:gap-2 justify-end sm:justify-start">
                                {category.id !== "all" &&
                                  category.id !== "offers" && (
                                    <>
                                      <button
                                        onClick={(e) =>
                                          handleToggleCategoryActive(
                                            category.id,
                                            e,
                                          )
                                        }
                                        className={`p-2 sm:p-3 rounded-xl shadow-md no-product-details ${
                                          category.isActive
                                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                            : "bg-green-500 hover:bg-green-600 text-white"
                                        }`}
                                        title={
                                          category.isActive
                                            ? "تعطيل التصنيف"
                                            : "تفعيل التصنيف"
                                        }
                                      >
                                        {category.isActive ? (
                                          <FaTimesCircle
                                            size={16}
                                            className="sm:w-4 sm:h-4"
                                          />
                                        ) : (
                                          <FaCheckCircle
                                            size={16}
                                            className="sm:w-4 sm:h-4"
                                          />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleEditCategory(category)
                                        }
                                        className="bg-blue-500 text-white p-2 sm:p-3 rounded-xl hover:bg-blue-600 shadow-md no-product-details"
                                        title="تعديل التصنيف"
                                      >
                                        <FaEdit
                                          size={16}
                                          className="sm:w-4 sm:h-4"
                                        />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteCategory(category.id)
                                        }
                                        className="bg-red-500 text-white p-2 sm:p-3 rounded-xl hover:bg-red-600 shadow-md no-product-details"
                                        title="حذف التصنيف"
                                      >
                                        <FaTrash
                                          size={16}
                                          className="sm:w-4 sm:h-4"
                                        />
                                      </button>
                                    </>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
