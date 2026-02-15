import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUpload,
  FaClock,
  // FaCalendarAlt,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaFire,
  FaList,
  FaEdit,
  FaCog,
  FaTag,
  FaCheckSquare,
  FaSquare,
  FaCheckCircle,
  FaCheck,
  FaLink,
  FaDownload,
  FaImage,
  FaSlidersH,
  FaDollarSign,
  FaQuestionCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";
import { Helmet } from "react-helmet-async";

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.productId;
  const productId = location.state?.productId;

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  // const [openDropdown, setOpenDropdown] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showOptionTypesManager, setShowOptionTypesManager] = useState(false);
  const [optionTypes, setOptionTypes] = useState([]);
  const [editingOptionType, setEditingOptionType] = useState(null);
  const [newOptionType, setNewOptionType] = useState({
    name: "",
    canSelectMultipleOptions: false,
    isSelectionRequired: false,
  });

  const [formData, setFormData] = useState({
    Name: "",
    CategoryId: 1,
    BasePrice: "",
    IsPriceBasedOnRequest: false,
    Image: "",
    Description: "",
    IsActive: true,
    ShowInSlider: false,
    // availabilityType: "always",
    Calories: "",
    PreparationTimeStart: "",
    PreparationTimeEnd: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageInputMode, setImageInputMode] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  /*
  const [schedules, setSchedules] = useState([
    {
      id: Date.now(),
      Day: "",
      startTime: "09:00",
      endTime: "22:00",
      isActive: true,
    },
  ]);
  const [initialSchedules, setInitialSchedules] = useState([]);
  */

  const [menuItemOptions, setMenuItemOptions] = useState([]);
  const [optionTypesDropdownOpen, setOptionTypesDropdownOpen] = useState(null);

  /*
  const daysOfWeek = [
    { id: "السبت", name: "السبت" },
    { id: "الأحد", name: "الأحد" },
    { id: "الإثنين", name: "الاثنين" },
    { id: "الثلاثاء", name: "الثلاثاء" },
    { id: "الأربعاء", name: "الأربعاء" },
    { id: "الخميس", name: "الخميس" },
    { id: "الجمعة", name: "الجمعة" },
  ];
  */

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const translateErrorMessage = (errorData) => {
    if (!errorData) return "حدث خطأ غير معروف";

    if (errorData.errors && typeof errorData.errors === "object") {
      const errorMessages = [];

      Object.keys(errorData.errors).forEach((key) => {
        errorData.errors[key].forEach((msg) => {
          if (msg.includes("required")) {
            errorMessages.push(`${key} مطلوب`);
          } else if (msg.includes("greater than 0")) {
            errorMessages.push(`${key} يجب أن يكون أكبر من صفر`);
          } else if (msg.includes("invalid")) {
            errorMessages.push(`${key} غير صالح`);
          } else {
            errorMessages.push(msg);
          }
        });
      });

      if (errorMessages.length > 0) {
        return errorMessages.join("، ");
      }
    }

    if (typeof errorData.message === "string") {
      const msg = errorData.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials")) {
        return "بيانات غير صحيحة";
      }
      if (msg.includes("network") || msg.includes("internet")) {
        return "يرجى التحقق من اتصالك بالإنترنت";
      }
      if (msg.includes("timeout") || msg.includes("time out")) {
        return "انتهت المهلة، يرجى المحاولة مرة أخرى";
      }
      return errorData.message;
    }

    return "حدث خطأ غير متوقع";
  };

  const showErrorAlert = (title, message) => {
    const translatedMessage = translateErrorMessage(message);

    if (window.innerWidth < 768) {
      toast.error(translatedMessage || title, {
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
    } else {
      Swal.fire({
        title: title || "حدث خطأ",
        text: translatedMessage,
        icon: "error",
        confirmButtonText: "حاول مرة أخرى",
        timer: 2500,
        showConfirmButton: false,
        confirmButtonColor: "#2E3D88",
      });
    }
  };

  const showSuccessAlert = (title, message) => {
    if (window.innerWidth < 768) {
      toast.success(message || title, {
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
    } else {
      Swal.fire({
        title: title || "تم بنجاح",
        text: message,
        icon: "success",
        showConfirmButton: false,
        timer: 2500,
        confirmButtonColor: "#2E3D88",
      });
    }
  };

  const downloadImageFromUrl = async (url) => {
    if (!url || !isValidUrl(url)) {
      Swal.fire({
        icon: "error",
        title: "رابط غير صالح",
        text: "الرجاء إدخال رابط صحيح للصورة",
        confirmButtonColor: "#2E3D88",
      });
      return null;
    }

    setIsDownloadingImage(true);
    try {
      const response = await fetch(url, {
        mode: "cors",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`فشل في تحميل الصورة: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("الرابط لا يشير إلى صورة صالحة");
      }

      const blob = await response.blob();

      const maxSize = 5 * 1024 * 1024;
      if (blob.size > maxSize) {
        throw new Error(
          `حجم الصورة (${formatBytes(blob.size)}) يتجاوز الحد الأقصى (5MB)`,
        );
      }

      const mimeType = blob.type;
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/jfif",
        "image/heic",
        "image/heif",
        "image/webp",
      ];

      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        const fileType = mimeType.split("/")[1] || "غير معروف";
        throw new Error(
          `صيغة الملف (${fileType}) غير مدعومة. الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC, WebP`,
        );
      }

      const extension = getExtensionFromMimeType(mimeType);
      const filename = `image-${Date.now()}.${extension}`;

      const file = new File([blob], filename, { type: mimeType });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          Image: reader.result,
        });
      };
      reader.readAsDataURL(file);

      setImageFile(file);
      setHasImageChanged(true);
      setImageUrl("");

      showSuccessAlert(
        "تم تحميل الصورة!",
        `تم تحميل الصورة بنجاح (${formatBytes(file.size)})`,
      );

      return file;
    } catch (error) {
      console.error("Error downloading image:", error);
      showErrorAlert(
        "خطأ في تحميل الصورة",
        error.message || "فشل في تحميل الصورة من الرابط المقدم",
      );
      return null;
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const getExtensionFromMimeType = (mimeType) => {
    const mimeToExt = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/jfif": "jfif",
      "image/heic": "heic",
      "image/heif": "heif",
      "image/webp": "webp",
    };
    return mimeToExt[mimeType.toLowerCase()] || "jpg";
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    const fetchOptionTypes = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/MenuItemOptionTypes/GetAll",
        );
        setOptionTypes(response.data);
      } catch (error) {
        console.error("Error fetching option types:", error);
        showErrorAlert("خطأ", "فشل في تحميل أنواع الاضافات");
      }
    };

    fetchOptionTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMenuItemOption = () => {
    setMenuItemOptions([
      ...menuItemOptions,
      {
        id: Date.now(),
        typeId: "",
        options: [
          {
            id: Date.now() + 1,
            name: "",
            price: "",
            isAvailableNow: true,
            isActive: true,
          },
        ],
      },
    ]);
  };

  const removeMenuItemOption = (id) => {
    if (menuItemOptions.length > 0) {
      setMenuItemOptions(menuItemOptions.filter((option) => option.id !== id));
    }
  };

  const updateMenuItemOption = (id, field, value) => {
    setMenuItemOptions(
      menuItemOptions.map((optionType) =>
        optionType.id === id ? { ...optionType, [field]: value } : optionType,
      ),
    );
  };

  const addOptionToType = (typeId) => {
    setMenuItemOptions(
      menuItemOptions.map((optionType) =>
        optionType.id === typeId
          ? {
              ...optionType,
              options: [
                ...optionType.options,
                {
                  id: Date.now(),
                  name: "",
                  price: "",
                  isAvailableNow: true,
                  isActive: true,
                },
              ],
            }
          : optionType,
      ),
    );
  };

  const removeOptionFromType = (typeId, optionId) => {
    setMenuItemOptions(
      menuItemOptions.map((optionType) =>
        optionType.id === typeId
          ? {
              ...optionType,
              options: optionType.options.filter(
                (option) => option.id !== optionId,
              ),
            }
          : optionType,
      ),
    );
  };

  const updateOption = (typeId, optionId, field, value) => {
    setMenuItemOptions(
      menuItemOptions.map((optionType) =>
        optionType.id === typeId
          ? {
              ...optionType,
              options: optionType.options.map((option) =>
                option.id === optionId ? { ...option, [field]: value } : option,
              ),
            }
          : optionType,
      ),
    );
  };

  const handleOpenOptionTypesManager = () => {
    setShowOptionTypesManager(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseOptionTypesManager = () => {
    setShowOptionTypesManager(false);
    setEditingOptionType(null);
    setNewOptionType({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
    document.body.style.overflow = "auto";
  };

  const handleEditOptionType = (optionType) => {
    setEditingOptionType({ ...optionType });
    setNewOptionType({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
  };

  const handleSaveOptionType = async () => {
    if (!editingOptionType.name.trim()) {
      showErrorAlert("خطأ", "اسم نوع الإضافة مطلوب");
      return;
    }

    try {
      await axiosInstance.put(
        `/api/MenuItemOptionTypes/Update/${editingOptionType.id}`,
        {
          name: editingOptionType.name,
          canSelectMultipleOptions: editingOptionType.canSelectMultipleOptions,
          isSelectionRequired: editingOptionType.isSelectionRequired,
        },
      );

      setOptionTypes(
        optionTypes.map((type) =>
          type.id === editingOptionType.id ? { ...editingOptionType } : type,
        ),
      );

      setEditingOptionType(null);
      showSuccessAlert("تم التحديث!", "تم تحديث نوع الإضافة بنجاح");
    } catch (error) {
      console.error("Error updating option type:", error);
      showErrorAlert("خطأ", "فشل في تحديث نوع الإضافة");
    }
  };

  const handleAddOptionType = async () => {
    if (!newOptionType.name.trim()) {
      showErrorAlert("خطأ", "اسم نوع الإضافة مطلوب");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/api/MenuItemOptionTypes/Add",
        {
          name: newOptionType.name,
          canSelectMultipleOptions: newOptionType.canSelectMultipleOptions,
          isSelectionRequired: newOptionType.isSelectionRequired,
        },
      );

      const newOptionTypeData = response.data;

      setOptionTypes([...optionTypes, newOptionTypeData]);
      setNewOptionType({
        name: "",
        canSelectMultipleOptions: false,
        isSelectionRequired: false,
      });

      showSuccessAlert("تم الإضافة!", "تم إضافة نوع الإضافة الجديد بنجاح");
    } catch (error) {
      console.error("Error adding option type:", error);
      showErrorAlert("خطأ", "فشل في إضافة نوع الإضافة");
    }
  };

  const handleDeleteOptionType = async (optionTypeId) => {
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
            `/api/MenuItemOptionTypes/Delete/${optionTypeId}`,
          );

          setOptionTypes(
            optionTypes.filter((type) => type.id !== optionTypeId),
          );

          showSuccessAlert("تم الحذف!", "تم حذف نوع الإضافة بنجاح");
        } catch (error) {
          console.error("Error deleting option type:", error);
          showErrorAlert("خطأ", "فشل في حذف نوع الإضافة");
        }
      }
    });
  };

  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditing) return;

      try {
        setIsLoadingProduct(true);
        const response = await axiosInstance.get(
          `/api/MenuItems/Get/${productId}`,
        );
        const product = response.data;

        /*
        const hasSchedules =
          product.menuItemSchedules && product.menuItemSchedules.length > 0;
        const availabilityType = hasSchedules ? "custom" : "always";
        */

        const initialData = {
          Name: product.name || "",
          CategoryId: product.category?.id || 1,
          BasePrice: product.basePrice || "",
          IsPriceBasedOnRequest: product.basePrice === 0,
          Image: product.imageUrl
            ? `https://restaurant-template.runasp.net/${product.imageUrl}`
            : "",
          Description: product.description || "",
          IsActive: product.isActive !== undefined ? product.isActive : true,
          ShowInSlider:
            product.showInSlider !== undefined ? product.showInSlider : false,
          // availabilityType: availabilityType,
          Calories: product.calories || "",
          PreparationTimeStart: product.preparationTimeStart || "",
          PreparationTimeEnd: product.preparationTimeEnd || "",
        };

        setFormData(initialData);
        setInitialFormData(initialData);

        if (product.imageUrl) {
          const imageUrl = `https://restaurant-template.runasp.net/${product.imageUrl}`;
          setImagePreview(imageUrl);
          setImageInputMode("url");
          setImageUrl(imageUrl);
        }

        /*
        let initialSchedulesData = [];
        if (hasSchedules) {
          const transformedSchedules = product.menuItemSchedules.map(
            (schedule, index) => ({
              id: Date.now() + index,
              Day: schedule.day || "",
              startTime: schedule.startTime?.substring(0, 5) || "09:00",
              endTime: schedule.endTime?.substring(0, 5) || "22:00",
              isActive:
                schedule.isActive !== undefined ? schedule.isActive : true,
            })
          );
          setSchedules(transformedSchedules);
          initialSchedulesData = [...transformedSchedules];
        } else {
          initialSchedulesData = [...schedules];
        }
        setInitialSchedules(initialSchedulesData);
        */
      } catch (error) {
        console.error("Error fetching product data:", error);
        showErrorAlert("خطأ", "فشل في تحميل بيانات المنتج");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, productId]);

  useEffect(() => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    if (!initialFormData) return;

    const formDataChanged =
      formData.Name !== initialFormData.Name ||
      formData.CategoryId !== initialFormData.CategoryId ||
      formData.BasePrice !== initialFormData.BasePrice ||
      formData.IsPriceBasedOnRequest !==
        initialFormData.IsPriceBasedOnRequest ||
      formData.Description !== initialFormData.Description ||
      formData.IsActive !== initialFormData.IsActive ||
      formData.ShowInSlider !== initialFormData.ShowInSlider ||
      // formData.availabilityType !== initialFormData.availabilityType ||
      formData.Calories !== initialFormData.Calories ||
      formData.PreparationTimeStart !== initialFormData.PreparationTimeStart ||
      formData.PreparationTimeEnd !== initialFormData.PreparationTimeEnd ||
      hasImageChanged;

    /*
    const schedulesChanged =
      JSON.stringify(schedules) !== JSON.stringify(initialSchedules);
    */

    setHasChanges(formDataChanged /* || schedulesChanged */);
  }, [
    formData,
    // schedules,
    initialFormData,
    // initialSchedules,
    hasImageChanged,
    isEditing,
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/Categories/GetAll");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showErrorAlert("خطأ", "فشل في تحميل الفئات");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || parseFloat(value) >= 0) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePreparationTimeChange = (e) => {
    const { name, value } = e.target;

    if (value === "" || parseFloat(value) >= 0) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePriceTypeChange = (type) => {
    if (type === "fixed") {
      setFormData({
        ...formData,
        IsPriceBasedOnRequest: false,
        BasePrice: formData.BasePrice || "",
      });
    } else {
      setFormData({
        ...formData,
        IsPriceBasedOnRequest: true,
        BasePrice: "0",
      });
    }
  };

  /*
  const handleAvailabilityTypeChange = (type) => {
    setFormData({
      ...formData,
      availabilityType: type,
    });

    if (type === "always") {
      setSchedules([
        {
          id: Date.now(),
          Day: "",
          startTime: "09:00",
          endTime: "22:00",
          isActive: true,
        },
      ]);
    }
  };
  */

  /*
  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        id: Date.now(),
        Day: "",
        startTime: "09:00",
        endTime: "22:00",
        isActive: true,
      },
    ]);
  };

  const removeSchedule = (id) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((schedule) => schedule.id !== id));
    }
  };

  const updateSchedule = (id, field, value) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, [field]: value } : schedule
      )
    );
  };
  */

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showErrorAlert(
          "حجم الملف كبير",
          `حجم الصورة (${formatBytes(file.size)}) يتجاوز الحد الأقصى (5MB)`,
        );
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/jfif",
        "image/heic",
        "image/heif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type.toLowerCase())) {
        const fileType = file.type.split("/")[1] || "غير معروف";
        showErrorAlert(
          "نوع ملف غير مدعوم",
          `صيغة الملف (${fileType}) غير مدعومة. الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC, WebP`,
        );
        return;
      }

      setHasImageChanged(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          Image: reader.result,
        });
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleUploadAreaClick = () => {
    if (imageInputMode === "upload") {
      document.getElementById("file-input").click();
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview("");
    setFormData({ ...formData, Image: "" });
    setImageFile(null);
    setImageUrl("");
    setHasImageChanged(true);
  };

  const handleDownloadFromUrl = async () => {
    if (!imageUrl.trim()) {
      Swal.fire({
        icon: "error",
        title: "رابط فارغ",
        text: "الرجاء إدخال رابط الصورة أولاً",
        confirmButtonColor: "#2E3D88",
      });
      return;
    }

    await downloadImageFromUrl(imageUrl);
  };

  const isFormValid = () => {
    if (formData.IsPriceBasedOnRequest) {
      return (
        formData.Name &&
        formData.CategoryId &&
        formData.Description &&
        formData.Image
      );
    }

    return (
      formData.Name &&
      formData.CategoryId &&
      formData.BasePrice &&
      formData.Description &&
      formData.Image
    );
  };

  const hasRequiredOptionTypes = () => {
    const requiredOptionTypes = menuItemOptions.filter((optionType) => {
      const optionTypeData = optionTypes.find(
        (type) => type.id === optionType.typeId,
      );
      return optionTypeData?.isSelectionRequired === true;
    });

    return requiredOptionTypes.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.Name ||
      !formData.CategoryId ||
      !formData.Description ||
      (!isEditing && !formData.Image)
    ) {
      showErrorAlert("معلومات ناقصة", "يرجى ملء جميع الحقول المطلوبة");
      setIsLoading(false);
      return;
    }

    if (!formData.IsPriceBasedOnRequest && !formData.BasePrice) {
      showErrorAlert("معلومات ناقصة", "يرجى إدخال السعر أو اختيار 'حسب الطلب'");
      setIsLoading(false);
      return;
    }

    if (
      !formData.IsPriceBasedOnRequest &&
      parseFloat(formData.BasePrice) <= 0
    ) {
      showErrorAlert("خطأ في السعر", "السعر يجب أن يكون أكبر من صفر");
      setIsLoading(false);
      return;
    }

    if (
      formData.PreparationTimeStart &&
      formData.PreparationTimeEnd &&
      parseInt(formData.PreparationTimeStart) >=
        parseInt(formData.PreparationTimeEnd)
    ) {
      showErrorAlert(
        "وقت تحضير غير صحيح",
        "وقت البدء يجب أن يكون أقل من وقت الانتهاء في وقت التحضير",
      );
      setIsLoading(false);
      return;
    }

    /*
    if (formData.availabilityType === "custom") {
      const invalidSchedules = schedules.filter(
        (schedule) => !schedule.Day || !schedule.startTime || !schedule.endTime
      );

      if (invalidSchedules.length > 0) {
        showErrorAlert("معلومات ناقصة", "يرجى ملء جميع الحقول المطلوبة في الجداول الزمنية");
        setIsLoading(false);
        return;
      }

      const invalidTimeSchedules = schedules
        .map((schedule, index) => ({ ...schedule, index: index + 1 }))
        .filter((schedule) => schedule.startTime >= schedule.endTime);

      if (invalidTimeSchedules.length > 0) {
        const scheduleNumbers = invalidTimeSchedules
          .map((s) => s.index)
          .join("، ");
        showErrorAlert(
          "وقت غير صحيح",
          `وقت الانتهاء يجب أن يكون بعد وقت البدء في الجدول ${scheduleNumbers}`
        );
        setIsLoading(false);
        return;
      }
    }
    */

    if (!isEditing) {
      let invalidOptions = [];
      menuItemOptions.forEach((optionType, typeIndex) => {
        if (!optionType.typeId) {
          invalidOptions.push(`نوع الإضافة ${typeIndex + 1} يجب اختيار نوع`);
        }
        optionType.options.forEach((option, optionIndex) => {
          if (!option.name.trim()) {
            invalidOptions.push(
              `اسم الإضافة ${optionIndex + 1} في النوع ${typeIndex + 1} مطلوب`,
            );
          }
          if (!option.price || parseFloat(option.price) < 0) {
            invalidOptions.push(
              `سعر الإضافة ${optionIndex + 1} في النوع ${
                typeIndex + 1
              } يجب أن يكون رقمًا صحيحًا`,
            );
          }
        });
      });

      if (invalidOptions.length > 0) {
        showErrorAlert(
          "خطأ في الإضافات",
          invalidOptions.slice(0, 3).join("\n"),
        );
        setIsLoading(false);
        return;
      }

      if (formData.IsPriceBasedOnRequest && !hasRequiredOptionTypes()) {
        showErrorAlert(
          "خطأ في الإعدادات",
          "المنتج بسعر حسب الطلب يجب أن يحتوي على أنواع إضافات مطلوبة للاختيار",
        );
        setIsLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Name", formData.Name);
      formDataToSend.append("Description", formData.Description);

      // إرسال السعر بناءً على نوع السعر
      if (formData.IsPriceBasedOnRequest) {
        formDataToSend.append("BasePrice", "0");
      } else {
        formDataToSend.append(
          "BasePrice",
          parseFloat(formData.BasePrice).toString(),
        );
      }

      formDataToSend.append("CategoryId", formData.CategoryId.toString());
      formDataToSend.append("IsActive", formData.IsActive.toString());
      formDataToSend.append("ShowInSlider", formData.ShowInSlider.toString());

      if (formData.Calories) {
        formDataToSend.append("Calories", formData.Calories.toString());
      }

      if (formData.PreparationTimeStart) {
        formDataToSend.append(
          "PreparationTimeStart",
          formData.PreparationTimeStart.toString(),
        );
      }

      if (formData.PreparationTimeEnd) {
        formDataToSend.append(
          "PreparationTimeEnd",
          formData.PreparationTimeEnd.toString(),
        );
      }

      /*
      if (formData.availabilityType === "custom") {
        schedules.forEach((schedule, index) => {
          formDataToSend.append(
            `MenuItemSchedules[${index}].Day`,
            schedule.Day
          );
          formDataToSend.append(
            `MenuItemSchedules[${index}].startTime`,
            schedule.startTime
          );
          formDataToSend.append(
            `MenuItemSchedules[${index}].endTime`,
            schedule.endTime
          );
          formDataToSend.append(
            `MenuItemSchedules[${index}].isActive`,
            schedule.isActive.toString()
          );
        });
      }
      */

      if (!isEditing && menuItemOptions.length > 0) {
        let optionIndex = 0;
        menuItemOptions.forEach((optionType) => {
          optionType.options.forEach((option) => {
            const prefix = `MenuItemOptions[${optionIndex}]`;
            formDataToSend.append(`${prefix}.name`, option.name);
            formDataToSend.append(
              `${prefix}.price`,
              parseFloat(option.price).toString(),
            );
            formDataToSend.append(
              `${prefix}.isAvailableNow`,
              option.isAvailableNow.toString(),
            );
            formDataToSend.append(
              `${prefix}.isActive`,
              option.isActive.toString(),
            );
            formDataToSend.append(
              `${prefix}.typeId`,
              optionType.typeId.toString(),
            );
            optionIndex++;
          });
        });
      }

      if (isEditing) {
        if (imageFile) {
          formDataToSend.append("Image", imageFile);
        } else if (formData.Image && !hasImageChanged) {
          try {
            const response = await fetch(formData.Image);
            const blob = await response.blob();
            const filename =
              formData.Image.split("/").pop() || "product-image.jpg";
            formDataToSend.append("Image", blob, filename);
          } catch (error) {
            console.error("Error converting old image URL to file:", error);
            showErrorAlert(
              "خطأ في الصورة",
              "فشل في تحميل الصورة القديمة. يرجى إعادة رفع الصورة.",
            );
            setIsLoading(false);
            return;
          }
        } else if (!formData.Image) {
          formDataToSend.append("Image", "");
        }
      } else {
        if (imageFile) {
          formDataToSend.append("Image", imageFile);
        } else if (imageInputMode === "url" && !imageFile) {
          const file = await downloadImageFromUrl(imageUrl);
          if (file) {
            formDataToSend.append("Image", file);
          } else {
            showErrorAlert(
              "خطأ في الصورة",
              "يرجى تحميل الصورة من الرابط أولاً أو استخدام صورة أخرى",
            );
            setIsLoading(false);
            return;
          }
        }
      }

      const endpoint = isEditing
        ? `/api/MenuItems/Update/${productId}`
        : "/api/MenuItems/Add";

      const response = await axiosInstance({
        method: isEditing ? "PUT" : "POST",
        url: endpoint,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 204) {
        showSuccessAlert(
          isEditing ? "تم تحديث المنتج!" : "تم إضافة المنتج!",
          `${formData.Name} تم ${isEditing ? "تحديثه" : "إضافته"} بنجاح`,
        );
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showErrorAlert("خطأ", "فشل في حفظ المنتج. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#f0f3ff] to-[#d9e0f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
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
        className={`min-h-screen bg-gradient-to-br from-white via-[#f0f3ff] to-[#d9e0f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
        dir="rtl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-8 xs:-left-10 sm:-left-20 -top-8 xs:-top-10 sm:-top-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#2E3D88]/10 to-[#4A5DB0]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
          <div className="absolute -right-8 xs:-right-10 sm:-right-20 -bottom-8 xs:-bottom-10 sm:-bottom-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#4A5DB0]/10 to-[#2E3D88]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="max-w-6xl xl:max-w-5xl mx-auto bg-white/90 backdrop-blur-xl shadow-lg xs:shadow-xl sm:shadow-2xl rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/50 relative overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50"
        >
          <div className="relative h-28 xs:h-32 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-3 xs:-top-4 sm:-top-6 -right-3 xs:-right-4 sm:-right-6 w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-3 xs:-bottom-4 sm:-bottom-6 -left-3 xs:-left-4 sm:-left-6 w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="absolute top-2 xs:top-3 sm:top-6 left-2 xs:left-3 sm:left-6 z-50 bg-white/80 backdrop-blur-md hover:bg-[#2E3D88] hover:text-white rounded-full p-1.5 xs:p-2 sm:p-3 text-[#2E3D88] border border-[#2E3D88]/30 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#2E3D88]"
            >
              <FaArrowLeft
                size={12}
                className="xs:size-3 sm:size-4 group-hover:scale-110 transition-transform"
              />
            </motion.button>

            <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-3 xs:px-4 sm:px-6 pb-4 xs:pb-5 sm:pb-8 md:pb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-1.5 xs:mb-2 sm:mb-3"
              >
                <div className="p-1.5 xs:p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl">
                  <FaClock className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                  {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-2xl mb-1.5 xs:mb-2 sm:mb-3"
              >
                {isEditing
                  ? "قم بتحديث معلومات المنتج"
                  : "قم بإنشاء عنصر قائمة جديد"}
              </motion.p>
            </div>
          </div>

          <div className="relative px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 pb-3 xs:pb-4 sm:pb-6 md:pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 xs:mt-5 sm:mt-6 md:mt-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600/50">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 xs:space-y-5 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                      <div>
                        <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                          اسم المنتج *
                        </label>
                        <input
                          type="text"
                          name="Name"
                          value={formData.Name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="اسم المنتج"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                          الفئة *
                        </label>
                        {isLoadingCategories ? (
                          <div className="text-center py-4 text-gray-500">
                            جاري تحميل الفئات...
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3">
                            {categories
                              .filter((category) => category.isActive)
                              .map((category) => (
                                <motion.button
                                  key={category.id}
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      CategoryId: category.id,
                                    })
                                  }
                                  className={`flex flex-col items-center gap-1 xs:gap-1.5 sm:gap-2 p-1.5 xs:p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                                    formData.CategoryId === category.id
                                      ? "border-[#2E3D88] bg-gradient-to-r from-[#f0f3ff] to-[#d9e0f5] text-[#2E3D88] dark:from-gray-600 dark:to-gray-500"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                                  }`}
                                >
                                  <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-center leading-tight">
                                    {category.name}
                                  </span>
                                </motion.button>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                            نوع السعر *
                          </label>
                          <div className="grid grid-cols-2 gap-2 xs:gap-3 mb-3">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handlePriceTypeChange("fixed")}
                              className={`flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-3 rounded-lg border-2 transition-all duration-200 ${
                                !formData.IsPriceBasedOnRequest
                                  ? "border-[#2E3D88] bg-white text-[#2E3D88] shadow-md dark:bg-gray-600"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                              }`}
                            >
                              <FaDollarSign className="text-xs xs:text-sm" />
                              <span className="text-xs xs:text-sm font-medium">
                                سعر ثابت
                              </span>
                            </motion.button>

                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handlePriceTypeChange("request")}
                              className={`flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-3 rounded-lg border-2 transition-all duration-200 ${
                                formData.IsPriceBasedOnRequest
                                  ? "border-[#2E3D88] bg-white text-[#2E3D88] shadow-md dark:bg-gray-600"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                              }`}
                            >
                              <FaQuestionCircle className="text-xs xs:text-sm" />
                              <span className="text-xs xs:text-sm font-medium">
                                حسب الطلب
                              </span>
                            </motion.button>
                          </div>
                        </div>

                        {!formData.IsPriceBasedOnRequest && (
                          <div>
                            <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                              السعر (جنيه) *
                            </label>
                            <input
                              type="number"
                              name="BasePrice"
                              value={formData.BasePrice}
                              onChange={handleNumberInputChange}
                              step="0.01"
                              min="0.01"
                              onWheel={(e) => e.target.blur()}
                              className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              placeholder="0.00"
                              required={!formData.IsPriceBasedOnRequest}
                            />
                            {formData.IsPriceBasedOnRequest &&
                              !isEditing &&
                              hasRequiredOptionTypes() && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-xs text-yellow-700">
                                    <span className="font-semibold">
                                      ملاحظة:
                                    </span>{" "}
                                    المنتج بسعر حسب الطلب يجب أن يحتوي على أنواع
                                    إضافات مطلوبة للاختيار
                                  </p>
                                </div>
                              )}
                          </div>
                        )}

                        {formData.IsPriceBasedOnRequest && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <FaQuestionCircle className="text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-xs text-blue-700 font-semibold">
                                  السعر حسب الطلب
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  سيتم تحديد السعر بناءً على اختيارات العميل من
                                  الإضافات.
                                  {!isEditing &&
                                    " يجب أن يحتوي المنتج على أنواع إضافات مطلوبة للاختيار."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                          السعرات الحرارية
                        </label>
                        <div className="relative group">
                          <FaFire className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="number"
                            name="Calories"
                            value={formData.Calories}
                            onChange={handleNumberInputChange}
                            min="0"
                            onWheel={(e) => e.target.blur()}
                            className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white pr-10"
                            placeholder="عدد السعرات الحرارية"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                          وقت التحضير (بالدقائق)
                        </label>
                        <div className="grid grid-cols-2 gap-2 xs:gap-3">
                          <div className="relative group">
                            <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88] text-xs transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="number"
                              name="PreparationTimeStart"
                              value={formData.PreparationTimeStart}
                              onChange={handlePreparationTimeChange}
                              min="0"
                              onWheel={(e) => e.target.blur()}
                              className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white pr-8"
                              placeholder="من"
                            />
                          </div>
                          <div className="relative group">
                            <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88] text-xs transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="number"
                              name="PreparationTimeEnd"
                              value={formData.PreparationTimeEnd}
                              onChange={handlePreparationTimeChange}
                              min="0"
                              onWheel={(e) => e.target.blur()}
                              className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white pr-8"
                              placeholder="إلى"
                            />
                          </div>
                        </div>
                        {formData.PreparationTimeStart &&
                          formData.PreparationTimeEnd &&
                          parseInt(formData.PreparationTimeStart) >=
                            parseInt(formData.PreparationTimeEnd) && (
                            <p className="text-red-500 text-xs mt-1">
                              وقت البدء يجب أن يكون أقل من وقت الانتهاء في وقت
                              التحضير
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                          الحالة *
                        </label>
                        <div className="flex gap-3 bg-gray-50/80 dark:bg-gray-600/80 rounded-lg p-2 xs:p-3 border border-gray-200 dark:border-gray-500">
                          <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 xs:p-3 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#2E3D88]/30">
                            <div className="relative">
                              <input
                                type="radio"
                                name="IsActive"
                                checked={formData.IsActive === true}
                                onChange={() =>
                                  setFormData({ ...formData, IsActive: true })
                                }
                                className="sr-only"
                                required
                              />
                              <div
                                className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  formData.IsActive === true
                                    ? "border-[#2E3D88] bg-[#2E3D88]"
                                    : "border-gray-400 bg-white dark:bg-gray-500"
                                }`}
                              >
                                {formData.IsActive === true && (
                                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                              نشط
                            </span>
                          </label>
                          <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 xs:p-3 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#2E3D88]/30">
                            <div className="relative">
                              <input
                                type="radio"
                                name="IsActive"
                                checked={formData.IsActive === false}
                                onChange={() =>
                                  setFormData({ ...formData, IsActive: false })
                                }
                                className="sr-only"
                                required
                              />
                              <div
                                className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  formData.IsActive === false
                                    ? "border-[#2E3D88] bg-[#2E3D88]"
                                    : "border-gray-400 bg-white dark:bg-gray-500"
                                }`}
                              >
                                {formData.IsActive === false && (
                                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                              غير نشط
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* حقل ShowInSlider الجديد */}
                      <div>
                        <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                          عرض في السلايدر
                        </label>
                        <div className="flex gap-3 bg-gray-50/80 dark:bg-gray-600/80 rounded-lg p-2 xs:p-3 border border-gray-200 dark:border-gray-500">
                          <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 xs:p-3 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#2E3D88]/30">
                            <div className="relative">
                              <input
                                type="radio"
                                name="ShowInSlider"
                                checked={formData.ShowInSlider === true}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    ShowInSlider: true,
                                  })
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  formData.ShowInSlider === true
                                    ? "border-[#2E3D88] bg-[#2E3D88]"
                                    : "border-gray-400 bg-white dark:bg-gray-500"
                                }`}
                              >
                                {formData.ShowInSlider === true && (
                                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaSlidersH className="text-[#2E3D88] text-xs xs:text-sm" />
                              <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                                عرض
                              </span>
                            </div>
                          </label>
                          <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 xs:p-3 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#2E3D88]/30">
                            <div className="relative">
                              <input
                                type="radio"
                                name="ShowInSlider"
                                checked={formData.ShowInSlider === false}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    ShowInSlider: false,
                                  })
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  formData.ShowInSlider === false
                                    ? "border-[#2E3D88] bg-[#2E3D88]"
                                    : "border-gray-400 bg-white dark:bg-gray-500"
                                }`}
                              >
                                {formData.ShowInSlider === false && (
                                  <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaTimes className="text-gray-500 text-xs xs:text-sm" />
                              <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                                إخفاء
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                      <div>
                        <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                          صورة المنتج *
                        </label>

                        {/* Switch between upload modes */}
                        <div className="flex gap-2 mb-3 xs:mb-4">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setImageInputMode("upload")}
                            className={`flex-1 flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-2.5 rounded-lg border-2 transition-all duration-200 ${
                              imageInputMode === "upload"
                                ? "border-[#2E3D88] bg-white text-[#2E3D88] shadow-md dark:bg-gray-600"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                            }`}
                          >
                            <FaUpload className="text-xs xs:text-sm" />
                            <span className="text-xs xs:text-sm font-medium">
                              رفع صورة
                            </span>
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setImageInputMode("url")}
                            className={`flex-1 flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-2.5 rounded-lg border-2 transition-all duration-200 ${
                              imageInputMode === "url"
                                ? "border-[#2E3D88] bg-white text-[#2E3D88] shadow-md dark:bg-gray-600"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                            }`}
                          >
                            <FaLink className="text-xs xs:text-sm" />
                            <span className="text-xs xs:text-sm font-medium">
                              رابط صورة
                            </span>
                          </motion.button>
                        </div>

                        {imageInputMode === "upload" ? (
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-2 xs:p-3 sm:p-4 text-center hover:border-[#2E3D88] transition-colors duration-200 cursor-pointer dark:border-gray-600"
                            onClick={handleUploadAreaClick}
                          >
                            {imagePreview ? (
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  loading="lazy"
                                  alt="Preview"
                                  className="w-full h-48 xs:h-56 sm:h-64 md:h-96 object-contain rounded-lg mb-2 xs:mb-3"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-1 xs:top-2 left-1 xs:left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <FaTimes size={10} className="xs:size-2" />
                                </button>
                              </div>
                            ) : (
                              <div className="py-8 xs:py-10 sm:py-12 md:py-16">
                                <FaUpload className="mx-auto text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-2 xs:mb-3 sm:mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-1.5 xs:mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base">
                                  انقر لرفع الصورة
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-[10px] xs:text-xs sm:text-sm">
                                  الصيغ المدعومة: JPG, JPEG, PNG, JFIF,
                                  HEIF/HEIC, WebP (الحد الأقصى 5MB)
                                </p>
                              </div>
                            )}
                            <input
                              id="file-input"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/jfif,image/heic,image/heif,image/webp"
                              onChange={handleImageChange}
                              className="hidden"
                              required={
                                !isEditing && imageInputMode === "upload"
                              }
                            />
                          </div>
                        ) : (
                          <div className="space-y-3 xs:space-y-4">
                            <div className="border-2 border-gray-300 rounded-lg p-2 xs:p-3 sm:p-4 dark:border-gray-600">
                              <div className="mb-3 xs:mb-4">
                                <label className="block text-xs xs:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                                  رابط الصورة
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) =>
                                      setImageUrl(e.target.value)
                                    }
                                    placeholder="أدخل رابط الصورة"
                                    className="flex-1 border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                  />
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDownloadFromUrl}
                                    disabled={
                                      isDownloadingImage || !imageUrl.trim()
                                    }
                                    className={`px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm ${
                                      imageUrl.trim() && !isDownloadingImage
                                        ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-xl hover:shadow-[#2E3D88]/25 cursor-pointer"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                                    }`}
                                  >
                                    {isDownloadingImage ? (
                                      <>
                                        <div className="animate-spin h-3 w-3 xs:h-4 xs:w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                                        <span>جاري التحميل...</span>
                                      </>
                                    ) : (
                                      <>
                                        <FaDownload className="xs:size-3" />
                                        <span>تحميل</span>
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-[10px] xs:text-xs mt-2">
                                  الصيغ المدعومة: JPG, JPEG, PNG, JFIF,
                                  HEIF/HEIC, WebP (الحد الأقصى 5MB)
                                </p>
                              </div>

                              {imagePreview ? (
                                <div className="relative">
                                  <img
                                    src={imagePreview}
                                    loading="lazy"
                                    alt="Preview"
                                    className="w-full h-48 xs:h-56 sm:h-64 object-contain rounded-lg mb-2 xs:mb-3"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-1 xs:top-2 left-1 xs:left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                  >
                                    <FaTimes size={10} className="xs:size-2" />
                                  </button>
                                </div>
                              ) : (
                                <div className="py-6 xs:py-8 sm:py-10 text-center">
                                  <FaImage className="mx-auto text-3xl xs:text-4xl sm:text-5xl text-gray-400 dark:text-gray-500 mb-2 xs:mb-3 sm:mb-4" />
                                  <p className="text-gray-600 dark:text-gray-400 mb-1.5 xs:mb-2 sm:mb-3 text-xs xs:text-sm">
                                    سيظهر معاينة الصورة هنا بعد التحميل
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                          الوصف *
                        </label>
                        <textarea
                          name="Description"
                          value={formData.Description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 resize-none text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          placeholder="قم بوصف المنتج بالتفصيل..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {!isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 border border-purple-200/50 dark:from-gray-700 dark:to-gray-800 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                        <FaList className="text-purple-600 text-base xs:text-lg sm:text-xl dark:text-purple-400" />
                        <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                          الإضافات (خيارات المنتج)
                        </h3>
                        {formData.IsPriceBasedOnRequest && (
                          <div className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            يجب إضافة أنواع إضافات مطلوبة
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 xs:space-y-5">
                        {menuItemOptions.map((optionType, typeIndex) => {
                          const optionTypeData = optionTypes.find(
                            (type) => type.id === optionType.typeId,
                          );
                          const isRequired =
                            optionTypeData?.isSelectionRequired;

                          return (
                            <div
                              key={optionType.id}
                              className={`bg-white/80 rounded-lg p-3 xs:p-4 border ${
                                isRequired && formData.IsPriceBasedOnRequest
                                  ? "border-yellow-300 border-2"
                                  : "border-gray-200"
                              } dark:bg-gray-600/80 dark:border-gray-500`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs xs:text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    نوع الإضافة {typeIndex + 1}
                                  </h4>
                                  {isRequired && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                      مطلوب
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMenuItemOption(optionType.id)
                                  }
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>

                              <div className="mb-3 xs:mb-4">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  نوع الإضافة *
                                </label>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOptionTypesDropdownOpen(
                                        optionTypesDropdownOpen ===
                                          optionType.id
                                          ? null
                                          : optionType.id,
                                      )
                                    }
                                    className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-[#2E3D88] transition-all duration-200 text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                  >
                                    <span>
                                      {optionType.typeId
                                        ? optionTypes.find(
                                            (type) =>
                                              type.id === optionType.typeId,
                                          )?.name || "اختر النوع"
                                        : "اختر النوع"}
                                    </span>
                                    <motion.div
                                      animate={{
                                        rotate:
                                          optionTypesDropdownOpen ===
                                          optionType.id
                                            ? 180
                                            : 0,
                                      }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <FaChevronDown
                                        size={12}
                                        className="text-[#2E3D88] dark:text-[#2E3D88]"
                                      />
                                    </motion.div>
                                  </button>

                                  {optionTypesDropdownOpen ===
                                    optionType.id && (
                                    <motion.ul
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      transition={{ duration: 0.2 }}
                                      className="absolute z-50 mt-1 w-full bg-white border border-gray-200 shadow-2xl rounded-lg overflow-hidden max-h-48 overflow-y-auto dark:bg-gray-600 dark:border-gray-500"
                                    >
                                      {optionTypes.map((type) => (
                                        <li
                                          key={type.id}
                                          onClick={() => {
                                            updateMenuItemOption(
                                              optionType.id,
                                              "typeId",
                                              type.id,
                                            );
                                            setOptionTypesDropdownOpen(null);
                                          }}
                                          className="px-3 py-2 hover:bg-gradient-to-r hover:from-[#f0f3ff] hover:to-[#d9e0f5] cursor-pointer text-gray-700 transition-all text-xs border-b border-gray-100 last:border-b-0 dark:hover:from-gray-500 dark:hover:to-gray-400 dark:text-gray-300 dark:border-gray-500"
                                        >
                                          <div className="flex flex-col">
                                            <span>{type.name}</span>
                                            <div className="flex gap-2 mt-1">
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {type.canSelectMultipleOptions
                                                  ? "✓ متعدد"
                                                  : "✗ فردي"}
                                              </span>
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {type.isSelectionRequired
                                                  ? "✓ مطلوب"
                                                  : "✗ اختياري"}
                                              </span>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </motion.ul>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3 xs:space-y-4">
                                {optionType.options.map(
                                  (option, optionIndex) => (
                                    <div
                                      key={option.id}
                                      className="grid grid-cols-1 md:grid-cols-3 gap-2 xs:gap-3 p-3 bg-gray-50/50 rounded-lg dark:bg-gray-700/50"
                                    >
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                          اسم الإضافة *
                                        </label>
                                        <input
                                          type="text"
                                          value={option.name}
                                          onChange={(e) =>
                                            updateOption(
                                              optionType.id,
                                              option.id,
                                              "name",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                          placeholder="اسم الإضافة"
                                          required
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                          السعر (جنيه) *
                                        </label>
                                        <input
                                          type="number"
                                          value={option.price}
                                          onChange={(e) =>
                                            updateOption(
                                              optionType.id,
                                              option.id,
                                              "price",
                                              e.target.value,
                                            )
                                          }
                                          step="0.01"
                                          min="0"
                                          className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                          placeholder="0.00"
                                          required
                                        />
                                      </div>

                                      <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={option.isAvailableNow}
                                                onChange={(e) =>
                                                  updateOption(
                                                    optionType.id,
                                                    option.id,
                                                    "isAvailableNow",
                                                    e.target.checked,
                                                  )
                                                }
                                                className="text-[#2E3D88] focus:ring-[#2E3D88]"
                                              />
                                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                                متاح الآن
                                              </span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={option.isActive}
                                                onChange={(e) =>
                                                  updateOption(
                                                    optionType.id,
                                                    option.id,
                                                    "isActive",
                                                    e.target.checked,
                                                  )
                                                }
                                                className="text-[#2E3D88] focus:ring-[#2E3D88]"
                                              />
                                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                                نشط
                                              </span>
                                            </label>
                                          </div>
                                        </div>
                                        {optionType.options.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeOptionFromType(
                                                optionType.id,
                                                option.id,
                                              )
                                            }
                                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                                          >
                                            <FaTrash size={12} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>

                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addOptionToType(optionType.id)}
                                className="mt-3 w-full py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg font-semibold hover:border-[#2E3D88] hover:text-[#2E3D88] transition-all duration-300 text-xs flex items-center justify-center gap-2 dark:border-gray-500 dark:text-gray-400 dark:hover:border-[#2E3D88] dark:hover:text-[#2E3D88]"
                              >
                                <FaPlus size={10} />
                                إضافة خيار جديد لهذا النوع
                              </motion.button>
                            </div>
                          );
                        })}
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addMenuItemOption}
                        className="mt-4 w-full py-2 xs:py-2.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg font-semibold hover:border-[#2E3D88] hover:text-[#2E3D88] transition-all duration-300 text-xs xs:text-sm flex items-center justify-center gap-2 dark:border-gray-500 dark:text-gray-400 dark:hover:border-[#2E3D88] dark:hover:text-[#2E3D88]"
                      >
                        <FaPlus size={12} />
                        إضافة نوع إضافة جديد
                      </motion.button>

                      {formData.IsPriceBasedOnRequest &&
                        !hasRequiredOptionTypes() && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-700">
                              <span className="font-semibold">تنبيه:</span>{" "}
                              المنتج بسعر حسب الطلب يجب أن يحتوي على أنواع
                              إضافات مطلوبة للاختيار.
                            </p>
                          </div>
                        )}
                    </motion.div>
                  )}

                  {/*
                <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 border border-[#FDB913]/30 dark:from-gray-600 dark:to-gray-500 dark:border-gray-500">
                  <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                    <FaClock className="text-[#E41E26] text-base xs:text-lg sm:text-xl" />
                    <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                      وقت التوفر *
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 xs:gap-3 mb-4 xs:mb-5">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAvailabilityTypeChange("always")}
                      className={`flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.availabilityType === "always"
                          ? "border-[#E41E26] bg-white text-[#E41E26] shadow-md dark:bg-gray-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                      }`}
                    >
                      <FaClock className="text-xs xs:text-sm" />
                      <span className="text-xs xs:text-sm font-medium">
                        متاح دائمًا
                      </span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAvailabilityTypeChange("custom")}
                      className={`flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.availabilityType === "custom"
                          ? "border-[#E41E26] bg-white text-[#E41E26] shadow-md dark:bg-gray-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                      }`}
                    >
                      <FaCalendarAlt className="text-xs xs:text-sm" />
                      <span className="text-xs xs:text-sm font-medium">
                        جدول مخصص
                      </span>
                    </motion.button>
                  </div>

                  {formData.availabilityType === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 xs:space-y-5"
                    >
                      <div className="space-y-3 xs:space-y-4">
                        {schedules.map((schedule, index) => (
                          <div
                            key={schedule.id}
                            className="bg-white/80 rounded-lg p-3 xs:p-4 border border-gray-200 dark:bg-gray-600/80 dark:border-gray-500"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs xs:text-sm font-semibold text-gray-700 dark:text-gray-300">
                                الجدول {index + 1} *
                              </h4>
                              {schedules.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSchedule(schedule.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <FaTrash size={14} />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xs:gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  اليوم *
                                </label>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenDropdown(
                                        openDropdown === schedule.id
                                          ? null
                                          : schedule.id
                                      )
                                    }
                                    className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-[#E41E26] transition-all duration-200 text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                    required
                                  >
                                    <span>{schedule.Day || "اختر اليوم"}</span>
                                    <motion.div
                                      animate={{
                                        rotate:
                                          openDropdown === schedule.id
                                            ? 180
                                            : 0,
                                      }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <FaChevronDown
                                        size={12}
                                        className="text-[#E41E26]"
                                      />
                                    </motion.div>
                                  </button>

                                  {openDropdown === schedule.id && (
                                    <motion.ul
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      transition={{ duration: 0.2 }}
                                      className="absolute z-50 mt-1 w-full bg-white border border-gray-200 shadow-2xl rounded-lg overflow-hidden max-h-48 overflow-y-auto dark:bg-gray-600 dark:border-gray-500"
                                    >
                                      {daysOfWeek.map((day) => (
                                        <li
                                          key={day.id}
                                          onClick={() => {
                                            updateSchedule(
                                              schedule.id,
                                              "Day",
                                              day.name
                                            );
                                            setOpenDropdown(null);
                                          }}
                                          className="px-3 py-2 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-xs border-b border-gray-100 last:border-b-0 dark:hover:from-gray-500 dark:hover:to-gray-400 dark:text-gray-300 dark:border-gray-500"
                                        >
                                          {day.name}
                                        </li>
                                      ))}
                                    </motion.ul>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  وقت البدء *
                                </label>
                                <input
                                  type="time"
                                  value={schedule.startTime}
                                  onChange={(e) =>
                                    updateSchedule(
                                      schedule.id,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  وقت الانتهاء *
                                </label>
                                <input
                                  type="time"
                                  value={schedule.endTime}
                                  onChange={(e) =>
                                    updateSchedule(
                                      schedule.id,
                                      "endTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                  required
                                />
                              </div>
                            </div>

                            <div className="mt-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={schedule.isActive}
                                  onChange={(e) =>
                                    updateSchedule(
                                      schedule.id,
                                      "isActive",
                                      e.target.checked
                                    )
                                  }
                                  className="text-[#E41E26] focus:ring-[#E41E26]"
                                />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  نشط
                                </span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addSchedule}
                        className="w-full py-2 xs:py-2.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg font-semibold hover:border-[#E41E26] hover:text-[#E41E26] transition-all duration-300 text-xs xs:text-sm flex items-center justify-center gap-2 dark:border-gray-500 dark:text-gray-400 dark:hover:border-[#E41E26] dark:hover:text-[#E41E26]"
                      >
                        <FaPlus size={12} />
                        إضافة جدول زمني جديد
                      </motion.button>
                    </motion.div>
                  )}
                </div>
                */}

                  <div className="flex gap-2 xs:gap-3 sm:gap-4 pt-3 xs:pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/")}
                      className="flex-1 py-2 xs:py-2.5 sm:py-3 border-2 border-[#2E3D88] text-[#2E3D88] rounded-lg font-semibold hover:bg-[#2E3D88] hover:text-white transition-all duration-300 text-xs xs:text-sm sm:text-base flex items-center justify-center gap-1.5 xs:gap-2 dark:border-[#2E3D88] dark:text-[#2E3D88] dark:hover:bg-[#2E3D88] dark:hover:text-white"
                    >
                      <FaTimes size={12} className="xs:size-3 sm:size-4" />
                      إلغاء
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={
                        !isFormValid() ||
                        isLoading ||
                        (isEditing && !hasChanges) ||
                        (!isEditing &&
                          formData.IsPriceBasedOnRequest &&
                          !hasRequiredOptionTypes())
                      }
                      className={`flex-1 py-2 xs:py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base ${
                        isFormValid() &&
                        !isLoading &&
                        (!isEditing || hasChanges) &&
                        (!formData.IsPriceBasedOnRequest ||
                          hasRequiredOptionTypes() ||
                          isEditing)
                          ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-xl hover:shadow-[#2E3D88]/25 cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <FaSave size={12} className="xs:size-3 sm:size-4" />
                      {isLoading
                        ? "جاري الحفظ..."
                        : isEditing
                          ? "تحديث المنتج"
                          : "حفظ المنتج"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpenOptionTypesManager}
          className="fixed bottom-4 left-4 z-40 bg-[#2E3D88] text-white rounded-full p-3 sm:p-4 shadow-2xl hover:bg-[#4A5DB0] transition-colors duration-200"
        >
          <FaCog className="w-4 h-4 sm:w-6 sm:h-6" />
        </motion.button>

        <AnimatePresence>
          {showOptionTypesManager && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={handleCloseOptionTypesManager}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
                onClick={handleCloseOptionTypesManager}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl mx-auto my-auto max-h-[90vh] overflow-y-auto transition-colors duration-300"
                  onClick={(e) => e.stopPropagation()}
                  dir="rtl"
                >
                  <div className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white p-4 sm:p-6 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-2 sm:p-3 rounded-2xl backdrop-blur-sm">
                          <FaCog className="text-xl sm:text-2xl" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold">
                            إدارة أنواع الإضافات
                          </h2>
                          <p className="text-white/80 mt-1 text-sm sm:text-base">
                            إضافة، تعديل وحذف أنواع الإضافات
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCloseOptionTypesManager}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
                      >
                        <FaTimes size={16} className="sm:w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 transition-colors duration-300 shadow-lg">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="bg-[#2E3D88]/10 p-2 rounded-xl">
                          <FaPlus className="text-[#2E3D88] text-base sm:text-lg" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                          إضافة نوع إضافة جديد
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                            اسم نوع الإضافة
                          </label>
                          <div className="relative">
                            <FaTag className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                            <input
                              type="text"
                              value={newOptionType.name}
                              onChange={(e) =>
                                setNewOptionType({
                                  ...newOptionType,
                                  name: e.target.value,
                                })
                              }
                              placeholder="أدخل اسم نوع الإضافة الجديد..."
                              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#2E3D88] focus:border-[#2E3D88] outline-none transition-all text-right text-base sm:text-lg font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={
                                    newOptionType.canSelectMultipleOptions
                                  }
                                  onChange={(e) =>
                                    setNewOptionType({
                                      ...newOptionType,
                                      canSelectMultipleOptions:
                                        e.target.checked,
                                    })
                                  }
                                  className="sr-only"
                                />
                                <div
                                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                    newOptionType.canSelectMultipleOptions
                                      ? "bg-green-500 border-green-500"
                                      : "bg-white border-gray-300 dark:bg-gray-600 dark:border-gray-500"
                                  }`}
                                >
                                  {newOptionType.canSelectMultipleOptions && (
                                    <FaCheck className="text-white text-sm" />
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                                  اختيار متعدد
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  يسمح باختيار أكثر من خيار
                                </span>
                              </div>
                            </label>
                          </div>

                          <div>
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={newOptionType.isSelectionRequired}
                                  onChange={(e) =>
                                    setNewOptionType({
                                      ...newOptionType,
                                      isSelectionRequired: e.target.checked,
                                    })
                                  }
                                  className="sr-only"
                                />
                                <div
                                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                    newOptionType.isSelectionRequired
                                      ? "bg-red-500 border-red-500"
                                      : "bg-white border-gray-300 dark:bg-gray-600 dark:border-gray-500"
                                  }`}
                                >
                                  {newOptionType.isSelectionRequired && (
                                    <FaCheck className="text-white text-sm" />
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                                  اختيار مطلوب
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  يجب على العميل اختيار خيار واحد على الأقل
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-start mt-4 sm:mt-6">
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleAddOptionType}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2 sm:gap-3 text-sm sm:text-base shadow-lg"
                        >
                          <FaPlus />
                          إضافة نوع إضافة جديد
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="bg-[#4A5DB0]/10 p-2 rounded-xl">
                          <FaList className="text-[#4A5DB0] text-base sm:text-lg" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                          أنواع الإضافات الحالية ({optionTypes.length})
                        </h3>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        {optionTypes.map((optionType) => (
                          <motion.div
                            key={optionType.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-[#2E3D88]/30 dark:hover:border-[#2E3D88]/30 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg group"
                          >
                            {editingOptionType &&
                            editingOptionType.id === optionType.id ? (
                              <div className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                                      اسم نوع الإضافة
                                    </label>
                                    <input
                                      type="text"
                                      value={editingOptionType.name}
                                      onChange={(e) =>
                                        setEditingOptionType({
                                          ...editingOptionType,
                                          name: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#2E3D88] focus:border-[#2E3D88] outline-none transition-all text-right text-base sm:text-lg font-medium"
                                      dir="rtl"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                  <div>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={
                                            editingOptionType.canSelectMultipleOptions
                                          }
                                          onChange={(e) =>
                                            setEditingOptionType({
                                              ...editingOptionType,
                                              canSelectMultipleOptions:
                                                e.target.checked,
                                            })
                                          }
                                          className="sr-only"
                                        />
                                        <div
                                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                            editingOptionType.canSelectMultipleOptions
                                              ? "bg-green-500 border-green-500"
                                              : "bg-white border-gray-300 dark:bg-gray-600 dark:border-gray-500"
                                          }`}
                                        >
                                          {editingOptionType.canSelectMultipleOptions && (
                                            <FaCheck className="text-white text-sm" />
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                                          اختيار متعدد
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          يسمح باختيار أكثر من خيار
                                        </span>
                                      </div>
                                    </label>
                                  </div>

                                  <div>
                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={
                                            editingOptionType.isSelectionRequired
                                          }
                                          onChange={(e) =>
                                            setEditingOptionType({
                                              ...editingOptionType,
                                              isSelectionRequired:
                                                e.target.checked,
                                            })
                                          }
                                          className="sr-only"
                                        />
                                        <div
                                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                            editingOptionType.isSelectionRequired
                                              ? "bg-red-500 border-red-500"
                                              : "bg-white border-gray-300 dark:bg-gray-600 dark:border-gray-500"
                                          }`}
                                        >
                                          {editingOptionType.isSelectionRequired && (
                                            <FaCheck className="text-white text-sm" />
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                                          اختيار مطلوب
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          يجب على العميل اختيار خيار واحد على
                                          الأقل
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                </div>

                                <div className="flex gap-2 sm:gap-3 justify-start pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setEditingOptionType(null)}
                                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm sm:text-base"
                                  >
                                    إلغاء التعديل
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSaveOptionType}
                                    className="bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base shadow-lg"
                                  >
                                    <FaSave />
                                    حفظ التغييرات
                                  </motion.button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-xl">
                                    <FaCog className="text-blue-600 text-base sm:text-lg" />
                                  </div>
                                  <div>
                                    <h4
                                      className="font-bold text-gray-800 dark:text-gray-200 text-base sm:text-lg mb-1"
                                      dir={
                                        isArabic(optionType.name)
                                          ? "rtl"
                                          : "ltr"
                                      }
                                    >
                                      {optionType.name}
                                    </h4>
                                    <div className="flex gap-3 mt-2">
                                      <div
                                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                                          optionType.canSelectMultipleOptions
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                                        }`}
                                      >
                                        {optionType.canSelectMultipleOptions ? (
                                          <>
                                            <FaCheckSquare className="text-xs" />
                                            متعدد الاختيار
                                          </>
                                        ) : (
                                          <>
                                            <FaSquare className="text-xs" />
                                            اختيار فردي
                                          </>
                                        )}
                                      </div>
                                      <div
                                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                                          optionType.isSelectionRequired
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                                        }`}
                                      >
                                        {optionType.isSelectionRequired ? (
                                          <>
                                            <FaCheckCircle className="text-xs" />
                                            مطلوب
                                          </>
                                        ) : (
                                          <>
                                            <FaSquare className="text-xs" />
                                            اختياري
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-1 sm:gap-2 justify-end sm:justify-start">
                                  <motion.button
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleEditOptionType(optionType)
                                    }
                                    className="bg-blue-500 text-white p-2 sm:p-3 rounded-xl hover:bg-blue-600 transition-all shadow-md"
                                    title="تعديل نوع الإضافة"
                                  >
                                    <FaEdit
                                      size={16}
                                      className="sm:w-4 sm:h-4"
                                    />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleDeleteOptionType(optionType.id)
                                    }
                                    className="bg-red-500 text-white p-2 sm:p-3 rounded-xl hover:bg-red-600 transition-all shadow-md"
                                    title="حذف نوع الإضافة"
                                  >
                                    <FaTrash
                                      size={16}
                                      className="sm:w-4 sm:h-4"
                                    />
                                  </motion.button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProductForm;
