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
import { formatRupiah } from "@/lib/utils";
import { useUser } from "@/lib/store/user";
import axios from "axios";
import { useLocalStorage } from "@/lib/hook/useLocalStorage";
import ModalEdit from "@/components/product/ModalEdit";
interface iItemStatus {
	status: string;
	value: number | string;
	color: string;
}

interface iProducts {
	id: number,
        documentId: string,
        title: string,
        minimal_order: number,
        minimal_order_date: string,
        createdAt: string,
        updatedAt: string,
        publishedAt: string,
        description: string,
        main_price: number,
        rate: number,
        kabupaten: string,
        region: string,
        price_min: number,
        price_max: number,
        sold_count: number
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
	const { data: session, status } = useSession();
	const [myData, setMyData] = useState<iProducts[]>([]);
	const [selectProduct, setSelectProduct] = useState<any>(null)
	const [showModalEdit, setShowModalEdit] = useState<boolean>(false)
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

	const handleDeleteProduct = async (documentId: string): Promise<void> => {
		try {
			const response = await fetch(`${process.env.BASE_API}/api/products/${documentId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				}
			})
			if (!response.ok) throw new Error("Failed to delete products")
			setMyData((prev: iProducts[]) => prev.filter((item) => item.documentId !== documentId))
		} catch(error: unknown) {
			console.log(error)
		}
	}

	const handleEditProduct = (documentId: string): void => {
		const product = myData.find((item) => item.documentId === documentId)
		setSelectProduct(product)
		setShowModalEdit(true)
	}

	const handleUpdateProduct = async (updatedProduct: any): Promise<void> => {
		try {
		  const response = await fetch(`${process.env.BASE_API}/api/products/${updatedProduct.documentId}`, {
			method: "PUT",
			headers: {
			  "Content-Type": "application/json",
			},
			body: JSON.stringify(updatedProduct),
		  });
		  if (!response.ok) throw new Error(`Gagal memperbarui produk: ${response.statusText}`);
	  
		  setMyData((prev) =>
			prev.map((item) =>
			  item.documentId === updatedProduct.documentId ? updatedProduct : item
			)
		  );
		  alert("Produk berhasil diperbarui");
		  setShowModalEdit(false);
		} catch (error: unknown) {
		  console.error("Error saat memperbarui produk:", error);
		  alert("Terjadi kesalahan saat memperbarui produk.");
		}
	  };
	  

	return (
		<div>
			<Box className="mt-0">
				<div className="flex flex-wrap -mx-2">
					{dataContent.length > 0 ? dataContent?.map((item: any) => {
						return (
								<ItemProduct
									url={`/products/${item.documentId}`}
									documentId={item.documentId}
									key={item.id}
									title={item.title}
									image_url={item.main_image ? process.env.BASE_API + item.main_image.url : "/images/noimage.png"}
									price={item.main_price ? formatRupiah(item.main_price) : formatRupiah(0)}
									rate={item.rate ? `${item.rate}` : "1"}
									sold={item.sold_count}
									location={item.region ? item.region : null}
									onDelete={handleDeleteProduct}
									onEdit={handleEditProduct}
								></ItemProduct>

						);
					}) : <div>Anda tidak memiliki produk</div>} 
				</div>
			</Box>

			{showModalEdit && selectProduct && (
      			<ModalEdit 
        			product={selectProduct} 
        			onClose={() => setShowModalEdit(false)} 
        			onSave={handleUpdateProduct} 
      			/>
    			)}
		</div>
	);
}
