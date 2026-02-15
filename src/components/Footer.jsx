import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaWhatsapp,
} from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "فيسبوك",
      icon: <FaFacebookF />,
      url: "https://www.facebook.com/profile.php?id=61580352808105",
      color: "hover:bg-blue-600",
    },
    {
      name: "واتساب",
      icon: <FaWhatsapp />,
      url: "https://wa.me/201273188267",
      color: "hover:bg-green-600",
    },
  ];

  return (
    <footer
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-[#1a1a1a] text-white relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-[#2E3D88]/10 to-[#4A5DB0]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-[#4A5DB0]/10 to-[#2E3D88]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-[#2E3D88]/5 to-[#4A5DB0]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-12 md:col-span-5"
          >
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Triple-S"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] bg-clip-text text-transparent">
                  Triple-S
                </span>
              </div>
            </Link>

            <p className="text-gray-300 mb-6 leading-relaxed">
              شريكك التقني لتطوير المواقع والتطبيقات والأنظمة الإدارية، نبتكر
              حلولًا ذكية تجمع بين السرعة والأمان وسهولة الاستخدام.{" "}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <FaPhone className="text-[#4A5DB0] text-sm" />
                <span className="text-sm" dir="ltr">
                  +20 102 750 8008
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <FaMapMarkerAlt className="text-[#4A5DB0] text-sm" />
                <span className="text-sm">الفيوم - المحمدية</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-12 md:col-span-5"
          >
            <div className="text-center w-full">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
                <FaClock className="text-[#4A5DB0]" />
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-12 md:col-span-2"
          >
            <div className="h-full flex flex-col items-center justify-center">
              <div className="md:hidden mt-8">
                <div className="flex items-center justify-center gap-6">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.15, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 bg-gray-700 rounded-2xl flex items-center justify-center text-white transition-all duration-300 ${social.color} hover:shadow-xl border border-gray-600`}
                      title={social.name}
                    >
                      <span className="text-xl">{social.icon}</span>
                    </motion.a>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex flex-col items-center justify-center h-full">
                <div className="flex flex-col items-center gap-6">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.15, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 bg-gray-700 rounded-2xl flex items-center justify-center text-white transition-all duration-300 ${social.color} hover:shadow-xl border border-gray-600`}
                      title={social.name}
                    >
                      <span className="text-xl">{social.icon}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-gray-400 text-sm text-center flex flex-wrap items-center justify-center gap-2"
              dir="rtl"
            >
              © {currentYear} Triple-S. جميع الحقوق محفوظة. | صنع بواسطة{" "}
              <a
                href="https://wa.me/201062485133"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A5DB0] font-semibold hover:text-[#2E3D88] transition-colors duration-300"
              >
                شركه TripleS للبرمجيات
              </a>
              في مصر — وللتواصل
              <a
                href="https://wa.me/201062485133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600 hover:bg-green-500 transition-all duration-300 hover:scale-110"
                title="تواصل واتساب"
              >
                <FaWhatsapp className="text-white text-sm" />
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2E3D88] via-[#4A5DB0] to-[#2E3D88]"></div>
    </footer>
  );
};

export default Footer;
