"use client";
import Basecontent from "@/components/Basecontent";
import Box from "@/components/Box";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

interface iItemMenu {
	title: string;
	icon: string;
	iconWidth: number;
	iconHeight: number;
	link: string;
	status?: boolean;
}

function ItemMenu({ title, icon, iconWidth, iconHeight, link }: iItemMenu) {
	const pathname = usePathname();
	const isActive = pathname === link || (link !== "/user/vendor" && pathname.startsWith(link));

	return (
		<Link href={link} className="relative flex gap-3 items-center mb-3 group">
			<div className="relative flex-shrink-0">
				<Image
					src={`${icon}`}
					width={iconWidth}
					height={iconHeight}
					alt={title}
					className="opacity-90 group-hover:opacity-100 transition-opacity"
				/>
			</div>
			<div
				className={cn(
					"text-white border border-solid border-white/30 px-4 py-3 rounded-xl flex-1 group-hover:bg-c-green group-hover:border-c-green transition-all duration-200 text-[14px] lg:text-[16px] font-medium shadow-sm",
					isActive && "bg-c-green border-c-green shadow-md",
				)}
			>
				{title}
			</div>
		</Link>
	);
}

export default function DashboardLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, status } = useSession({
		required: true,
		onUnauthenticated() {
			router.push("/auth/mitra/login");
		},
	});

	return (
		<div className="relative wrapper-main py-7">
			<Toaster />
			<Basecontent>
				<div className="flex lg:flex-row flex-col justify-between items-start lg:gap-7 gap-2 mx-3 lg:mx-0">
					<Box className="bg-c-blue text-white lg:max-w-[280px] w-full shadow-lg">
						<div className="p-6">
							<h4 className="lg:text-start text-center font-extrabold text-[22px] lg:text-[18px] mb-2">
								Menu Mitra
							</h4>
							<p className="text-center lg:text-left text-white/80 text-sm mb-6">
								Kelola bisnis Anda dengan mudah
							</p>
						</div>
						<div className="relative px-6 pb-6">
							<ItemMenu
								title="Profil"
								icon="/images/icon-profile.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/vendor/profile"
							/>
							<ItemMenu
								title="Produk Saya"
								icon="/images/icon-product.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/vendor/products"
							/>
							<ItemMenu
								title="Tambah Produk"
								icon="/images/icon-add-product.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/vendor/add-product"
							/>
							<ItemMenu
								title="Manajemen Pesanan"
								icon="/images/mng-order.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/vendor/equipment-orders"
							/>
							<ItemMenu
								title="Informasi Transaksi"
								icon="/images/icon-order.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/vendor/orders"
							/>
							<ItemMenu
								title="Management Tiket"
								icon="/images/ticket.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/vendor/tickets"
							/>
							<ItemMenu
								title="Dompet Saya"
								icon="/images/icon-wallet.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/vendor/wallet"
							/>
						</div>
					</Box>
					<div className="w-full">{children}</div>
				</div>
			</Basecontent>
		</div>
	);
}
