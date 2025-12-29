import React, { useState } from "react";
import {
  FaBuilding,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaCity,
  FaUser,
  FaClock,
  FaCheck,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PhoneNumbersSection from "./PhoneNumbersSection";

const BranchForm = ({
  formData,
  setFormData,
  cities,
  managers,
  onSubmit,
  onCancel,
  isEditing,
  openDropdown,
  setOpenDropdown,
  convert12To24HourFormat,
}) => {
  const [localOpenDropdown, setLocalOpenDropdown] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    if (name === "openingTime" || name === "closingTime") {
      if (value && convert12To24HourFormat) {
        processedValue = convert12To24HourFormat(value);
      }
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : processedValue,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setLocalOpenDropdown(null);
    if (setOpenDropdown) setOpenDropdown(null);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.openingTime.trim() !== "" &&
      formData.closingTime.trim() !== "" &&
      formData.cityId !== "" &&
      formData.managerId !== "" &&
      formData.phoneNumbers.length > 0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      const dataToSubmit = {
        ...formData,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
      };

      onSubmit(dataToSubmit);
    }
  };

  const currentDropdown = openDropdown || localOpenDropdown;

  return (
    <motion.div
      id="branch-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="xl:col-span-1"
    >
      <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-lg sticky top-4 sm:top-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">
            {isEditing ? "تعديل الفرع" : "إضافة فرع جديد"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] transition-colors duration-200 flex-shrink-0 ml-2"
          >
            <FaTimes size={16} className="sm:size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              اسم الفرع *
            </label>
            <div className="relative group">
              <FaBuilding className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="اسم الفرع"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              البريد الإلكتروني *
            </label>
            <div className="relative group">
              <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="البريد الإلكتروني"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              العنوان *
            </label>
            <div className="relative group">
              <FaMapMarkerAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="العنوان الكامل"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              رابط الموقع
            </label>
            <div className="relative group">
              <FaGlobe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="url"
                name="locationUrl"
                value={formData.locationUrl}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="رابط خرائط جوجل (اختياري)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                المدينة *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setLocalOpenDropdown(
                      currentDropdown === "city" ? null : "city"
                    )
                  }
                  className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  <span className="flex items-center gap-2">
                    <FaCity className="text-[#E41E26]" />
                    {formData.cityId
                      ? cities.find((c) => c.id === formData.cityId)?.name
                      : "اختر المدينة"}
                  </span>
                  <motion.div
                    animate={{
                      rotate: currentDropdown === "city" ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-[#E41E26]" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {currentDropdown === "city" && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                      dir="rtl"
                    >
                      {cities.map((city) => (
                        <li
                          key={city.id}
                          onClick={() => handleSelectChange("cityId", city.id)}
                          className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-500 dark:hover:to-gray-400 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-500 last:border-b-0 text-right"
                        >
                          {city.name}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                المدير *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setLocalOpenDropdown(
                      currentDropdown === "manager" ? null : "manager"
                    )
                  }
                  className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                >
                  <span className="flex items-center gap-2">
                    <FaUser className="text-[#E41E26]" />
                    {formData.managerId
                      ? managers.find((m) => m.id === formData.managerId)
                          ?.firstName +
                        " " +
                        managers.find((m) => m.id === formData.managerId)
                          ?.lastName
                      : "اختر المدير"}
                  </span>
                  <motion.div
                    animate={{
                      rotate: currentDropdown === "manager" ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-[#E41E26]" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {currentDropdown === "manager" && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                      dir="rtl"
                    >
                      {managers.map((manager) => (
                        <li
                          key={manager.id}
                          onClick={() =>
                            handleSelectChange("managerId", manager.id)
                          }
                          className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-500 dark:hover:to-gray-400 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-500 last:border-b-0 text-right"
                        >
                          {manager.firstName} {manager.lastName} (
                          {manager.email})
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
              الحالة *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setLocalOpenDropdown(
                    currentDropdown === "status" ? null : "status"
                  )
                }
                className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              >
                <span>{formData.status === "Open" ? "مفتوح" : "مغلق"}</span>
                <motion.div
                  animate={{
                    rotate: currentDropdown === "status" ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown className="text-[#E41E26]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {currentDropdown === "status" && (
                  <motion.ul
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                    dir="rtl"
                  >
                    {["Open", "Closed"].map((status) => (
                      <li
                        key={status}
                        onClick={() => handleSelectChange("status", status)}
                        className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-500 dark:hover:to-gray-400 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-500 last:border-b-0 text-right"
                      >
                        {status === "Open" ? "مفتوح" : "مغلق"}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                وقت الفتح *
              </label>
              <div className="relative group">
                <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                وقت الإغلاق *
              </label>
              <div className="relative group">
                <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          <PhoneNumbersSection
            phoneNumbers={formData.phoneNumbers}
            setPhoneNumbers={(phones) =>
              setFormData({ ...formData, phoneNumbers: phones })
            }
          />

          <div className="flex items-center gap-2 pt-1 sm:pt-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4 text-[#E41E26] bg-gray-100 border-gray-300 rounded focus:ring-[#E41E26] focus:ring-2"
            />
            <label
              htmlFor="isActive"
              className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              فرع نشط
            </label>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] dark:text-[#FDB913] dark:border-[#FDB913] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300 text-sm sm:text-base"
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
                  ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaCheck className="text-xs sm:text-sm" />
              {isEditing ? "تحديث الفرع" : "إضافة الفرع"}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default BranchForm;
