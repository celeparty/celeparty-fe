import Image from "next/image";
import Link from "next/link";
import React from "react";
import { IoIosSearch } from "react-icons/io";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdOutlineNotifications } from "react-icons/md";
export default function TopHeader() {
	return (
		<div className="relative bg-[#F0F3F7] px-4 mb-4 lg:mb-0">
			<div className="wrapper-main flex lg:flex-row flex-col gap-2 lg:gap-0 items-center justify-between">
				<div className="flex lg:flex-row flex-col mt-4 lg:mt-0 items-center gap-2 mb-4 lg:mb-0">
					<div className="lg:text-sm text-lg">Download Celeparty App</div>
					<div className="flex lg:flex-row flex-row">
						<Link href="/">
							<Image src="/images/appstore.png" width={123} height={41} alt="app store" />
						</Link>
						<Link href="/">
							<Image src="/images/playstore.png" width={123} height={43} alt="play store" />
						</Link>
					</div>
				</div>
				<ul className="flex items-center gap-2 lg:gap-7 text-sm ">
					<li className="w-1/4 lg:w-auto text-center lg:text-start">
						<Link href="/about">Tentang Celeparty</Link>
					</li>
					<li className=" w-1/4 lg:w-auto text-center lg:text-start">
						<Link href="/auth/login?theme=vendor">Mitra Celeparty</Link>
					</li>
					<li className=" w-1/4 lg:w-auto text-center lg:text-start">
						<Link href="/blog">Blog</Link>
					</li>
					<li className=" w-1/4 lg:w-auto text-center lg:text-start">
						<Link href="/contact">Hubungi Kami</Link>
					</li>
				</ul>
			</div>
		</div>
	);
}
