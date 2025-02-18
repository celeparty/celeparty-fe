"use client"
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaStar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import {FiEdit} from "react-icons/fi"
import {FaRegTrashAlt} from "react-icons/fa"

interface iItemProduct {
	id?: number;
	documentId: string
	title: string;
	image_url: string;
	price: number | string;
	rate?: string | number;
	sold?: string;
	location?: string | boolean;
	url: string;
	onEdit: (id: string, updatedData: {title: string, price: number}) => void;
	// onDelete?: (documentId: string) => void;
	children?: ReactNode;
}


export default function ItemProduct(props: iItemProduct) {
	const [showModalEdit, setShowModalEdit] = useState<boolean>(false)
	const [title, setTitle] = useState<string>(props.title)
	const [price, setPrice] = useState<number>(
		typeof props.price === "string" 
		? parseFloat(props.price.replace(/[^0-9.]/g, "")) || 0 
		: props.price
	)


	const handleSubmit = () => {
		props.onEdit(props.documentId, {title, price: Number(price)})
		setShowModalEdit(false)
	}

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
					<button onClick={() => setShowModalEdit(true)}>
						<FiEdit className="text-blue-500" size={18}/>
					</button>
					{/* <button onClick={() => props.documentId && props.onDelete?.(props.documentId)}>
						<FaRegTrashAlt className="text-red-500" size={18}/>
					</button> */}
				</div>
			</section>

			{
				showModalEdit && (
					<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      					<div className="bg-white p-5 rounded-md w-[90%] md:w-[400px]">
        					<h2 className="text-lg font-bold mb-3">Edit Produk</h2>
        					<div className="mb-2">
          					<label className="block text-sm font-medium">Title</label>
          					<input
            					type="text"
            					className="border p-2 w-full"
            					value={title}
            					onChange={(e) => setTitle(e.target.value)}
          					/>
        					</div>
        					<div className="mb-2">
          					<label className="block text-sm font-medium">Price</label>
          					<input
            					type="number"
            					className="border p-2 w-full"
            					value={price}
            					onChange={(e) => setPrice(Number(e.target.value))}
          					/>
        					</div>
        					<div className="flex justify-end gap-2 mt-4">
          					<button className="bg-blue-500 text-white px-3 py-1 rounded-md" onClick={() => setShowModalEdit(false)}>
            					Batal
          					</button>
          					<button className="bg-blue-500 text-white px-3 py-1 rounded-md" onClick={handleSubmit}>
            					Simpan
          					</button>
        					</div>
      					</div>
    				</div>
				)
			}
		</div>
	);
}
