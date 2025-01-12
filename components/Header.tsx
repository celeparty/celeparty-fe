"use client";
import { useCart } from "@/lib/store/cart";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdOutlineNotifications } from "react-icons/md";
import { useRouter } from "next/navigation";
import { Notification } from "@/app/products/[slug]/SideBar";

export default function Header() {
	const { data: session, status } = useSession();
	const { cart, setCart, cartLength, setCartLength }: any = useCart();
	const [searchValue, setSearchValue] = useState("");

	const handleSubmit = (e:any) => {
		e.preventDefault();
		if (searchValue.trim() !== "") {
			window.location.href = `/products?search=${encodeURIComponent(searchValue)}`;
		}
	  };
	return (
		<>
			<div className="bg-white shadow-sm w-full px-4 py-4 lg:z-10 lg:sticky top-0">
				<div className="wrapper-main flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-16">
					<div className="flex items-center justify-center lg:justify-between w-full lg:w-fit">
						<Link href="/">
							<Image src="/images/logo.svg" width={234} height={63} alt="logo" />
						</Link>
					</div>
					<div className="relative flex-1 w-full lg:max-w-[900px]">
						<div className="w-full relative  mb-2 lg:mb-0">
							<form onSubmit={handleSubmit}>
								<IoIosSearch className="absolute left-5 text-3xl top-[50%] -translate-y-[50%]" />
								<input
									type="text"
									placeholder="Cari di Celeparty"
									className="input border-c-gray border-solid border-[1px] rounded-lg pr-5 pl-[60px] py-3 bg-white w-full"
									value={searchValue}
									onChange={(e) => setSearchValue(e.target.value)}
								/>
							</form>
						</div>

					</div>
					<div className="relative flex lg:flex-row flex-col items-center text-3xl gap-4 text-c-gray-text font-semibold lg:w-auto w-full">
						<div className="flex gap-4 w-fit p-2 lg:p-0">
							<Link href="/cart" className="item relative">
								<MdOutlineShoppingCart />
								{cart.length > 0 ? (
									<div className="absolute top-[0] right-[0] bg-c-orange w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
										{cart.length}
									</div>
								) : null}
							</Link>
							{/* <div className="item" onClick={setCartLength}>
								<MdOutlineNotifications />
							</div> */}
							{/* <div className="item">
								<IoChatbubbleEllipsesOutline />
							</div> */}
						</div>

						{status === "authenticated" ? (
							<>
								<Link href="/user/home" className="btn">
									Dashboard
								</Link>

								<div className="btnline cursor-pointer" onClick={() => signOut()}>
									Keluar
								</div>
							</>
						) : status === "unauthenticated" ? (
							<>
								<Link href="/auth/login" className="btnline">
									Masuk
								</Link>
								<Link href="/auth/register" className="btn">
									Daftar
								</Link>
							</>
						) : null}
					</div>
				</div>
			</div>


<Notification />

		</>
	);
}
