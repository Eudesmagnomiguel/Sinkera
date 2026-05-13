
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
}

export const MobileFilters = ({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  selectedBrands,
  setSelectedBrands,
}: MobileFiltersProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="h-full overflow-y-auto pb-20">
          <Sidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
          />
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
