# Dokumentasi Product Filter Container

## 📋 Ringkasan
Komponen `ProductFilter` adalah sidebar filter profesional yang ditempatkan di sebelah kiri halaman produk (`/products`). Komponen ini menyediakan fitur filtering dan sorting yang comprehensive dengan desain modern dan user-friendly.

## ✨ Fitur Utama

### 1. **Filter Jenis Event**
- Dropdown selection untuk memilih tipe event
- Opsi "Semua Jenis Event" sebagai default
- Terintegrasi dengan API backend

### 2. **Filter Lokasi (Kota)**
- Dropdown selection untuk memilih lokasi
- Opsi "Semua Lokasi" sebagai default
- Data dinamis dari state component

### 3. **Filter Kategori Produk**
- Checkbox list dengan scrollable view (max-height: 320px)
- Support untuk kategori "Lainnya"
- Visual feedback ketika kategori dipilih (highlight hijau)
- Ikon X hijau untuk kategori yang aktif

### 4. **Filter Range Harga**
- Input minimum dan maksimum price
- Format otomatis ke Rupiah (contoh: 1.000.000)
- Label terpisah untuk min dan max price
- Validasi input hanya angka

### 5. **Sort/Urutkan Berdasarkan**
- 3 opsi sorting:
  - 🆕 **Terbaru** (updatedAt:desc)
  - 📉 **Harga: Rendah ke Tinggi** (main_price:asc)
  - 📈 **Harga: Tinggi ke Rendah** (main_price:desc)

### 6. **Reset Filter Button**
- Tombol merah dengan gradient
- Hanya tampil ketika ada filter yang aktif
- Reset semua filter ke nilai default
- Icon RotateCcw untuk visual clarity

### 7. **Mobile Responsive**
- Toggle button untuk mobile (< md)
- Sidebar dapat disembunyikan/ditampilkan
- Full-width pada mobile
- 3-kolom layout pada desktop

## 🎨 Desain & Styling

### Color Theme
- **Primary**: `#1e40af` (Biru - c-blue)
- **Secondary**: `#16a34a` (Hijau - c-green)
- **Accent**: `#ef4444` (Merah untuk reset)
- **Background**: Gradient biru
- **Text**: White pada dark background, Gray pada input

### Component Styling
```
- Container: bg-gradient-to-br from-c-blue to-blue-700
- Header: bg-c-blue dengan border bottom
- Filter sections: Collapsible dengan chevron animation
- Input fields: White background, blue border, rounded corners
- Reset button: Red gradient dengan hover effect
- Info box: Light blue background dengan border
```

### Typography
- Header: Bold, Large
- Section titles: Bold, Medium
- Labels: Bold, Extra Small
- Body text: Regular, Small

## 📦 Props Interface

```typescript
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
}
```

## 🔄 State Management

Komponen menggunakan state hooks untuk:
- **expandedSections**: Tracking state collapse/expand filter sections
- **minPrice/maxPrice**: Input value untuk price range
- **selectedEventType**: Event type yang dipilih
- **selectedLocation**: Lokasi yang dipilih
- **activeCategory**: Kategori produk yang aktif
- **sortOption**: Opsi sorting yang dipilih
- **isFilterOpen**: State mobile toggle

## 🎯 Integration Points

### ProductContent_ Component (`/app/products/ProductContent_.tsx`)
1. Import ProductFilter component
2. Pass semua props yang diperlukan
3. Handle state updates via callbacks
4. Manage `hasActiveFilters` state untuk badge count

### Key Functions di ProductContent_:
```typescript
const resetFilters = () => {
  // Reset semua filter ke default
}

const hasActiveFilters: boolean = 
  !!selectedEventType ||
  !!eventDate ||
  !!selectedLocation ||
  !!activeCategory ||
  !!minPrice ||
  !!maxPrice ||
  sortOption !== "updatedAt:desc"
```

## 🚀 Usage Example

```tsx
<ProductFilter
  eventTypes={eventTypes}
  selectedEventType={selectedEventType}
  onEventTypeChange={setSelectedEventType}
  locations={eventLocations}
  selectedLocation={selectedLocation}
  onLocationChange={setSelectedLocation}
  categories={filterCategories}
  activeCategory={activeCategory}
  onCategoryChange={(cat) => {
    setActiveCategory(cat);
    handleFilter(cat ? cat : "");
  }}
  minPrice={minPrice}
  maxPrice={maxPrice}
  onMinPriceChange={setMinPrice}
  onMaxPriceChange={setMaxPrice}
  sortOption={sortOption}
  onSortChange={setSortOption}
  onResetFilters={resetFilters}
  hasActiveFilters={hasActiveFilters}
  isOpen={isFilterOpen}
  onToggle={() => setIsFilterOpen(!isFilterOpen)}
/>
```

## 📱 Responsive Breakpoints

- **Mobile (<md)**: Full-width dengan toggle button
- **Tablet (md-lg)**: 3-column left sidebar layout
- **Desktop (>lg)**: Sticky sidebar dengan proper spacing

## 🔐 Sub-Components

### 1. **FilterSection**
Komponen reusable untuk setiap filter section
- Props: title, icon, isExpanded, onToggle, children
- Features: Collapsible, animated chevron, hover effects

### 2. **CategoryCheckbox**
Custom checkbox untuk kategori
- Props: title, isSelected, onChange
- Features: Hover effect, selected state highlight, visual indicator

## 📌 Notes

1. **Price Input Formatting**: Otomatis format ke Rupiah dengan removeNonDigits helper
2. **Filter Sections**: Semua sections bisa di-collapse untuk better UX
3. **Mobile Toggle**: Filter bisa disembunyikan pada mobile untuk maximize content area
4. **Active Filter Badge**: Shows count of active filters pada header
5. **Accessibility**: Proper labels, semantic HTML, keyboard navigation support

## 🔗 Related Files

- **Component File**: `/components/product/ProductFilter.tsx`
- **Implementation**: `/app/products/ProductContent_.tsx`
- **Styles**: TailwindCSS utility classes
- **Interfaces**: `/lib/interfaces/iCategory.ts`, `/lib/interfaces/iCommon.ts`

## ✅ Testing Checklist

- [ ] All filter options work correctly
- [ ] Reset button clears all filters
- [ ] Mobile toggle shows/hides filter
- [ ] Price input accepts only numbers
- [ ] Sort options change product order
- [ ] Active filter badge shows correct count
- [ ] Responsive layout on all screen sizes
- [ ] Form validation works as expected
- [ ] Filter state persists during navigation
- [ ] API integration returns filtered results
