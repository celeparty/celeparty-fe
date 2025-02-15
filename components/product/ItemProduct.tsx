import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaStar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import {FiEdit} from "react-icons/fi"
import {FaRegTrashAlt} from "react-icons/fa"

interface iItemProduct {
	id?: number;
	documentId?: string
	title: string;
	image_url: string;
	price?: number | string;
	rate?: string | number;
	sold?: string;
	location?: string | boolean;
	url: string;
	onEdit?: (documentId: string) => void;
	onDelete?: (documentId: string) => void;
	children?: ReactNode;
}

export default function ItemProduct(props: iItemProduct) {
	return (
		<div className="lg:p-2 lg:w-1/5 w-1/2 p-2  lg:shadow-gray-400 lg:shadow-none">
			<section className=" rounded-lg shadow-md flex flex-col justify-between h-full p-3">
				<Link href={props.url}>
					<div>
						{props.children}
						<div className="relative fill-current w-full h-[100px] mx-auto text-center my-3">
							<Image
								src={props.image_url ? props.image_url : "/images/noimage.png"}
								fill
								alt="image"
								style={{ objectFit: "cover" }}
							/>
						</div>
						<h4 className="text-center text-sm">{props.title}</h4>
						<div className="text-c-orange  text-center text-[12px] font-bold">{ props.price}</div>
					</div>
					<div>
						<div className="flex items-center gap-1 lg:text-[10px] text-[12px] font-medium mt-2 text-c-gray-text2">
							{props.rate && props.sold ? (
								<>
									<FaStar className="text-[#FDD835]" />
									{props.rate ? props.rate+" | " : null}  Terjual {props.sold}
								</>
							) : null}
						</div>
						{props.location ? (
							<div className="flex gap-1 items-center text-[12px] lg:text-[10px] mt-2  text-c-gray-text2">
								<FaLocationDot /> {props.location}
							</div>
						) : null}
					</div>
				</Link>
				<div className="flex gap-1 justify-end py-2">
					<button onClick={() => props.documentId && props.onEdit?.(props.documentId)}>
						<FiEdit className="text-blue-500" size={18}/>
					</button>
					<button onClick={() => props.documentId && props.onDelete?.(props.documentId)}>
						<FaRegTrashAlt className="text-red-500" size={18}/>
					</button>
				</div>
			</section>
		</div>
	);
}
