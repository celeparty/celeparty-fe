"use client";
import Basecontent from "@/components/Basecontent";
import Box from "@/components/Box";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface iItemMenu {
	title: string;
	icon: string;
	iconWidth: number;
	iconHeight: number;
	link: string;
	status?: boolean;
}

function ItemMenu({ title, icon, iconWidth, iconHeight, link }: iItemMenu) {
	return (
		<Link href={link} className="relative flex gap-3 items-center mb-5 group">
			<div className="relative">
				<Image src={`${icon}`} width={iconWidth} height={iconHeight} alt={title} />
			</div>
			<div className="text-white border border-solid border-white px-3 py-2 rounded-lg flex-1 group-hover:bg-c-green text-[14px] lg:text-[16px]">
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
	// const dataSession = session?.token as any
	// console.log(dataSession)

	return (
		<div className="relative wrapper-main py-7">
			<Basecontent>
				<div className="flex lg:flex-row flex-col justify-between items-start lg:gap-7 gap-2 mx-3 lg:mx-0">
					<Box className="bg-c-blue text-white lg:max-w-[280px] w-full mt-0">
						<h4 className="lg:text-start text-center font-extrabold lg:font-normal text-[20px] lg:text-[14px]">Menu Mitra</h4>
						<div className="relative mt-5">
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
							/>							<ItemMenu
								title="Pesanan"
								icon="/images/icon-order.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/vendor/orders"
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
					<div className="flex-1">{children}</div>
				</div>
			</Basecontent>
		</div>
	);
}
