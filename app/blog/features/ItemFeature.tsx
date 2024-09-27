import Image from "next/image";
import Link from "next/link";
import React from "react";

interface iItemFeature {
	title: string;
	date: string;
	image: string;
	slug: string;
	small?: boolean;
}

export default function ItemFeature({ title, date, image, slug, small }: iItemFeature) {
	return (
		<div className={`${small ? "w-full mb-5" : "w-full lg:w-6/12 px-5 pb-5"}`}>
			<div className="flex gap-3">
				<div
					className={`relative fill-current ${small ? "w-[100px] h-[100px]" : "w-[150px] h-[150px]"} overflow-hidden`}
				>
					<Image
						src={image ? image : "/images/no-image.png"}
						fill
						alt={title}
						style={{ objectFit: "cover" }}
					/>
				</div>
				<div className="flex flex-col gap-3 flex-1">
					<Link href={slug ? slug : "/"} className="text-black">
						{title ? title : "no title"}
					</Link>
					<div className="text-[14px]">{date ? date : "no date"}</div>
				</div>
			</div>
		</div>
	);
}
