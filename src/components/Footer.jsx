import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaWhatsapp,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([
    { id: "all", name: "جميع العناصر" },
    { id: "offers", name: "العروض" },
  ]);
  const navigate = useNavigate();

  const quickLinks = [
    { name: "الصفحة الرئيسية", path: "/" },
    { name: "عربة التسوق", path: "/cart" },
    { name: "عناويني", path: "/addresses" },
    { name: "المفضلة", path: "/favorites" },
  ];

  const socialLinks = [
    {
      name: "فيسبوك",
      icon: <FaFacebookF />,
      url: "https://www.facebook.com/ELZAWYRESTAURANT",
      color: "hover:bg-blue-600",
    },
    {
      name: "واتساب",
      icon: <FaWhatsapp />,
      url: "https://wa.me/201027508008",
      color: "hover:bg-green-600",
    },
  ];

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
        console.error("Error fetching categories in footer:", error);
      }
    };

    fetchCategories();
  }, []);

  const getCategoriesInColumns = () => {
    const columns = [];
    const itemsPerColumn = 4;

    const otherCategories = categories.filter(
      (cat) => cat.id !== "all" && cat.id !== "offers",
    );

    const firstColumnItems = [
      categories.find((cat) => cat.id === "all"),
      categories.find((cat) => cat.id === "offers"),
      ...otherCategories.slice(0, itemsPerColumn - 2),
    ].filter(Boolean);

    columns.push(firstColumnItems);

    const remainingCategories = otherCategories.slice(itemsPerColumn - 2);

    for (let i = 0; i < remainingCategories.length; i += itemsPerColumn) {
      const column = remainingCategories.slice(i, i + itemsPerColumn);
      if (column.length > 0) {
        columns.push(column);
      }
    }

    return columns;
  };

  const categoryColumns = getCategoriesInColumns();

  const handleCategoryClick = (categoryId) => {
    if (window.location.pathname === "/") {
      window.dispatchEvent(
        new CustomEvent("categorySelectedFromFooter", {
          detail: { categoryId, fromHomePage: true },
        }),
      );
    } else {
      navigate("/", {
        state: {
          selectedCategoryFromFooter: categoryId,
          scrollToCategories: true,
        },
      });
    }
  };

  return (
    <footer
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-[#1a1a1a] text-white relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-[#E41E26]/5 to-[#FDB913]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Chicken One"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent">
                  Chicken One
                </span>
              </div>
            </Link>

            <p className="text-gray-300 mb-6 leading-relaxed">
              نقدم أشهى الدجاج المقلي والوجبات. جرب مزيجًا مثاليًا من القرمشة
              اللذيذة والنكهات الأصيلة.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <FaPhone className="text-[#FDB913] text-sm" />
                <span className="text-sm" dir="ltr">
                  +20 102 750 8008
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <FaMapMarkerAlt className="text-[#FDB913] text-sm" />
                <span className="text-sm">
                  الفيوم - الحواتم - ميدان الحواتم
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              روابط سريعة
              <div className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-gradient-to-r from-[#FDB913] to-[#E41E26]"></div>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group"
                  >
                    <FaArrowRight className="text-[#FDB913] text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 rotate-180" />
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h3 className="text-lg font-bold mb-6">الفئات</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categoryColumns.map((column, index) => (
                <ul key={index} className="space-y-3">
                  {column.map((category) => (
                    <li key={category.id}>
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className="flex items-center gap-3 text-gray-300 hover:text-white w-full text-right"
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
              <FaClock className="text-[#FDB913]" />
              ساعات العمل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-300">
              <div>
                <p className="font-semibold text-white">السبت - الأربعاء</p>
                <p>11:00 ص - 2:00 ص</p>
              </div>

              <div>
                <p className="font-semibold text-white">الخميس</p>
                <p>11:00 ص - 3:00 ص</p>
              </div>

              <div>
                <p className="font-semibold text-white">الجمعة</p>
                <p>12:00 م - 3:00 ص</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center" dir="rtl">
              © {currentYear} Chicken-One. جميع الحقوق محفوظة. | صنع بواسطة{" "}
              <span className="text-[#E41E26]">شركة TripleS للبرمجيات</span> في
              مصر
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center text-white transition-all duration-300 ${social.color} hover:shadow-lg`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E41E26] via-[#FDB913] to-[#E41E26]"></div>
    </footer>
  );
};

export default Footer;
