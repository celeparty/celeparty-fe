"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { ProductImageSlider } from "@/components/product/ProductImageSlider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { whatsAppNumber } from "@/lib/appSettings";
import { getLowestVariantPrice } from "@/lib/productUtils";
import { axiosData } from "@/lib/services";
import { formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FcHighPriority } from "react-icons/fc";
import SideBar from "./SideBar";

export default function ContentProduct(props: any) {
	const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
	const [imgUrls, setImgUrls] = useState<string[]>([]);

	const getQuery = async () => {
		return await axiosData("GET", `/api/products/${props.slug}?populate=*`);
	};
	const query = useQuery({
		queryKey: ["qProductDetail"],
		queryFn: getQuery,
	});

	const dataContent = query?.data?.data;
	const [variantPrice, setVariantPrice] = useState(dataContent?.variant[0]?.price);

	useEffect(() => {
		if (query.isSuccess) {
			const { variant } = dataContent;
			const lowestPrice = getLowestVariantPrice(variant);
			if (lowestPrice) {
				setVariantPrice(lowestPrice);
			}
		}
	}, [dataContent]);

	const populateImageUrls = () => {
		let urls: string[] = [];
		if (dataContent) {
			const { main_image } = dataContent;
			main_image.forEach((element: any) => {
				if (element.url) {
					urls.push(element.url);
				}
			});
		}

		setImgUrls(urls);
	};

	useEffect(() => {
		populateImageUrls();
	}, [dataContent]);

	if (query.isLoading) {
		return (
			<div className="mt-[80px]">
				<div className="wrapper">
					<Skeleton height="300px" width="100%" />
				</div>
			</div>
		);
	}
	if (query.isError) {
		return <ErrorNetwork />;
	}
	const currentRate = dataContent?.rate;

	const askProduct = () => {
		const phone = whatsAppNumber;
		const message = encodeURIComponent(
			`Saya ingin bertanya mengenai produk ini ${dataContent?.title} ${window.location.href}`,
		);
		const url = `https://wa.me/${phone}?text=${message}`;
		window.open(url, "_blank");
	};

	return (
		<Box className="px-4 py-6">
			{dataContent ? (
				<div className="relative flex lg:flex-row flex-col justify-between gap-8 lg:gap-11">
					{/* Main Content Section */}
					<div className="flex flex-col lg:flex-row gap-6 lg:gap-9 items-start w-full lg:w-auto">
						{/* Product Images */}
						<div className="relative w-full lg:min-w-[350px] lg:w-[350px] lg:h-[350px] h-[320px] order-1 lg:order-1">
							<ProductImageSlider urls={imgUrls} />
						</div>

						{/* Product Information */}
						<div className="relative flex-1 space-y-4 order-2 lg:order-2">
							{/* Category */}
							<div className="text-sm text-gray-600 font-medium">
								{dataContent?.category ? dataContent.category.title : "Kategori Tidak Tersedia"}
							</div>

							{/* Title */}
							<h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
								{dataContent?.title || "Produk Tidak Tersedia"}
							</h1>

							{/* Price */}
							<div className="text-xl lg:text-2xl font-bold text-orange-600">
								{dataContent?.variant && dataContent.variant.length > 0 && variantPrice > 0
									? formatRupiah(variantPrice)
									: formatRupiah(dataContent.main_price)}
							</div>

							{/* Rating */}
							<div className="flex items-center gap-2">
								<div className="flex gap-1">
									{[1, 2, 3, 4, 5].map((item) => (
										<FaStar
											key={item}
											className={`w-4 h-4 ${
												item <= currentRate ? "text-yellow-400" : "text-gray-300"
											}`}
										/>
									))}
								</div>
								<span className="text-sm text-gray-600">{dataContent?.average_rating || "0.0"}</span>
							</div>

							{/* Variants */}
							{dataContent?.variant?.length > 1 && (
								<div className="space-y-3">
									<h4 className="text-lg font-semibold text-gray-900">Pilih Varian</h4>
									<div className="flex flex-wrap gap-3">
										{dataContent.variant.map((variant: any) => {
											const isSelected = selectedVariantId === variant.id;
											return (
												<div
													key={variant.id}
													className={`border rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 min-w-[120px] text-center ${
														isSelected
															? "bg-green-600 text-white border-green-600 shadow-md"
															: "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:shadow-sm"
													}`}
													onClick={() => {
														setVariantPrice(variant.price);
														setSelectedVariantId(variant.id);
													}}
												>
													<div className="font-medium">{variant.name}</div>
													{variant.purchase_deadline && (
														<div
															className={`text-xs mt-1 ${
																isSelected ? "text-green-100" : "text-gray-500"
															}`}
														>
															Batas: {variant.purchase_deadline}
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* Event Date */}
							{dataContent?.event_date && (
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<div className="flex items-center gap-2">
										<span className="text-blue-600 font-medium">📅 Tanggal Acara:</span>
										<span className="text-blue-800">{dataContent.event_date}</span>
									</div>
								</div>
							)}

							{/* Event Time */}
							{dataContent?.waktu_event && (
								<div className="bg-green-50 border border-green-200 rounded-lg p-4">
									<div className="flex items-center gap-2">
										<span className="text-green-600 font-medium">⏰ Waktu Acara:</span>
										<span className="text-green-800">{dataContent.waktu_event}</span>
									</div>
								</div>
							)}

							{/* Location */}
							{dataContent?.lokasi_event && (
								<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
									<div className="flex items-center gap-2">
										<span className="text-purple-600 font-medium">📍 Lokasi Acara:</span>
										<span className="text-purple-800">{dataContent.lokasi_event}</span>
									</div>
								</div>
							)}

							{/* Description and Terms */}
							<div className="mt-6">
								<Tabs defaultValue="description" className="w-full">
									<TabsList className="grid w-full grid-cols-2 bg-gray-100">
										<TabsTrigger value="description" className="text-sm">
											Deskripsi
										</TabsTrigger>
										{dataContent?.terms_conditions && (
											<TabsTrigger value="terms" className="text-sm">
												Syarat & Ketentuan
											</TabsTrigger>
										)}
									</TabsList>
									<TabsContent value="description" className="mt-4">
										<div className="prose prose-sm max-w-none">
											<h4 className="text-lg font-semibold mb-3">Deskripsi Produk</h4>
											<div className="text-gray-700 leading-relaxed">
												{dataContent?.description ? (
													parse(dataContent.description)
												) : (
													<span className="text-gray-500 italic">
														Deskripsi tidak tersedia
													</span>
												)}
											</div>
										</div>
									</TabsContent>
									{dataContent?.terms_conditions && (
										<TabsContent value="terms" className="mt-4">
											<div className="prose prose-sm max-w-none">
												<h4 className="text-lg font-semibold mb-3">Syarat & Ketentuan</h4>
												<div className="text-gray-700 leading-relaxed">
													{parse(dataContent.terms_conditions)}
												</div>
											</div>
										</TabsContent>
									)}
								</Tabs>
							</div>

							{/* WhatsApp Button */}
							<div className="pt-4">
								<Button
									onClick={askProduct}
									className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
								>
									<Image
										src="/images/icon-wa.svg"
										alt="WhatsApp"
										width={20}
										height={20}
										className="mr-2"
									/>
									Tanyakan Produk
								</Button>
							</div>

							{/* Payment Rules for Escrow */}
							{dataContent.escrow && (
								<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
									<h4 className="font-semibold text-yellow-800 mb-3">Aturan Pembayaran</h4>
									<ol className="text-sm text-yellow-700 space-y-1 mb-3">
										<li>1. 30% Down Payment untuk booking tanggal acara</li>
										<li>2. 100% pembayaran maksimal H-1 tanggal loading</li>
									</ol>
									<p className="text-xs text-yellow-600 italic">
										Jika sampai H-1 tanggal loading pembayaran belum mencapai 100%, sisa dana akan
										dikembalikan ke User, kecuali dana yang sudah masuk Down Payment.
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Sidebar */}
					<div className="w-full lg:min-w-[300px] lg:w-[300px] order-3 lg:order-3">
						<div className="sticky top-4">
							<SideBar
								dataProducts={dataContent}
								currentPrice={variantPrice > 0 ? variantPrice : dataContent?.main_price}
								selectedVariantId={selectedVariantId}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<FcHighPriority className="w-16 h-16 mb-4" />
					<h2 className="text-2xl font-semibold text-gray-700 mb-2">Produk Tidak Tersedia</h2>
					<p className="text-gray-500">Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
				</div>
			)}
		</Box>
	);
}
