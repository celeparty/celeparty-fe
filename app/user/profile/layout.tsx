"use client";
import Basecontent from "@/components/Basecontent";
import Box from "@/components/Box";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
	return (
		<Link href={link} className="relative flex gap-4 items-center mb-4 group transition-all duration-300">
			<div className="relative p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300">
				<Image src={`${icon}`} width={iconWidth} height={iconHeight} alt={title} />
			</div>
			<div className="text-white border-2 border-solid border-white/80 px-4 py-3 rounded-xl flex-1 group-hover:bg-gradient-to-r group-hover:from-c-green group-hover:to-c-green-light group-hover:border-c-green transition-all duration-300 font-medium text-[14px] lg:text-[16px] shadow-lg group-hover:shadow-xl backdrop-blur-sm">
				{title}
			</div>
		</Link>
	);
}

export default function UserDashboardLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, status } = useSession({
		required: true,
		onUnauthenticated() {
			router.push("/auth/login");
		},
	});

	return (
		<div className="relative wrapper-main py-7">
			<Toaster />
			<Basecontent>
				<div className="flex lg:flex-row flex-col justify-between items-start lg:gap-7 gap-2 mx-3 lg:mx-0">
					<Box className="bg-c-blue text-white lg:max-w-[280px] w-full shadow-lg">
						<h4 className="lg:text-start text-center font-extrabold text-[20px] lg:text-[16px] mb-6">
							Menu User
						</h4>
						<div className="relative space-y-2">
							<ItemMenu
								title="Profil"
								icon="/images/icon-profile.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/profile/bio"
							/>
							<ItemMenu
								title="Pesanan"
								icon="/images/icon-orders.svg"
								iconWidth={30}
								iconHeight={30}
								link="/user/profile/orders"
							/>
						</div>
					</Box>
					<div className="w-full">{children}</div>
				</div>
			</Basecontent>
		</div>
	);
}
