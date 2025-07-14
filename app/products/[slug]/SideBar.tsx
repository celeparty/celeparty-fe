"use client";
import { useCart, useNotif } from "@/lib/store/cart";
import { useTransaction } from "@/lib/store/transaction";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export const Notification = () => {
  const { statusNotif, message } = useNotif();

  return (
    statusNotif && (
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="wrapper-big">
          <div className=" bg-c-blue text-center text-white p-4 rounded-md shadow-md mt-1">
            {message}
          </div>
        </div>
      </div>
    )
  );
};

export default function SideBar({ dataProducts, currentPrice }: any) {
  const [value, setValue] = useState(0);
  const [note, setNote] = useState("");
  const { data: session, status } = useSession();
  const { cart, setCart }: any = useCart();
  const { transaction }: any = useTransaction();
  const notifCart = useNotif((state) => state.notifCart);

  const addCart = () => {
    notifCart(`${dataProducts.title} berhasil dimasukan ke keranjang`);
    setCart([
      {
        ...cart,
        product_id: dataProducts.id,
        product_name: dataProducts.title,
        price: currentPrice,
        image: dataProducts.main_image[0].url,
        quantity: value,
        transaction_id: transaction.id,
        note: note,
      },
    ]);
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-solid border-[1px] border-gray-100 -mt-6 lg:-mt-0">
      {status === "authenticated" ? (
        <>
          <h4 className="font-bold lg:font-normal">
            Atur Jumlah dan Detail Pengiriman
          </h4>
          <div className="relative lg:mt-5 mt-[10px]">
            <label className="mb-1 block">Jumlah</label>
            <div className=" border-solid w-auto inline-block border-[1px] rounded-lg border-c-gray">
              <div className="flex items-center gap-2">
                <div
                  className="cursor-pointer p-3 hover:text-green-300"
                  onClick={() => {
                    value > 0 && setValue(value - 1);
                  }}
                >
                  <FaMinus />
                </div>
                <div>{value}</div>
                <div
                  className="cursor-pointer p-3 hover:text-green-300"
                  onClick={() => {
                    setValue(value + 1);
                  }}
                >
                  <FaPlus />
                </div>
              </div>
            </div>
          </div>
          <div className="relative lg:mt-5 mt-[10px]">
            <div>Minimal Order : 1 </div>
            <div>Waktu Pemesanan : 2 Hari </div>
            <label className="mb-1 block text-black mt-3">Tambah Catatan</label>
            <textarea
              className="w-full h-[100px] border-solid border-[1px] rounded-lg border-c-gray p-3"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="text-center mx-auto w-full lg:max-w-[150px]">
            <input
              type="button"
              disabled={value >= 1 ? false : true}
              value="+ Keranjang"
              className={`${
                value >= 1
                  ? "bg-c-green cursor-pointer"
                  : "bg-c-gray-text2 opacity-30 cursor-default"
              }  mt-5 text-white text-[15px] py-3 w-full rounded-lg `}
              onClick={addCart}
            />
          </div>
        </>
      ) : (
        <div>
          <h4>Silahkan Login Terlebih Dahulu</h4>
          <div className="h-14">
            <Link
              href="/auth/login"
              className="btnline justify-center items-start inline-flex"
            >
              <div className="py-1">Masuk</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
