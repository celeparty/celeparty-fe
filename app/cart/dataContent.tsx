"use client";
import Box from "@/components/Box";
import React, { useState } from "react";
import { useCart } from "@/lib/store/cart";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaMinus, FaPlus } from "react-icons/fa";
import { PiSmileySadDuotone } from "react-icons/pi";
import axios from "axios";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CartContent() {
  const {
    cart,
    setCart,
    updateQuantity,
    updateNote,
    deleteItem,
    calculateTotal,
  }: any = useCart();
  const [value, setValue] = useState(0);
  const data = cart.map((item: any) => {
    return {
      id: item.product_id,
      name: item.product_name,
      image: item.main_image
        ? process.env.BASE_API + item.main_image[0].url
        : "/images/noimage.png",
      price: parseInt(item.price),
      quantity: item.quantity,
      note: item.note,
      totalPriceItem: item.price * item.quantity,
    };
  });

  const handleCheckout = async () => {
    const response = await axios
      .post(`/api/payment`, data)
      .then((res) => {
        return res.data.token;
      })
      .catch((error) => {
        console.log(error);
      });
    window.snap.pay(response);
  };

  return (
    <div className="wrapper">
      {cart.length > 0 ? (
        <div className="flex lg:flex-row flex-col lg:gap-5 gap-2">
          <div className="lg:w-8/12 w-full">
            {cart.map((item: any, index: number) => {
              return (
                <Box
                  className="lg:mb-7 mb-3"
                  title={item.product_name}
                  key={index}
                >
                  <div className="flex w-full">
                    <div className="w-[100px] h-[100px] relative">
                      <Image
                        src={
                          item.image
                            ? process.env.BASE_API + item.image
                            : "/images/noimage.png"
                        }
                        alt="image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-5 flex-1">
                      <div className="flex gap-1">
                        <div className="font-bold">Price: </div>{" "}
                        {formatRupiah(item.price)}
                      </div>
                      <div className="flex gap-1">
                        <div className="font-bold">Quantity: </div>{" "}
                        {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:gap-7 gap-3 mt-2 lg:mt-0">
                    <div className="flex-1">
                      <h5 className="mb-2 lg:mb-0 font-bold py-2">Catatan</h5>
                      <textarea
                        className="w-full border-[1px] border-c-gray rounded-lg p-2"
                        value={item.note}
                        onChange={(e) =>
                          updateNote(item.product_id, e.target.value)
                        }
                      />
                    </div>
                    <div className="relative flex lg:gap-5 gap-2 items-start lg:py-4 pt-[28px]">
                      <div className="flex flex-col items-center justify-center gap-1 order-2 lg:order-1 mt-[8px] font-extrabold lg:font-normal text-red-500 lg:text-gray-500 lg:border-none border border-black rounded-lg px-2 py-1 lg:px-2 lg:py-1">
                        Hapus{" "}
                        <RiDeleteBin6Fill
                          className="text-[#DA7E01] cursor-pointer text-2xl"
                          onClick={() => deleteItem(item.product_id)}
                        />
                      </div>
                      <div className="flex flex-col lg:items-center items-start lg:justify-center justify-start gap-1 order-1 lg:order-2">
                        <h3 className="font-extrabold lg:font-normal">
                          Jumlah
                        </h3>
                        <div className="flex items-center gap-2 border border-c-gray rounded-lg">
                          <div
                            className="cursor-pointer p-3 hover:text-green-300"
                            onClick={() => {
                              if (item.quantity > 0) {
                                updateQuantity(
                                  item.product_id,
                                  item.quantity - 1
                                );
                              }
                            }}
                          >
                            <FaMinus />
                          </div>
                          <div>{item.quantity}</div>
                          <div
                            className="cursor-pointer p-3 hover:text-green-300"
                            onClick={() => {
                              updateQuantity(
                                item.product_id,
                                item.quantity + 1
                              );
                            }}
                          >
                            <FaPlus />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Box>
              );
            })}
          </div>
          <div className="lg:w-4/12 w-full">
            <Box className="mb-7">
              <div className="w-full">
                <h4 className="text-lg text-black mb-2">Ringkasan Belanja</h4>
                {cart.map((item: any, index: number) => {
                  return (
                    <div
                      className="flex justify-between text-[14px] w-full"
                      key={index}
                    >
                      <div>
                        {item.product_name}{" "}
                        <span className="text-[12px] opacity-70">
                          @{item.quantity}
                        </span>
                      </div>
                      <div>{formatRupiah(item.price)}</div>
                    </div>
                  );
                })}
                <div className="flex font-bold justify-between text-[16px] mt-2 w-full">
                  <div className="">Total Harga</div>
                  <div className="text-c-orange">
                    {formatRupiah(calculateTotal())}
                  </div>
                </div>
              </div>
              <div
                className="bg-c-green text-white text-center py-3 mt-5 rounded-lg cursor-pointer"
                onClick={handleCheckout}
              >
                Pembayaran
              </div>
            </Box>
          </div>
        </div>
      ) : (
        <Box className="mb-7 flex gap-1 items-center justify-center text-2xl">
          <div>Keranjang Belanja Kosong</div>
          <PiSmileySadDuotone />
        </Box>
      )}
    </div>
  );
}
