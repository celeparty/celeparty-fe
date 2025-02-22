"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import { axiosUser, getDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { useUser } from "@/lib/store/user";
import axios from "axios";
import { useLocalStorage } from "@/lib/hook/useLocalStorage";
import {FiEdit} from "react-icons/fi"
import {FaRegTrashAlt} from "react-icons/fa"
import { MdCancel } from "react-icons/md";
import toast, {Toaster} from "react-hot-toast";

interface iItemStatus {
	status: string;
	value: number | string;
	color: string;
}

interface iUpdateProduct {
	title: string,
	main_price: number
}

function ItemStatus({ status, value, color }: iItemStatus): JSX.Element {
	return (
		<div
			className={`py-3 px-5 text-center rounded-lg text-white min-w-[160px]`}
			style={{ backgroundColor: `${color}` }}
		>
			<h4>{status}</h4>
			<strong>{value}</strong>
		</div>
	);
}
export default function Products() {
	const router = useRouter()
	const [title, setTitle] = useState<string>("")
	const [mainPrice, setMainPrice] = useState<number>(0)
	const [showModal, setShowModal] = useState<boolean>(false)
	const { data: session, status } = useSession();
	const [myData, setMyData] = useState<any>([]);
	const [selectProduct, setSelectProduct] = useState<any>(null)
	const {userMe}:any = useUser()
	const getData =()=> {
		axios.get(`${process.env.BASE_API}/api/products?populate=*&filters[users_permissions_user][documentId]=${userMe.user.documentId}`, {
			headers: {
				Authorization: `Bearer ${userMe.jwt}`,
			},
		}).then ((res)=> {
			setMyData(res?.data?.data)
		})

	}
	useEffect(() => {
		if (status === "authenticated" && userMe?.user?.documentId ) {
			getData();
		}
	}, [status, session, userMe]);

	const dataContent = myData;

	const handleUpdateProduct = async (documentId: string, productUpdated: iUpdateProduct) => {
		try {
		  const res = await axios.put(`${process.env.BASE_API}/api/products/${documentId}`, {
			data: productUpdated
		  }, {
			headers: {
				Authorization: `Bearer ${process.env.KEY_API}`,
				"Content-Type": "application/json"
			}
		  });
		  setMyData((prevData: any) => prevData.map((item: any) => item.documentId === documentId ? {...item, ...productUpdated} : item) )
		} catch (err) {
			console.error("Update Failed:", err);
		}
	};

	const handleEdit = async () => {
		if(selectProduct) {
			await handleUpdateProduct(selectProduct.documentId, {
				title: title,
				main_price: mainPrice
			})
			setShowModal(false)
			toast.success('Product updated successfully!')
		}
	}
	return (
		<div>
			<Toaster/>
			<Box className="mt-0">
				<div className="flex flex-wrap -mx-2">
					{dataContent.length > 0 ? dataContent?.map((item: any) => {
						return (
								<ItemProduct
									url={`/products/${item.documentId}`}
									key={item.id}
									title={item.title}
									image_url={item.main_image ? process.env.BASE_API + item.main_image.url : "/images/noimage.png"}
									price={item.main_price ? formatRupiah(item.main_price) : formatRupiah(0)}
									rate={item.rate ? `${item.rate}` : "1"}
									sold={item.sold_count}
									location={item.region ? item.region : null}
								>
									<div className="flex gap-1 justify-end py-2">
										<button onClick={() => {
											setSelectProduct(item)
											setTitle(item.title)
											setMainPrice(item.main_price)
											setShowModal(true)
										}}>
											<FiEdit className="text-blue-500" size={18}/>
										</button>
										{/* <button onClick={() => console.log("Click button2")}>
											<FaRegTrashAlt className="text-red-500" size={18}/>
										</button> */}
									</div>
								</ItemProduct>	

						);
					}) : <div>Anda tidak memiliki produk</div>} 
				</div>
			</Box>

			<div className="flex gap-2">
			</div>

			{
				showModal && (
					<div className="w-full h-full relative">
						<div className="w-[500px] bg-[#151212] absolute -top-72 left-60 p-4 border rounded-lg">
							<div className="mb-6">
								<div className="flex justify-between mb-2">
									<h1 className="text-white font-semibold">Edit product</h1>
									<button onClick={() => setShowModal(false)}>
										<MdCancel size={25} className="text-white"/>
									</button>
								</div>
									<p className="text-[#eae4e4] font-medium leading-[18px]">Make changes to your product here. Click save when you're done.</p>
							</div>
							<form onSubmit={(e) => {e.preventDefault(); handleEdit()}}>
								<div className="flex justify-between items-center mb-2">
									<label htmlFor="title" className="text-white font-medium">Title product</label>
									<input id="title" type="text" className="border border-white rounded-lg px-2 py-2 bg-[#151212] text-white" value={title} onChange={(e) => setTitle(e.target.value)}/>
								</div>
								<div className="flex justify-between items-center mb-2">
									<label htmlFor="price" className="text-white font-medium">Harga</label>
									<input type="text" name="price" id="price" className="border border-white rounded-lg px-2 py-2 bg-[#151212] text-white" value={mainPrice} onChange={(e) => setMainPrice(Number(e.target.value))}/>
								</div>
								<button className="border-2 border-white rounded-lg py-2 w-full mt-8 text-white font-extrabold">Submit</button>
							</form>
						</div>
					</div>
				)
			}
		</div>
	);
}
