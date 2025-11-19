"use client";
import Box from "@/components/Box";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { formatNumberWithDots } from "@/lib/utils";
import { Calendar, Filter, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import React, { useState, useEffect } from "react";

interface ProductFiltersProps {
	selectedLocation: string;
	setSelectedLocation: (value: string) => void;
	eventDate: string;
	setEventDate: (value: string) => void;
	minimalOrder: string;
	setMinimalOrder: (value: string) => void;
	eventLocations: iSelectOption[];
	price: { min: any; max: any };
	setPrice: (value: { min: any; max: any }) => void;
	resetFilters: () => void;
	activeCategory: string | null;
	setActiveCategory: (value: string | null) => void;
	filterCategories: any[];
	handleFilter: (category: string) => void;
	isFilterCatsAvailable: boolean;
	isMobile?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
	selectedLocation,
	setSelectedLocation,
	eventDate,
	setEventDate,
	minimalOrder,
	setMinimalOrder,
	eventLocations,
	price,
	setPrice,
	resetFilters,
	activeCategory,
	setActiveCategory,
	filterCategories,
	handleFilter,
	isFilterCatsAvailable,
	isMobile = false,
}) => {
	const [isExpanded, setIsExpanded] = useState(!isMobile);
	const [searchTerm, setSearchTerm] = useState("");

	const hasActiveFilters = selectedLocation || eventDate || minimalOrder || price.min || price.max || activeCategory;

	const filteredCategories = filterCategories.filter((cat) =>
		cat.title.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handlePriceChange = (field: "min" | "max", value: string) => {
		const rawValue = value.replace(/\D/g, "");
		const formatted = formatNumberWithDots(rawValue);
		setPrice({ ...price, [field]: formatted });
	};

	const clearPriceFilter = () => {
		setPrice({ min: "", max: "" });
	};

	const activeFiltersCount = [selectedLocation, eventDate, minimalOrder, price.min, price.max, activeCategory].filter(
		Boolean,
	).length;

	if (!isFilterCatsAvailable) {
		return (
			<div className="w-full">
				<Card className="bg-c-blue text-white border-0 shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<MapPin className="w-5 h-5 text-c-green" />
							<div className="flex-1">
								<Select onValueChange={setSelectedLocation} value={selectedLocation}>
									<SelectTrigger className="bg-white text-black border-0 h-10">
										<SelectValue placeholder="Pilih Lokasi Acara" />
									</SelectTrigger>
									<SelectContent>
										{eventLocations.map((location, index) => (
											<SelectItem key={index} value={location.value}>
												{location.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{selectedLocation && (
								<Button
									variant="ghost"
									size="sm"
									onClick={resetFilters}
									className="text-white hover:bg-white/20 p-2"
								>
									<X className="w-4 h-4" />
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="w-full">
			<Card className="bg-gradient-to-br from-c-blue via-c-blue to-c-blue-light text-white border-0 shadow-strong rounded-2xl overflow-hidden">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg font-bold flex items-center gap-2">
							<Filter className="w-5 h-5 text-c-green" />
							Filter Produk
						</CardTitle>
						<div className="flex items-center gap-2">
							{activeFiltersCount > 0 && (
								<Badge variant="secondary" className="bg-c-green text-white">
									{activeFiltersCount}
								</Badge>
							)}
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsExpanded(!isExpanded)}
								className="text-white hover:bg-white/20 p-2 md:hidden"
							>
								<SlidersHorizontal className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className={`space-y-6 ${isMobile && !isExpanded ? "hidden" : ""}`}>
					{/* Location Filter */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<MapPin className="w-4 h-4 text-c-green" />
							<label className="text-sm font-semibold">Lokasi Acara</label>
						</div>
					<Select onValueChange={setSelectedLocation} value={selectedLocation}>
						<SelectTrigger className="bg-white text-black border-0 h-10 rounded-lg">
							<SelectValue placeholder="Pilih lokasi" />
						</SelectTrigger>
							<SelectContent>
								{eventLocations.map((location, index) => (
									<SelectItem key={index} value={location.value}>
										{location.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator className="bg-white/20" />

					{/* Event Date Filter */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4 text-c-green" />
							<label className="text-sm font-semibold">Tanggal Acara</label>
						</div>
					<Input
						type="date"
						value={eventDate}
						onChange={(e) => setEventDate(e.target.value)}
						className="bg-white text-black border-0 h-10 rounded-lg"
						placeholder="Pilih tanggal"
					/>
					</div>

					<Separator className="bg-white/20" />

					{/* Minimal Order Filter */}
					<div className="space-y-3">
						<label className="text-sm font-semibold">Minimal Order</label>
					<Input
						type="number"
						value={minimalOrder}
						onChange={(e) => setMinimalOrder(e.target.value)}
						className="bg-white text-black border-0 h-10 rounded-lg"
						placeholder="Masukkan jumlah minimal"
					/>
					</div>

					<Separator className="bg-white/20" />

					{/* Price Range Filter */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-sm font-semibold">Kisaran Harga</label>
							{(price.min || price.max) && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearPriceFilter}
									className="text-white hover:bg-white/20 p-1 h-auto"
								>
									<X className="w-3 h-3" />
								</Button>
							)}
						</div>
						<div className="grid grid-cols-2 gap-2">
							<Input
								type="text"
								value={price.min}
								onChange={(e) => handlePriceChange("min", e.target.value)}
								className="bg-white text-black border-0 h-10"
								placeholder="Min"
							/>
							<Input
								type="text"
								value={price.max}
								onChange={(e) => handlePriceChange("max", e.target.value)}
								className="bg-white text-black border-0 h-10"
								placeholder="Max"
							/>
						</div>
					</div>

					<Separator className="bg-white/20" />

					{/* Category Filter */}
					<div className="space-y-3">
						<label className="text-sm font-semibold">Kategori Produk</label>

						{/* Search within categories */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="bg-white text-black border-0 h-10 pl-10"
								placeholder="Cari kategori..."
							/>
						</div>



						{/* Category List */}
						<div className="max-h-48 overflow-y-auto space-y-2">
							{filteredCategories.map((cat, index) => (
								<div
									key={index}
									className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
										activeCategory === cat.title
											? "bg-c-green text-white shadow-md"
											: "bg-white/10 hover:bg-white/20 text-white"
									}`}
									onClick={() => {
										const isActive = activeCategory === cat.title;
										setActiveCategory(isActive ? null : cat.title);
										handleFilter(isActive ? "" : cat.title);
									}}
								>
									<div className="w-2 h-2 rounded-full bg-current flex-shrink-0"></div>
									<span className="text-sm font-medium">{cat.title}</span>
								</div>
							))}
							{filteredCategories.length === 0 && searchTerm && (
								<div className="text-center text-white/70 py-4">Tidak ada kategori yang cocok</div>
							)}
						</div>
					</div>

					{/* Reset Filters Button */}
					{hasActiveFilters && (
						<>
							<Separator className="bg-white/20" />
							<Button
								variant="outline"
								onClick={resetFilters}
								className="w-full bg-white text-c-blue border-white hover:bg-gray-50"
							>
								Reset Semua Filter
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
