"use client";

import React, { useState } from "react";
import Box from "@/components/Box";
import { Button } from "@/components/ui/button";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { iEventCategory } from "@/lib/interfaces/iCategory";
import { formatRupiah } from "@/lib/utils";
import {
  ChevronDown,
  X,
  RotateCcw,
  DollarSign,
  MapPin,
  Grid3x3,
  Zap,
  ArrowUpDown,
} from "lucide-react";

interface ProductFilterProps {
  // Event Type
  eventTypes: iSelectOption[];
  selectedEventType: string;
  onEventTypeChange: (type: string) => void;

  // Location
  locations: iSelectOption[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;

  // Categories
  categories: iEventCategory[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;

  // Price Range
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;

  // Sort
  sortOption: string;
  onSortChange: (sort: string) => void;

  // Reset
  onResetFilters: () => void;

  // Check if any filter is active
  hasActiveFilters: boolean;

  // Mobile toggle
  isOpen?: boolean;
  onToggle?: () => void;

  // Apply filters
  onApplyFilters?: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  eventTypes,
  selectedEventType,
  onEventTypeChange,
  locations,
  selectedLocation,
  onLocationChange,
  categories,
  activeCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sortOption,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
  isOpen = true,
  onToggle,
  onApplyFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    eventType: true,
    location: true,
    category: true,
    price: true,
    sort: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceInput = (
    value: string,
    setter: (value: string) => void
  ) => {
    const digits = value.replace(/\D/g, "");
    setter(digits ? formatRupiah(Number(digits)) : "");
  };

  return (
    <div className="col-span-12 md:col-span-3">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <Button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 bg-c-blue text-white hover:bg-blue-700"
        >
          <Grid3x3 size={20} />
          {isOpen ? "Sembunyikan Filter" : "Tampilkan Filter"}
        </Button>
      </div>

      {/* Filter Container - Mobile Hidden by Default */}
      {isOpen && (
        <div className="space-y-4 sticky top-20">
          <Box
            variant="bordered"
            size="lg"
            className="bg-gradient-to-br from-c-blue to-blue-700 text-white p-0 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-c-blue px-6 py-4 flex items-center justify-between border-b border-blue-500">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-yellow-300" />
                <h3 className="font-bold text-lg">Filter Produk</h3>
              </div>
              {hasActiveFilters && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {[
                    selectedEventType && "jenis event",
                    selectedLocation && "lokasi",
                    activeCategory && "kategori",
                    minPrice && "harga min",
                    maxPrice && "harga max",
                  ]
                    .filter(Boolean).length}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Filter: Event Type */}
              <FilterSection
                title="Jenis Event"
                icon={<Zap size={18} />}
                isExpanded={expandedSections.eventType}
                onToggle={() => toggleSection("eventType")}
              >
                <select
                  value={selectedEventType}
                  onChange={(e) => onEventTypeChange(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-gray-800 bg-white border-2 border-blue-200 focus:border-c-blue focus:ring-2 focus:ring-blue-300 outline-none transition"
                >
                  <option value="">Semua Jenis Event</option>
                  {eventTypes.map((eventType, index) => (
                    <option key={index} value={eventType.value}>
                      {eventType.label}
                    </option>
                  ))}
                </select>
              </FilterSection>

              {/* Filter: Location */}
              <FilterSection
                title="Lokasi"
                icon={<MapPin size={18} />}
                isExpanded={expandedSections.location}
                onToggle={() => toggleSection("location")}
              >
                <select
                  value={selectedLocation}
                  onChange={(e) => onLocationChange(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-gray-800 bg-white border-2 border-blue-200 focus:border-c-blue focus:ring-2 focus:ring-blue-300 outline-none transition"
                >
                  <option value="">Semua Lokasi</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </FilterSection>

              {/* Filter: Category */}
              <FilterSection
                title="Kategori Produk"
                icon={<Grid3x3 size={18} />}
                isExpanded={expandedSections.category}
                onToggle={() => toggleSection("category")}
              >
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {categories.map((cat, index) => (
                    <CategoryCheckbox
                      key={index}
                      title={cat.title}
                      isSelected={activeCategory === cat.title}
                      onChange={() => {
                        const isActive = activeCategory === cat.title;
                        onCategoryChange(isActive ? null : cat.title);
                      }}
                    />
                  ))}
                  <CategoryCheckbox
                    title="Lainnya"
                    isSelected={activeCategory === "Lainnya"}
                    onChange={() => {
                      const isActive = activeCategory === "Lainnya";
                      onCategoryChange(isActive ? null : "Lainnya");
                    }}
                  />
                </div>
              </FilterSection>

              {/* Filter: Price Range */}
              <FilterSection
                title="Kisaran Harga"
                icon={<DollarSign size={18} />}
                isExpanded={expandedSections.price}
                onToggle={() => toggleSection("price")}
              >
                <div className="space-y-3">
                  <div className="relative">
                    <label className="text-xs font-semibold text-blue-100 block mb-2">
                      Harga Minimum (Rp)
                    </label>
                    <input
                      type="text"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => handlePriceInput(e.target.value, onMinPriceChange)}
                      className="w-full rounded-lg px-4 py-3 text-gray-800 bg-white border-2 border-blue-200 focus:border-c-blue focus:ring-2 focus:ring-blue-300 outline-none transition placeholder-gray-400"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-semibold text-blue-100 block mb-2">
                      Harga Maksimum (Rp)
                    </label>
                    <input
                      type="text"
                      placeholder="0"
                      value={maxPrice}
                      onChange={(e) => handlePriceInput(e.target.value, onMaxPriceChange)}
                      className="w-full rounded-lg px-4 py-3 text-gray-800 bg-white border-2 border-blue-200 focus:border-c-blue focus:ring-2 focus:ring-blue-300 outline-none transition placeholder-gray-400"
                    />
                  </div>
                </div>
              </FilterSection>

              {/* Filter: Sort By */}
              <FilterSection
                title="Urutkan Berdasarkan"
                icon={<ArrowUpDown size={18} />}
                isExpanded={expandedSections.sort}
                onToggle={() => toggleSection("sort")}
              >
                <select
                  value={sortOption}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="w-full rounded-lg px-4 py-3 text-gray-800 bg-white border-2 border-blue-200 focus:border-c-blue focus:ring-2 focus:ring-blue-300 outline-none transition"
                >
                  <option value="updatedAt:desc">🆕 Terbaru</option>
                  <option value="main_price:asc">📉 Harga: Rendah ke Tinggi</option>
                  <option value="main_price:desc">📈 Harga: Tinggi ke Rendah</option>
                </select>
              </FilterSection>

              {/* Submit Filter Button */}
              <button
                onClick={onApplyFilters}
                className="w-full bg-gradient-to-r from-c-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition duration-300 shadow-md hover:shadow-lg mb-4"
              >
                <Zap size={18} />
                Terapkan Filter
              </button>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition duration-300 shadow-md hover:shadow-lg"
                >
                  <RotateCcw size={18} />
                  Reset Semua Filter
                </button>
              )}
            </div>
          </Box>

          {/* Info Box */}
          <Box
            variant="bordered"
            size="sm"
            className="bg-blue-50 border-2 border-blue-200 text-blue-900 p-4 rounded-lg"
          >
            <p className="text-xs leading-relaxed">
              💡 <strong>Tips:</strong> Gunakan filter untuk menemukan produk yang
              sesuai dengan kebutuhan acara Anda. Klik tombol reset untuk menghapus
              semua filter.
            </p>
          </Box>
        </div>
      )}
    </div>
  );
};

// Filter Section Component
interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="border-b border-blue-400 last:border-b-0 pb-4 last:pb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 group hover:opacity-80 transition"
      >
        <div className="flex items-center gap-2 text-left">
          <span className="text-blue-100 group-hover:text-white transition">
            {icon}
          </span>
          <h4 className="font-bold text-base group-hover:text-blue-50 transition">
            {title}
          </h4>
        </div>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && <div className="mt-4">{children}</div>}
    </div>
  );
};

// Category Checkbox Component
interface CategoryCheckboxProps {
  title: string;
  isSelected: boolean;
  onChange: () => void;
}

const CategoryCheckbox: React.FC<CategoryCheckboxProps> = ({
  title,
  isSelected,
  onChange,
}) => {
  return (
    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 cursor-pointer transition group">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onChange}
        className="w-4 h-4 rounded accent-green-500 cursor-pointer"
      />
      <span
        className={`text-sm font-medium transition ${
          isSelected ? "text-white font-bold" : "text-blue-100 group-hover:text-white"
        }`}
      >
        {title}
      </span>
      {isSelected && (
        <span className="ml-auto bg-green-500 rounded-full p-1">
          <X size={12} className="text-white" />
        </span>
      )}
    </label>
  );
};

export default ProductFilter;
