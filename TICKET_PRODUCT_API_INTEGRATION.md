# 🔌 Ticket Product - API Integration Guide

**Date**: December 5, 2025  
**Version**: 2.0  
**Status**: ✅ FULLY INTEGRATED

---

## 📡 API Endpoints Overview

### Products Endpoint

```
GET /api/products
```

**Purpose**: Fetch all equipment/rental products  
**Filters**: `filters[publishedAt][$notnull]=true` (optional, auto-applied)  
**Returns**: Array of product objects

**Response Format**:

```json
{
  "data": [
    {
      "documentId": "abc123",
      "title": "Equipment Name",
      "description": "Description",
      "main_image": { "url": "..." },
      "variant": [
        {
          "name": "Standard",
          "price": 100000,
          "stok": 50
        }
      ],
      "kabupaten": "Jakarta",
      "region": "DKI Jakarta",
      "category": { ... },
      "publishedAt": "2024-12-01T10:00:00Z"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

### Tickets Endpoint

```
GET /api/tickets
```

**Purpose**: Fetch all event ticket products  
**Filters**: `filters[publishedAt][$notnull]=true` (REQUIRED for listing)  
**Returns**: Array of ticket objects

**Response Format**:

```json
{
  "data": [
    {
      "documentId": "xyz789",
      "title": "Concert Night 2025",
      "description": "Amazing concert event",
      "main_image": { "url": "..." },
      "variant": [
        {
          "name": "VIP",
          "price": 500000,
          "stok": 20
        },
        {
          "name": "Regular",
          "price": 250000,
          "stok": 100
        }
      ],
      "event_date": "2025-01-15",
      "waktu_event": "18:00",
      "end_date": "2025-01-16",
      "end_time": "23:00",
      "kota_event": "Jakarta",
      "lokasi_event": "Jakarta Convention Center",
      "publishedAt": "2024-12-01T10:00:00Z"
    }
  ],
  "meta": { "pagination": { ... } }
}
```

### Single Product

```
GET /api/products/{slug}?populate=*
GET /api/tickets/{slug}?populate=*
```

**Purpose**: Fetch single product/ticket details  
**Parameters**: `populate=*` (required for all relations)  
**Returns**: Single product/ticket object

---

## 🔄 API Usage in Frontend

### 1. Home Page (ProductList.tsx)

```typescript
// Fetch both data sources in parallel
const [productsRes, ticketsRes] = await Promise.all([
  axiosData("GET", "/api/products?populate=*&pagination[pageSize]=100"),
  axiosData(
    "GET",
    "/api/tickets?populate=*&pagination[pageSize]=100&filters[publishedAt][$notnull]=true"
  ),
]);

// Mark product type
const products = productsRes.data.map((p) => ({
  ...p,
  __type: "product",
}));

const tickets = ticketsRes.data.map((t) => ({
  ...t,
  __type: "ticket",
}));

// Combine
return { data: [...products, ...tickets].slice(0, 5) };
```

### 2. Products Listing Page (ProductContent.tsx)

```typescript
const getCombinedQuery = async (page: number) => {
  const pageSize = 12;
  const productPageSize = Math.ceil(pageSize * 0.7); // 8
  const ticketPageSize = Math.ceil(pageSize * 0.3); // 4

  // Parallel fetch
  const [productsRes, ticketsRes] = await Promise.all([
    axiosData(
      "GET",
      `/api/products?populate=*&pagination[page]=${page}&pagination[pageSize]=${productPageSize}`
    ),
    axiosData(
      "GET",
      `/api/tickets?populate=*&pagination[page]=${page}&pagination[pageSize]=${ticketPageSize}&filters[publishedAt][$notnull]=true`
    ),
  ]);

  // Mark types
  let allProducts = [
    ...productsRes.data.map((p) => ({ ...p, __productType: "equipment" })),
    ...ticketsRes.data.map((t) => ({ ...t, __productType: "ticket" })),
  ];

  // Sort by updatedAt
  allProducts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return allProducts;
};
```

### 3. Detail Page (ContentProduct.tsx)

```typescript
// Already handles both types
const endpoint =
  type === "ticket"
    ? `/api/tickets/${slug}?populate=*`
    : `/api/products/${slug}?populate=*`;

const response = await axiosData("GET", endpoint);
```

### 4. Edit Page with Fallback (ContentProductEdit.tsx)

```typescript
const getQuery = async () => {
  // Determine endpoint based on type param
  let endpoint =
    productType === "ticket"
      ? `/api/tickets/${props.slug}?populate=*`
      : `/api/products/${props.slug}?populate=*`;

  try {
    return await axiosData("GET", endpoint);
  } catch (error) {
    // Fallback: if product fails, try ticket
    if (productType === "product") {
      try {
        return await axiosData("GET", `/api/tickets/${props.slug}?populate=*`);
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
    throw error;
  }
};

// Auto-detect from data
useEffect(() => {
  if (dataContent?.event_date || dataContent?.kota_event) {
    setActualProductType("ticket");
  }
}, [dataContent]);
```

---

## 📊 Request/Response Flow Diagram

```
┌─────────────────────────────────────────────────┐
│          Frontend Component                      │
│  (ProductContent, ProductList, etc.)            │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    API Call 1        API Call 2
    /api/products     /api/tickets
    (Equipment)       (Tickets)
        │                 │
        ├─────────┬───────┤
        │         │       │
        └────┬────┘       │
             │            │
        GET  │            │ GET
        ────────────────────────
             │            │
             └─────┬──────┘
                   │
        ┌──────────▼──────────┐
        │  Response Data:     │
        │  - products array   │
        │  - tickets array    │
        │  - meta/pagination  │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Client Processing: │
        │  - Mark __type      │
        │  - Merge arrays     │
        │  - Sort/filter      │
        │  - Paginate         │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Render Results     │
        │  - Product cards    │
        │  - Ticket cards     │
        │  - With correct URLs│
        └─────────────────────┘
```

---

## 🔐 Authentication

All API calls use existing `axiosData` wrapper:

```typescript
axiosData("GET", endpoint, data, headers);
```

**Authorization**: Handled by `axiosData` using stored tokens  
**Headers**: Automatically added by axios interceptors

---

## ⚡ Performance Optimization

### Parallel Fetching

```typescript
// ✅ GOOD: Parallel (fast)
const [res1, res2] = await Promise.all([
  axiosData(...),
  axiosData(...)
]);

// ❌ AVOID: Sequential (slow)
const res1 = await axiosData(...);
const res2 = await axiosData(...);
```

### Caching with React Query

```typescript
const query = useQuery({
  queryKey: ["products", page, filters],
  queryFn: () => getCombinedQuery(page, filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Pagination

- Default: 12 items per page
- Split: 8 products + 4 tickets
- Adjustable via `pageSize` variable

---

## 📋 API Query Examples

### Get All Published Equipment

```
GET /api/products?populate=*&filters[publishedAt][$notnull]=true
```

### Get All Published Tickets

```
GET /api/tickets?populate=*&filters[publishedAt][$notnull]=true
```

### Get Products by City

```
GET /api/products?populate=*&filters[kabupaten]=Jakarta&filters[publishedAt][$notnull]=true
```

### Get Tickets by City

```
GET /api/tickets?populate=*&filters[kota_event]=Jakarta&filters[publishedAt][$notnull]=true
```

### Get Single Product with Relations

```
GET /api/products/slug-name?populate=*
```

### Get Single Ticket with Relations

```
GET /api/tickets/slug-name?populate=*
```

### Get Page 2 of Products

```
GET /api/products?populate=*&pagination[page]=2&pagination[pageSize]=12
```

### Get Page 2 of Tickets

```
GET /api/tickets?populate=*&pagination[page]=2&pagination[pageSize]=12&filters[publishedAt][$notnull]=true
```

---

## 🔍 Field Mapping Reference

### Equipment Product Fields

```
documentId      → Unique ID
title           → Product name
description     → Description
main_image      → Product images
variant         → Price variants array
  └─ name       → Variant name
  └─ price      → Price
  └─ stok       → Stock
category        → Category relation
kabupaten       → City/Region
region          → Region name
minimal_order_date → Minimum rental days
publishedAt     → Published timestamp
```

### Ticket Product Fields

```
documentId      → Unique ID
title           → Event name
description     → Event description
main_image      → Event images
variant         → Ticket types array
  └─ name       → Ticket type (VIP, Regular, etc)
  └─ price      → Price
  └─ stok       → Available quantity
event_date      → Event start date (YYYY-MM-DD)
waktu_event     → Event start time (HH:MM)
end_date        → Event end date
end_time        → Event end time
kota_event      → Event city
lokasi_event    → Event location/venue
publishedAt     → Published timestamp
```

---

## ⚠️ Important Notes

### Filter Syntax

- `filters[publishedAt][$notnull]=true` - Get published items only
- `filters[kota_event]=Jakarta` - Filter by city
- `filters[kabupaten]=Jakarta` - Filter equipment by region

### Populate Strategy

- Always use `populate=*` to get all relations
- Includes: category, images, variants, etc.

### Pagination

- `page` starts at 1 (not 0)
- `pageSize` is number of items per page
- Response includes `meta.pagination` with totals

### Response Structure

```json
{
  "data": [], // Array of items
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 100,
      "pageCount": 9
    }
  }
}
```

---

## 🚨 Error Handling

### Common Errors

**404 Not Found**

```
Ticket/product doesn't exist
→ Check documentId/slug in database
→ Verify publishedAt is set
```

**Empty Results**

```
No products/tickets found
→ Check filters match database
→ Verify publishedAt field is set
→ Check pagination limits
```

**Slow Responses**

```
API taking too long
→ Check populate=* is really needed
→ Consider reducing pageSize
→ Check backend performance
```

---

## ✅ Testing API Calls

### Via Browser Console

```javascript
// Fetch products
fetch("/api/products?populate=*")
  .then((r) => r.json())
  .then((d) => console.log(d.data[0]));

// Fetch tickets
fetch("/api/tickets?populate=*&filters[publishedAt][$notnull]=true")
  .then((r) => r.json())
  .then((d) => console.log(d.data[0]));
```

### Via curl

```bash
# Products
curl "http://localhost:1337/api/products?populate=*"

# Tickets
curl "http://localhost:1337/api/tickets?populate=*&filters[publishedAt][$notnull]=true"

# Single product
curl "http://localhost:1337/api/products/slug-name?populate=*"
```

---

## 📚 Related Documentation

- `ProductContent.tsx` - Product listing implementation
- `ProductList.tsx` - Home page implementation
- `ContentProduct.tsx` - Detail page implementation
- `ContentProductEdit.tsx` - Edit page with fallback

---

**Status**: 🟢 READY FOR PRODUCTION

All API integrations tested and verified!
