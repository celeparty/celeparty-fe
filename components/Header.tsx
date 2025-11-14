"use client";
import { Notification } from "@/app/products/[slug]/SideBar";
import { useCart } from "@/lib/store/cart";
import { useUser } from "@/lib/store/user";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { MdOutlineShoppingCart } from "react-icons/md";

export default function Header() {
	const { data: session, status } = useSession();
	const { cart, setCart, cartLength, setCartLength }: any = useCart();
	const [searchValue, setSearchValue] = useState("");
	const { userMe, setUserMe }: any = useUser();

	const handleSubmit = (e: any) => {
		e.preventDefault();
		if (searchValue.trim() !== "") {
			window.location.href = `/products?search=${encodeURIComponent(searchValue)}`;
		}
	};

	useEffect(() => {
		if (status === "authenticated" && session?.user) {
			setUserMe(session);
		}
	}, [session, status, setUserMe]);

	const logout = () => {
		setUserMe(null);
		signOut();
	};

	return (
		<>
			<header className="bg-white shadow-soft w-full px-4 py-4 lg:sticky lg:top-0 lg:z-10">
				<div className="wrapper-main flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-16">
					{/* Logo Section */}
					<div className="flex items-center justify-center lg:justify-start w-full lg:w-auto">
						<Link href="/" className="hover:opacity-80 transition-opacity duration-200">
							<Image
								src="/images/logo.svg"
								width={234}
								height={63}
								alt="Celeparty Logo"
								className="h-12 lg:h-auto w-auto"
							/>
						</Link>
					</div>

					{/* Search Section */}
					<div className="relative flex-1 w-full lg:max-w-[900px]">
						<form onSubmit={handleSubmit} className="w-full">
							<div className="relative">
								<IoIosSearch className="absolute left-4 text-xl text-c-gray-500 top-1/2 -translate-y-1/2" />
								<input
									type="text"
									placeholder="Cari di Celeparty"
									className="w-full pl-12 pr-4 py-3 border border-c-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-c-blue focus:border-transparent transition-all duration-200"
									value={searchValue}
									onChange={(e) => setSearchValue(e.target.value)}
								/>
							</div>
						</form>
					</div>

					{/* Actions Section */}
					<div className="flex items-center justify-end gap-4 w-full lg:w-auto">
						{/* Cart Icon */}
						{status === "authenticated" && (
							<Link
								href="/cart"
								className="relative p-2 hover:bg-c-gray-50 rounded-lg transition-colors duration-200"
								aria-label="Keranjang belanja"
							>
								<MdOutlineShoppingCart className="text-2xl text-c-gray-700" />
								{cart.length > 0 && (
									<span className="absolute -top-1 -right-1 bg-c-orange text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
										{userMe ? cart.length : 0}
									</span>
								)}
							</Link>
						)}

						{/* Auth Buttons */}
						<div className="flex items-center gap-3">
							{status === "authenticated" ? (
								<>
									<Link
										href="/user/home"
										className="px-4 py-2 bg-c-blue text-white rounded-lg hover:bg-c-blue-light transition-colors duration-200 font-medium"
									>
										Dashboard
									</Link>
									<button
										onClick={logout}
										className="px-4 py-2 border border-c-gray-300 text-c-gray-700 rounded-lg hover:bg-c-gray-50 transition-colors duration-200 font-medium"
									>
										Keluar
									</button>
								</>
							) : status === "unauthenticated" ? (
								<>
									<Link
										href={`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
										className="px-4 py-2 border border-c-gray-300 text-c-gray-700 rounded-lg hover:bg-c-gray-50 transition-colors duration-200 font-medium"
									>
										Masuk
									</Link>
									<Link
										href={`/auth/register?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
										className="px-4 py-2 bg-c-green text-white rounded-lg hover:bg-c-green-light transition-colors duration-200 font-medium"
									>
										Daftar
									</Link>
								</>
							) : null}
						</div>
					</div>
				</div>
			</header>

			<Notification />
		</>
	);
}
