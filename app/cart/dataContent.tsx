"use client";
import Box from "@/components/Box";
import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/store/cart";
import Image from "next/image";
import { formatRupiah } from "@/lib/utils";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaMinus, FaPlus } from "react-icons/fa";
import { PiSmileySadDuotone } from "react-icons/pi";
import axios from "axios";
import { useSession } from "next-auth/react";

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

  // State untuk form checkout
  const [form, setForm] = useState({
    event_date: "",
    shipping_location: "",
    loading_date: "",
    loading_time: "",
    customer_name: "",
    telp: "",
    variant: "",
  });
  const [formError, setFormError] = useState("");

  // State untuk edit quantity dan catatan
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editNote, setEditNote] = useState("");

  const { data: session } = useSession();
  const userTelp = session?.user?.phone || "-";
  const userEmail = session?.user?.email || "";

  // Sinkronkan telp di cart dengan session.user.phone
  useEffect(() => {
    if (userTelp && userTelp !== "-") {
      const updatedCart = cart.map((item: any) => ({ ...item, telp: userTelp }));
      setCart(updatedCart);
    }
    // eslint-disable-next-line
  }, [userTelp]);

  // Validasi cart, cek userTelp bukan item.telp
  const isCartValid = cart.length > 0 && cart.every((item: any) =>
    item.event_date &&
    item.shipping_location &&
    item.loading_date &&
    item.loading_time &&
    item.customer_name &&
    userTelp &&
    item.variant
  );


  // Hapus form input checkout, ganti dengan tampilan readonly hasil inputan user
  // Di bagian Ringkasan Belanja, tampilkan data dari cart[0] (asumsi semua produk di cart punya data yang sama)
  {cart.length > 0 && (
    <div className="mb-4 p-3 border rounded bg-gray-50">
      <div className="mb-1"><b>Nama Pemesan:</b> {cart[0]?.customer_name || '-'}</div>
      <div className="mb-1"><b>No. Telepon:</b> {cart[0]?.telp || '-1'}</div>
      <div className="mb-1"><b>Alamat Pengiriman:</b> {cart[0]?.shipping_location || '-'}</div>
      <div className="mb-1"><b>Tanggal Acara:</b> {cart[0]?.event_date || '-'}</div>
      <div className="mb-1"><b>Tanggal Loading:</b> {cart[0]?.loading_date || '-'}</div>
      <div className="mb-1"><b>Jam Loading:</b> {cart[0]?.loading_time || '-'}</div>
      <div className="mb-1"><b>Varian Produk:</b> {cart[0]?.variant || '-'}</div>
    </div>
  )}

  // Ringkasan data inputan user di cart (readonly, untuk semua produk)
  {cart.length > 0 && (
    <>
      {cart.map((item: any, idx: number) => (
        <div key={item.product_id || idx} className="mb-6 border-b pb-4 last:border-b-0 last:pb-0 flex gap-4">
          <div className="w-[100px] h-[100px] relative">
            <Image
              src={item.image ? item.image : "/images/noimage.png"}
              alt="image"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="mb-1"><b>Produk:</b> {item.product_name}</div>
            <div className="mb-1"><b>Nama Pemesan:</b> {item.customer_name || '-'}</div>
            <div className="mb-1"><b>No. Telepon:</b> {userTelp}</div>
            <div className="mb-1"><b>Varian Produk:</b> {item.variant || '-'}</div>
            <div className="mb-1"><b>Detail Alamat:</b> {item.shipping_location || '-'}</div>
            <div className="mb-1"><b>Tanggal Acara:</b> {item.event_date || '-'}</div>
            <div className="mb-1"><b>Tanggal Loading:</b> {item.loading_date || '-'}</div>
            <div className="mb-1"><b>Jam Loading:</b> {item.loading_time || '-'}</div>
            <div className="mb-1 flex items-center gap-2">
              <b>Jumlah:</b>
              <input
                type="number"
                min={1}
                className="border rounded p-1 w-16"
                value={item.quantity}
                onChange={e => {
                  const updatedCart = cart.map((it: any, i: number) => i === idx ? { ...it, quantity: Number(e.target.value) } : it);
                  setCart(updatedCart);
                }}
              />
            </div>
            <div className="mb-1">
              <b>Catatan:</b>
              <textarea
                className="border rounded p-1 w-full"
                value={item.note || ''}
                onChange={e => {
                  const updatedCart = cart.map((it: any, i: number) => i === idx ? { ...it, note: e.target.value } : it);
                  setCart(updatedCart);
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  )}

  // Fungsi update cart item
  const handleSaveEdit = (idx: number) => {
    const updatedCart = cart.map((item: any, i: number) => {
      if (i === idx) {
        return { ...item, quantity: editQuantity, note: editNote };
      }
      return item;
    });
    setCart(updatedCart);
    setEditIndex(null);
  };

  const handleCheckout = async () => {
    if (!isCartValid) {
      alert("Data transaksi belum lengkap. Silakan lengkapi di halaman produk.");
      return;
    }
    // Gabungkan field yang bisa berbeda antar produk
    const variants = cart.map((item: any) => item.variant).join(",");
    const quantities = cart.map((item: any) => item.quantity).join(",");
    const notes = cart.map((item: any) => item.note).join("; ");
    // Ambil field yang sama dari produk pertama
    const c = cart[0] || {};
    try {
      // Kirim email customer ke backend payment
      const response = await axios.post(`/api/payment`, {
        email: userEmail,
        items: data
      });
      const token = response.data.token;
      const order_id = response.data.order_id;
      window.snap.pay(token, {
        onSuccess: async function(result: any) {
          try {
            // Siapkan payload transaksi ke Strapi
            const transactionPayload = {
              products: cart.map((item: any) => ({ id: item.product_id, title: item.product_name })),
              payment_status: "paid",
              variant: variants,
              quantity: quantities,
              shipping_location: c.shipping_location,
              event_date: c.event_date,
              loading_date: c.loading_date,
              loading_time: c.loading_time,
              customer_name: c.customer_name,
              telp: userTelp,
              note: notes,
              email: userEmail,
              order_id: order_id,
              event_type: c.user_event_type, // Tambahan field event_type
            };
            const strapiRes = await axios.post(
              "/api/transaction-proxy",
              { data: transactionPayload }
            );
            sessionStorage.setItem(
              "transaction_summary",
              JSON.stringify({
                orderId: strapiRes.data.data.id,
                products: cart,
                total: calculateTotal(),
                ...c,
                order_id: order_id,
                email: userEmail,
              })
            );
            setCart([]);
            window.location.href = "/cart/success";
          } catch (err: any) {
            let msg = "Transaksi berhasil di Midtrans, tapi gagal mencatat ke sistem (Strapi). Silakan hubungi admin.";
            if (err.response && err.response.data && err.response.data.error) {
              msg += "\n" + JSON.stringify(err.response.data.error, null, 2);
            }
            console.error('Error POST ke Strapi:', err);
            alert(msg);
          }
        },
        onError: function(error: any) {
          console.error('Error pembayaran Midtrans:', error);
          alert("Pembayaran gagal di Midtrans. Silakan coba lagi.");
        },
        onClose: function() {
          // User menutup popup pembayaran
          console.log('Popup Midtrans ditutup user');
        },
      });
    } catch (error) {
      console.error('Error request ke /api/payment:', error);
      alert("Gagal memproses pembayaran. Silakan coba lagi.");
    }
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

                  <div className="mt-2">
                  {cart.map((item: any, idx: number) => (
                    <div key={item.product_id || idx} className="mb-3 border-b pb-2 last:border-b-0 last:pb-0">
                      <div className="mb-1"><b>Produk:</b> {item.product_name}</div>
                      <div className="mb-1"><b>Nama Pemesan:</b> {item.customer_name || '-'}</div>
                      <div className="mb-1"><b>No. Telepon:</b> {userTelp}</div>
                      <div className="mb-1"><b>Varian Produk:</b> {item.variant || '-'}</div>
                      <div className="mb-1"><b>Detail Alamat:</b> {item.shipping_location || '-'}</div>
                      <div className="mb-1"><b>Tanggal Acara:</b> {item.event_date || '-'}</div>
                      <div className="mb-1"><b>Tanggal Loading:</b> {item.loading_date || '-'}</div>
                      <div className="mb-1"><b>Jam Loading:</b> {item.loading_time || '-'}</div>
                    </div>
                  ))}

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
                {/* Ringkasan data inputan user di cart (readonly, untuk semua produk) */}
                <div className="mb-4 p-3 border rounded bg-gray-50">
                  {/* Total Belanja */}
                  <div className="flex font-bold justify-between text-[16px] mt-2 w-full  pt-2">
                    <div className="">Total Harga</div>
                    <div className="text-c-orange">{formatRupiah(calculateTotal())}</div>
                  </div>
                </div>
                {/* Tombol pembayaran aktif jika semua produk di cart sudah lengkap */}
                <div
                  className={`bg-c-green text-white text-center py-3 mt-5 rounded-lg cursor-pointer ${!isCartValid ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={!isCartValid ? undefined : handleCheckout}
                >
                  Pembayaran
                </div>
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
