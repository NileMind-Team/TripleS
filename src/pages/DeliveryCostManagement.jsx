import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import useDeliveryAreas from "../hooks/useDeliveryAreas";
import HeaderStats from "../components/deliveryCostManagement/HeaderStats";
import SearchFilterBar from "../components/deliveryCostManagement/SearchFilterBar";
import DeliveryAreaCard from "../components/deliveryCostManagement/DeliveryAreaCard";
import DeliveryAreaForm from "../components/deliveryCostManagement/DeliveryAreaForm";
import { Helmet } from "react-helmet-async";

export default function DeliveryCostManagement() {
  const navigate = useNavigate();
  const {
    deliveryAreas,
    filteredAreas,
    branches,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    isAdding,
    setIsAdding,
    editingId,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggleActive,
    resetForm,
    formBranchesDropdownOpen,
    setFormBranchesDropdownOpen,
    handleFormBranchSelect,
    isFormValid,
  } = useDeliveryAreas();

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
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f0f3ff] to-[#d9e0f5] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto" dir="rtl">
          <HeaderStats
            deliveryAreasCount={deliveryAreas.length}
            navigate={navigate}
          />

          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filter={filter}
            setFilter={setFilter}
            handleAddNewArea={() => setIsAdding(true)}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Areas List */}
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              <AnimatePresence>
                {filteredAreas.map((area, index) => (
                  <DeliveryAreaCard
                    key={area.id}
                    area={area}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </AnimatePresence>

              {filteredAreas.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600"
                >
                  <FaMapMarkerAlt className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    لم يتم العثور على مناطق توصيل
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                    {searchTerm || filter !== "all"
                      ? "حاول تعديل معايير البحث أو التصفية"
                      : "أضف أول منطقة توصيل للبدء"}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#2E3D88] to-[#4A5DB0] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                  >
                    <span>أضف أول منطقة</span>
                    <FaPlus className="text-xs sm:text-sm" />
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Add/Edit Area Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <DeliveryAreaForm
                    formData={formData}
                    setFormData={setFormData}
                    editingId={editingId}
                    branches={branches}
                    formBranchesDropdownOpen={formBranchesDropdownOpen}
                    setFormBranchesDropdownOpen={setFormBranchesDropdownOpen}
                    handleFormBranchSelect={handleFormBranchSelect}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                    isFormValid={isFormValid}
                    getSelectedBranchName={() => {
                      if (!formData.branchId) return "اختر الفرع";
                      const branch = branches.find(
                        (b) => b.id === parseInt(formData.branchId),
                      );
                      return branch ? branch.name : "اختر الفرع";
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
