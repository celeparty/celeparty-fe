# 📊 Product Filter - Visual Features & UI Components

## 🎯 Feature Breakdown

### Filter Container Layout

```
┌─────────────────────────────────────────────────────────────┐
│                     HALAMAN PRODUCTS                        │
├──────────────┬──────────────────────────────────────────────┤
│  FILTER      │                                              │
│  SIDEBAR     │          PRODUCT GRID CONTENT                │
│  (3 col)     │          (9 col on desktop)                  │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

## 📦 Filter Sidebar Structure

```
┌────────────────────────────────────┐
│  ⚡ FILTER PRODUK          [Count] │  ← Header dengan badge
├────────────────────────────────────┤
│                                    │
│  ⚡ Jenis Event         ▼           │  ← Collapsible Section
│  [Dropdown Select]                │
│                                    │
│  📍 Lokasi              ▼           │
│  [Dropdown Select]                │
│                                    │
│  📦 Kategori Produk     ▼           │
│  ☑ Catering                        │
│  ☑ Dekorasi                        │
│  ☐ Entertainment                   │
│  ☐ Photography                     │
│  [Scrollable List]                │
│                                    │
│  💰 Kisaran Harga       ▼           │
│  [Min Price Input]                │
│  [Max Price Input]                │
│                                    │
│  ↕️  Urutkan Berdasarkan ▼          │
│  [Sort Dropdown]                  │
│                                    │
│  [Reset Semua Filter] ✕           │  ← Only if filters active
│                                    │
├────────────────────────────────────┤
│  💡 Tips: Gunakan filter...        │  ← Info Box
└────────────────────────────────────┘
```

## 🎨 Color Scheme

### Primary Colors
| Element | Color | Code | Usage |
|---------|-------|------|-------|
| Background | Blue | `#1e40af` | Main filter container |
| Header | Dark Blue | `#1e3a8a` | Top section background |
| Border | Light Blue | `#93c5fd` | Input borders, dividers |
| Selected | Green | `#16a34a` | Active category highlight |
| Reset Button | Red | `#ef4444` | Reset action button |
| Text | White | `#ffffff` | On dark backgrounds |
| Placeholder | Light Gray | `#d1d5db` | Input placeholders |

### Gradient
```css
background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
```

## 🔘 Interactive Elements

### 1. Dropdown Selects
```
┌─────────────────────────────┐
│ Semua Jenis Event           │ ▼
├─────────────────────────────┤
│ ✓ Wedding                   │
│ Gathering                   │
│ Corporate Event             │
│ Party                       │
└─────────────────────────────┘
```
- White background, blue border
- Focus: Ring effect & border color change
- Rounded corners (lg)
- Padding: 12px (py-3)

### 2. Price Inputs
```
Min Price    Max Price
┌─────────┐ ┌─────────┐
│ 0       │ │ 0       │
└─────────┘ └─────────┘
Format: Rp 1.000.000
```
- Only accepts digits
- Auto-formats with formatRupiah()
- Side-by-side layout
- Gap between inputs

### 3. Category Checkboxes
```
☑ Catering
  ☑ (Selected, shows X icon, text bold & white)
☐ Dekorasi
  ☐ (Unselected, text light blue)
☐ Entertainment
```
- Custom styled checkboxes
- Accent color: Green (#16a34a)
- Hover effect: bg-blue-600
- Selected state: Bold text, white color

### 4. Reset Button
```
┌──────────────────────────────┐
│ ↺ RESET SEMUA FILTER        │  ← Red gradient
│ hover: darker gradient      │
│ Transition: 300ms           │
└──────────────────────────────┘
```
- Full width
- Red gradient: #ef4444 → #dc2626
- Hover: #dc2626 → #991b1b
- Shadow on hover
- Icon + text

### 5. Collapsible Sections
```
⚡ Jenis Event              ▼  ← Expanded
├─ [Content]
├─ Hover effects
└─ Chevron rotates 180°

📍 Lokasi                  >  ← Collapsed
```
- Smooth animation
- Chevron rotation transition
- Border bottom separator
- Hover opacity change

## 📱 Mobile Responsive

### Mobile View (<md)
```
┌─────────────────────────┐
│ 📦 TAMPILKAN FILTER     │  ← Toggle button
├─────────────────────────┤
│     PRODUCT GRID        │  ← Full width
│     (col-span-12)       │
└─────────────────────────┘
```

When toggled open:
```
┌─────────────────────────┐
│ Filter container        │  ← Sticky top 20
│ shown above grid        │
└─────────────────────────┘
```

### Tablet View (md-lg)
```
┌──────────────────────────────────┐
│  Filter Sidebar │  Product Grid  │
│  (col-span-3)   │  (col-span-9)  │
└──────────────────────────────────┘
```

### Desktop View (>lg)
```
Same as tablet but with sticky positioning
- Sidebar position: sticky top-20
- Follows scroll
- Always visible for convenience
```

## 🎭 Visual States

### Filter Section States

**Expanded State**
```
⚡ Jenis Event              ▼
│  ├─ [White Input]
│  └─ [Focus Border: Blue]
```

**Collapsed State**
```
⚡ Jenis Event              >
```

**Hover State**
```
⚡ Jenis Event              ▼  (opacity-80)
   group-hover effects applied
```

### Input Focus States
```
Default:        Focus:
┌─────────┐     ┌─────────┐
│ Input   │ →   │ Input   │ (Blue border + ring)
└─────────┘     └─────────┘
border:         border: c-blue
blue-200        ring: blue-300
```

### Button States
```
Normal              Hover               Disabled
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Button  │ →   │ Button  │ →   │ Button  │
└─────────┘     └─────────┘     └─────────┘
bg-c-blue   hover:bg-   opacity-50
            blue-700
```

## 📊 Layout Calculations

### Desktop (md and up)
- Filter Sidebar: `col-span-12 md:col-span-3` (25% width)
- Product Grid: `col-span-12 md:col-span-9` (75% width)
- Gap: 6 spaces (24px)

### Sidebar Inner Spacing
- Padding: 24px (p-6)
- Section spacing: 24px (space-y-6)
- Section border: Bottom border with 16px pb-4

### Product Grid Container
- Columns: 12
- Gap: 16px (gap-4)

## 🎯 Badge (Active Filter Count)

```
┌────────────────────────────────┐
│ ⚡ FILTER PRODUK    [Badge]     │
│                     ↓           │
│                    [3]          │  ← Shows count of active filters
│                 (bg-red-500)    │
└────────────────────────────────┘
```

- Background: Red (#ef4444)
- Text: White, Bold, Extra Small
- Padding: 2px 8px
- Border radius: Full

## 🔍 Info Box

```
┌────────────────────────────────┐
│ 💡 Tips: Gunakan filter untuk  │
│    menemukan produk yang sesuai │
│    dengan kebutuhan acara Anda. │
│    Klik tombol reset untuk     │
│    menghapus semua filter.     │
└────────────────────────────────┘
```

- Background: Light blue (#eff6ff)
- Border: 2px border-blue-200
- Text: Small, text-blue-900
- Padding: 16px (p-4)
- Icon: Light bulb emoji

## ✨ Animation Effects

### Chevron Rotation
```css
transition: transform 300ms ease-in-out;
expanded: rotate-180deg;
collapsed: rotate-0deg;
```

### Hover Effects
- Opacity: group-hover:opacity-80
- Duration: transition smooth
- Button shadow: hover:shadow-lg
- Input border: focus:border-c-blue
- Input ring: focus:ring-blue-300

### Button Transitions
```css
transition: all 300ms ease-in-out;
duration: duration-300;
```

## 📐 Spacing & Sizing

| Element | Padding | Margin | Size |
|---------|---------|--------|------|
| Container | p-6 | - | - |
| Input | px-4 py-3 | - | Full width |
| Section | mb-7 | - | - |
| Section title | mb-3 | - | font-bold |
| Border | mb-4 | - | - |
| Badge | px-2 py-1 | - | text-xs |
| Button | py-3 | - | w-full |

## 🎬 User Interaction Flow

1. **User opens page** → Filter open by default on desktop, closed on mobile
2. **User clicks dropdown** → Options appear (select)
3. **User enters price** → Auto-formats to Rupiah
4. **User selects category** → Checkbox toggles, style updates
5. **User changes sort** → Products re-order
6. **User has active filters** → Reset button appears
7. **User clicks reset** → All filters clear, button disappears
8. **On mobile** → Click toggle to show/hide sidebar

## 🔐 Accessibility Features

- Proper `<label>` elements for inputs
- Semantic HTML structure
- Keyboard navigation support (tab, enter, space)
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Color not sole differentiator (includes text/icons)
- Sufficient color contrast ratios

## 🚀 Performance Optimizations

- Collapsible sections reduce DOM complexity
- Lazy loading of category list with scrolling
- Memoized sub-components
- Debounced price input changes
- Optimized re-renders with proper state management
- CSS animations (GPU accelerated)
