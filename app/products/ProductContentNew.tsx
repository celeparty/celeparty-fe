"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosData } from "@/lib/services";
import { formatRupiah } from "@/lib/utils";
import { getLowestVariantPrice } from "@/lib/productUtils";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import ItemProduct from "@/components/product/ItemProduct";
import { Filter, MapPin, RotateCcw, X } from "lucide-react";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";

// Helper for image URL
const getImageUrl = (image: any): string => {
	if (!image) return "/images/noimage.png";
	const url = image?.data?.[0]?.attributes?.url || image?.[0]?.url || image?.url || null;
	if (!url) return "/images/noimage.png";
	if (url.startsWith("http")) return url;
	const baseUrl = process.env.NEXT_PUBLIC_BASE_API || "https://papi.celeparty.com";
	return `${baseUrl}${url}`;
};

export function ProductContentNew() {
	const router = useRouter();
	const params = useSearchParams();
	const getType = params.get("type") || "";
	const getSearch = params.get("search") || "";
	const getCategory = params.get("cat") || "";

	// State for filters
	const [selectedCity, setSelectedCity] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [priceMin, setPriceMin] = useState<string>("");
	const [priceMax, setPriceMax] = useState<string>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [cities, setCities] = useState<iSelectOption[]>([]);
	const [categories, setCategories] = useState<iSelectOption[]>([]);

	const pageSize = 12; // Smaller page size for lighter loading

	// Fetch cities for dropdown
	const citiesQuery = useQuery({
		queryKey: ["cities"],
		queryFn: () => axiosData("GET", "/api/products?populate=*&pagination[pageSize]=1000&fields=region"),
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
	});

	// Fetch categories for dropdown
	const categoriesQuery = useQuery({
		queryKey: ["categories"],
		queryFn: () => axiosData("GET", "/api/event-categories?populate=*"),
		staleTime: 5 * 60 * 1000,
	});

	// Fetch products with filters
	const productsQuery = useQuery({
		queryKey: ["products", getType, getSearch, getCategory, selectedCity, selectedCategory, priceMin, priceMax, currentPage],
		queryFn: async () => {
			let queryString = `/api/products?populate=*&sort=updatedAt:desc&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`;

			if (getType) queryString += `&filters[user_event_type][name][$eq]=${encodeURIComponent(getType)}`;
			if (getSearch) {
				const searchFields = ['title', 'description', 'category.title', 'region', 'kabupaten', 'lokasi_event', 'kota_event'];
				const orConditions = searchFields.map(field => `filters[${field}][$containsi]=${encodeURIComponent(getSearch)}`).join('&');
				queryString += `&${orConditions}`;
			}
			if (getCategory || selectedCategory) {
				const cat = selectedCategory || getCategory;
				queryString += `&filters[category][title][$eq]=${encodeURIComponent(cat)}`;
			}
			if (selectedCity) queryString += `&filters[region][$eq]=${encodeURIComponent(selectedCity)}`;
			if (priceMin) queryString += `&filters[main_price][$gte]=${priceMin.replace(/\D/g, '')}`;
			if (priceMax) queryString += `&filters[main_price][$lte]=${priceMax.replace(/\D/g, '')}`;

			return axiosData("GET", queryString);
		},
	});

	// Set cities and categories from queries
	useEffect(() => {
		if (citiesQuery.data?.data) {
			const uniqueCities = [...new Set(citiesQuery.data.data.map((p: any) => p.region).filter(Boolean))];
			setCities(uniqueCities.map(city => ({ value: city, label: city })));
		}
	}, [citiesQuery.data]);

	useEffect(() => {
		if (categoriesQuery.data?.data) {
			setCategories(categoriesQuery.data.data.map((cat: any) => ({ value: cat.title, label: cat.title })));
		}
	}, [categoriesQuery.data]);

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedCity, selectedCategory, priceMin, priceMax, getSearch, getCategory, getType]);

	const products = productsQuery.data?.data || [];
	const totalPages = productsQuery.data?.meta?.pagination?.pageCount || 1;
	const totalProducts = productsQuery.data?.meta?.pagination?.total || 0;

	const resetFilters = () => {
		setSelectedCity("");
		setSelectedCategory("");
		setPriceMin("");
		setPriceMax("");
		setCurrentPage(1);
		router.replace("/products", { scroll: false });
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const hasActiveFilters = selectedCity || selectedCategory || priceMin || priceMax;

	if (productsQuery.isLoading) return <div className="text-center py-8">Memuat produk...</div>;
	if (productsQuery.isError) return <ErrorNetwork />;

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Sidebar Filters */}
					<div className="lg:col-span-1">
						<Card className="bg-c-blue text-white border-0 shadow-lg sticky top-4">
							<CardHeader className="pb-4">
								<CardTitle className="flex items-center gap-2 text-lg">
									<Filter className="w-5 h-5 text-c-green" />
									Filter Produk
									{hasActiveFilters && (
										<Badge variant="secondary" className="bg-c-green text-white ml-auto">
											{Object.values({ selectedCity, selectedCategory, priceMin, priceMax }).filter(Boolean).length}
										</Badge>
									)}
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* City Dropdown */}
								<div>
									<label className="block text-sm font-medium mb-2 flex items-center gap-2">
										<MapPin className="w-4 h-4 text-c-green" />
										Kota
									</label>
									<Select value={selectedCity} onValueChange={setSelectedCity}>
										<SelectTrigger className="bg-white text-black border-0">
											<SelectValue placeholder="Pilih kota" />
										</SelectTrigger>
										<SelectContent>
											{cities.map((city) => (
												<SelectItem key={city.value} value={city.value}>
													{city.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Category Dropdown */}
								<div>
									<label className="block text-sm font-medium mb-2">Kategori</label>
									<Select value={selectedCategory} onValueChange={setSelectedCategory}>
										<SelectTrigger className="bg-white text-black border-0">
											<SelectValue placeholder="Pilih kategori" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((cat) => (
												<SelectItem key={cat.value} value={cat.value}>
													{cat.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Price Range */}
								<div>
									<label className="block text-sm font-medium mb-2">Rentang Harga</label>
									<div className="grid grid-cols-2 gap-2">
										<Input
											type="text"
											placeholder="Min"
											value={priceMin}
											onChange={(e) => setPriceMin(e.target.value)}
											className="bg-white text-black border-0"
										/>
										<Input
											type="text"
											placeholder="Max"
											value={priceMax}
											onChange={(e) => setPriceMax(e.target.value)}
											className="bg-white text-black border-0"
										/>
									</div>
								</div>

								{/* Reset Button */}
								{hasActiveFilters && (
									<Button
										onClick={resetFilters}
										variant="outline"
										className="w-full bg-white text-c-blue border-white hover:bg-gray-100 flex items-center gap-2"
									>
										<RotateCcw className="w-4 h-4" />
										Reset Filter
									</Button>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Products Grid */}
					<div className="lg:col-span-3">
						<div className="mb-4">
							<h2 className="text-2xl font-bold text-c-blue mb-2">Produk Terbaik Kami</h2>
							<p className="text-gray-600">Temukan Tiket Event dan Sewa Peralatan untuk Acara yang Profesional</p>
							{totalProducts > 0 && (
								<p className="text-sm text-gray-500 mt-2">{totalProducts} produk ditemukan</p>
							)}
						</div>

						{products.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-gray-500 text-lg">Tidak ada produk yang sesuai dengan filter.</p>
							</div>
						) : (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
									{products.map((product: any) => (
										<ItemProduct
											key={product.id}
											url={`/products/${product.documentId}`}
											title={product.title}
											image_url={getImageUrl(product.main_image)}
											price={
												product?.variant && product.variant.length > 0
													? formatRupiah(getLowestVariantPrice(product.variant))
													: formatRupiah(product?.main_price || 0)
											}
											rate={product.rate ? `${product.rate}` : "1"}
											sold={product.sold_count}
											location={product.region || null}
										/>
									))}
								</div>

								{/* Pagination */}
								{totalPages > 1 && (
									<div className="flex justify-center">
										<PaginationControls
											currentPage={currentPage}
											totalPages={totalPages}
											onPageChange={handlePageChange}
										/>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProductContentNew;
