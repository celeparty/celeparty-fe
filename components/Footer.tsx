import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Footer() {
	return (
		<div className="bg-c-blue text-white w-full min-h-10 py-12">
			<div className="wrapper">
				<div
					className="flex lg:flex-row flex-col justify-between gap-7 
                    [&_h4]:font-hind [&_h4]:text-[20px] [&_h4]:font-bold [&_h4]:mb-2
                    [&_li]:py-1
                "
				>
					<div className="item flex justify-center lg:block">
						<div className="[&_h4]:text-center lg:[&_h4]:text-start">
							<h4>Celeparty</h4>
							<ul className="[&_li]:text-center lg:[&_li]:text-start">
								<li>
									<Link href="/about">Tentang Celeparty</Link>
								</li>
								<li>
									<Link href="/auth/login?theme=vendor">Mitra Celeparty</Link>
								</li>
								<li>
									<Link href="/blog">Blog</Link>
								</li>
								<li>
									<Link href="/contact">Hubungi Kami</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="item flex justify-center lg:block">
						<div className="[&_h4]:text-center [&_h4]:mb-4 lg:[&_h4]:mb-0 lg:[&_h4]:text-start">
							<h4>Ikuti Kami</h4>
							<div className="flex gap-3">
								<Link href="/">
									<Image src="/images/icon-ig.svg" alt="image" width={24} height={27} />
								</Link>
								<Link href="/">
									<Image src="/images/icon-wa.svg" alt="image" width={24} height={27} />
								</Link>
								<Link href="/">
									<Image src="/images/icon-tk.svg" alt="image" width={24} height={27} />
								</Link>
								<Link href="/">
									<Image src="/images/icon-fb.svg" alt="image" width={24} height={27} />
								</Link>
							</div>
						</div>
					</div>
					<div className="item flex justify-center [&_h4]:mb-4 lg:[&_h4]:mb-0 [&_h4]:text-center lg:[&_h4]:text-start">
						<div>
							<h4>Pembayaran</h4>
							<Image src="/images/payment.png" width={368} height={113} alt="image" />
						</div>
					</div>
					<div className="item text-center">
						<Link href="/">
							<Image
								src="/images/logo-white.png"
								className="mx-auto mb-5"
								alt="celeparty"
								width={234}
								height={63}
							/>
						</Link>
						<div className="relative flex gap-3">
							<Link href="/">
								<Image src="/images/appstore.png" width={171} height={53} alt="image" />
							</Link>
							<Link href="/">
								<Image src="/images/playstore.png" width={171} height={53} alt="image" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
