import Link from "next/link";
export default function TopHeader() {
	return (
		<div className="relative bg-[#F0F3F7] px-4 mb-4 lg:mb-0 lg:block hidden">
			<div className="wrapper-main flex lg:flex-row flex-col gap-2 lg:gap-0 items-center justify-between">
				<ul className="ms-auto flex items-center gap-2 lg:gap-7 text-sm ">
					<li className="w-1/4 lg:w-auto text-center lg:text-start py-2">
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
