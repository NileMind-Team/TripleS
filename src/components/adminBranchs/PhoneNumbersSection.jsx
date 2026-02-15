import React, { useState } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaPlus,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const PhoneNumbersSection = ({ phoneNumbers, setPhoneNumbers }) => {
  const [phoneNumber, setPhoneNumber] = useState({
    phone: "",
    type: "Mobile",
    isWhatsapp: false,
  });
  const [openDropdown, setOpenDropdown] = useState(null);

  const getPhoneTypeArabic = (type) => {
    switch (type) {
      case "Mobile":
        return "موبايل";
      case "Landline":
        return "أرضي";
      case "Other":
        return "آخر";
      default:
        return type;
    }
  };

  const handlePhoneInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "isWhatsapp") {
      if (phoneNumber.type !== "Mobile") {
        setPhoneNumber({
          ...phoneNumber,
          isWhatsapp: false,
        });
        return;
      }
      setPhoneNumber({
        ...phoneNumber,
        [name]: checked,
      });
    } else {
      setPhoneNumber({
        ...phoneNumber,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handlePhoneTypeSelect = (type) => {
    const updatedPhoneNumber = {
      ...phoneNumber,
      type: type,
    };

    if (type !== "Mobile") {
      updatedPhoneNumber.isWhatsapp = false;
    }

    setPhoneNumber(updatedPhoneNumber);
    setOpenDropdown(null);
  };

  const addPhoneNumber = () => {
    if (!phoneNumber.phone.trim()) {
      return;
    }

    const newPhoneNumber = {
      phone: phoneNumber.phone,
      type: phoneNumber.type,
      isWhatsapp:
        phoneNumber.type === "Mobile" ? phoneNumber.isWhatsapp : false,
    };

    setPhoneNumbers([...phoneNumbers, newPhoneNumber]);
    setPhoneNumber({
      phone: "",
      type: "Mobile",
      isWhatsapp: false,
    });
  };

  const removePhoneNumber = (index) => {
    const updatedPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(updatedPhoneNumbers);
  };

  return (
    <div className="pt-2 sm:pt-3">
      <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
        أرقام الهاتف *
      </label>

      <div className="bg-gray-50 dark:bg-gray-600/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              رقم الهاتف *
            </label>
            <div className="relative group">
              <FaPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E3D88] text-xs" />
              <input
                type="text"
                name="phone"
                value={phoneNumber.phone}
                onChange={handlePhoneInputChange}
                className="w-full border border-gray-200 dark:border-gray-500 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg pr-9 pl-3 py-2 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-sm"
                placeholder="أدخل رقم الهاتف"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              النوع *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "phoneType" ? null : "phoneType",
                  )
                }
                className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-500 bg-white dark:bg-gray-600 text-black dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#2E3D88] focus:border-transparent transition-all duration-200 text-sm"
              >
                <span className="flex items-center gap-2">
                  <FaPhone className="text-[#2E3D88] text-xs" />
                  {getPhoneTypeArabic(phoneNumber.type)}
                </span>
                <motion.div
                  animate={{
                    rotate: openDropdown === "phoneType" ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown className="text-[#2E3D88] text-xs" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openDropdown === "phoneType" && (
                  <motion.ul
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                    dir="rtl"
                  >
                    {[
                      { value: "Mobile", label: "موبايل" },
                      { value: "Landline", label: "أرضي" },
                      { value: "Other", label: "آخر" },
                    ].map((type) => (
                      <li
                        key={type.value}
                        onClick={() => handlePhoneTypeSelect(type.value)}
                        className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#f0f3ff] hover:to-[#d9e0f5] dark:hover:from-gray-500 dark:hover:to-gray-400 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm border-b border-gray-100 dark:border-gray-500 last:border-b-0 text-right"
                      >
                        {type.label}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            <label
              className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                phoneNumber.type !== "Mobile"
                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <input
                type="checkbox"
                name="isWhatsapp"
                checked={phoneNumber.isWhatsapp}
                onChange={handlePhoneInputChange}
                disabled={phoneNumber.type !== "Mobile"}
                className={`w-3 h-3 text-[#2E3D88] bg-gray-100 border-gray-300 rounded focus:ring-[#2E3D88] focus:ring-1 ${
                  phoneNumber.type !== "Mobile"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              />
              <FaWhatsapp
                className={`text-sm ${
                  phoneNumber.type !== "Mobile"
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-green-500"
                }`}
              />
              <span
                className={phoneNumber.type !== "Mobile" ? "opacity-70" : ""}
              >
                واتساب {phoneNumber.type !== "Mobile" ? "(غير متاح)" : ""}
              </span>
            </label>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addPhoneNumber}
            disabled={!phoneNumber.phone.trim()}
            className={`py-2 rounded-lg font-semibold transition-all duration-300 text-sm flex items-center justify-center gap-2 ${
              phoneNumber.phone.trim()
                ? "bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white hover:shadow-lg"
                : "bg-gray-300 dark:bg-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            <FaPlus className="text-xs" />
            إضافة رقم
          </motion.button>
        </div>
      </div>

      {phoneNumbers.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            الأرقام المضافة ({phoneNumbers.length})
          </h4>
          {phoneNumbers.map((phone, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg p-2 sm:p-3"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <FaPhone className="text-[#2E3D88] text-xs sm:text-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {phone.phone}
                    </span>
                    {phone.isWhatsapp && (
                      <FaWhatsapp className="text-green-500 text-xs" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({getPhoneTypeArabic(phone.type)})
                    {phone.type !== "Mobile" &&
                      phone.isWhatsapp &&
                      " - الواتساب غير متاح لهذا النوع"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePhoneNumber(index)}
                className="text-red-500 hover:text-red-700 transition-colors duration-200 flex-shrink-0 ml-2"
              >
                <FaTimes size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhoneNumbersSection;
