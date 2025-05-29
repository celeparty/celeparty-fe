"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { whatsAppNumber } from "@/lib/appSettings";
import { axiosData } from "@/lib/services";
import { formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FcHighPriority } from "react-icons/fc";
import SideBar from "./SideBar";

export default function ContentProduct(props: any) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );

  const getQuery = async () => {
    return await axiosData("GET", `/api/products/${props.slug}?populate=*`);
  };
  const query = useQuery({
    queryKey: ["qProductDetail"],
    queryFn: getQuery,
  });

  const dataContent = query?.data?.data;
  const [currentPrice, setCurrentPrice] = useState(dataContent?.main_price);

  useEffect(() => {
    setCurrentPrice(dataContent?.main_price);
  }, []);
  if (query.isLoading) {
    return (
      <div className="mt-[80px]">
        <div className="wrapper">
          <Skeleton height="300px" width="100%" />
        </div>
      </div>
    );
  }
  if (query.isError) {
    return <ErrorNetwork />;
  }
  const currentRate = dataContent?.rate;

  return (
    <Box className="px-4">
      {dataContent ? (
        <div className="relative flex lg:flex-row flex-col justify-between gap-11 [&_h4]:mb-2 [&_h4]:text-[18px] [&_h4]:font-medium">
          <div className="flex lg:flex-row flex-col gap-9 justify-between items-start">
            <div className="relative imageproduct min-w-[350px] w-[350px] h-[350px] flex justify-center lg:block">
              <div className="relative lg:min-w-[350px] lg:w-[350px] lg:h-[350px] w-[320px] h-[320px]">
                <Image
                  src={
                    dataContent.main_image
                      ? process.env.BASE_API + dataContent.main_image.url
                      : "/images/no-image.png"
                  }
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="relative gap-1">
              <h5 className="font-hint text-[20px] lg:text-sm mb-2 font-medium text-black lg:text-c-gray-text2">
                {dataContent?.category
                  ? dataContent?.category.title
                  : "Kategory Tidak Tersedia"}
              </h5>
              <h1 className="text-[26px] font-hind font-bold">
                {dataContent?.title
                  ? dataContent.title
                  : "Produk Tidak Tersedia"}{" "}
              </h1>
              <h4 className="text-[20px] text-c-orange font-bold">
                {currentPrice > 0
                  ? formatRupiah(currentPrice)
                  : formatRupiah(dataContent.main_price)}
              </h4>
              <div className="flex gap-1 items-center">
                <div className="rate flex gap-">
                  {[1, 2, 3, 4, 5].map((item) => {
                    return (
                      <FaStar
                        key={item}
                        className={
                          item <= currentRate
                            ? "text-[#FDD835]"
                            : "text-gray-300"
                        }
                      />
                    );
                  })}
                </div>
                <div>{dataContent?.average_rating}</div>
              </div>
              {dataContent?.variant.length > 0 && (
                <div className="relative text-[18px] lg:mt-5 mt-[10px]">
                  <h4>Varian</h4>
                  <div className="variant flex flex-wrap gap-2 ">
                    {dataContent?.variant?.map((variant: any) => {
                      const isSelected = selectedVariantId === variant.id;
                      return (
                        <div
                          key={variant.id}
                          className={` border-[#000000] border-solid border-[1px] rounded-[10px] px-2 py-1 text-[14px] cursor-pointer hover:bg-c-green hover:text-white hover:border-c-green ${
                            isSelected
                              ? "bg-c-green text-white border-c-green"
                              : "bg-white"
                          }`}
                          onClick={() => {
                            setCurrentPrice(variant.price);
                            setSelectedVariantId(variant.id);
                          }}
                        >
                          {variant?.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="lg:mt-5 mt-[10px] text-[12px]">
                <h4>Deskripsi</h4>
                <div className="line-clamp-2">
                  {dataContent?.description ? (
                    parse(`${dataContent?.description}`)
                  ) : (
                    <>Deskripsi Tidak Tersedia</>
                  )}
                </div>
                <div className="wa-button mt-4 mb-4">
                  <Button
                    onClick={() => {
                      const phone = whatsAppNumber;
                      const message = encodeURIComponent(
                        `Saya ingin bertanya mengenai produk ini ${dataContent?.title}`
                      );
                      const url = `https://wa.me/${phone}?text=${message}`;
                      window.open(url, "_blank");
                    }}
                    variant={"green"}
                  >
                    <Image
                      src="/images/icon-wa.svg"
                      alt="image"
                      width={24}
                      height={27}
                    />
                    &nbsp;Tanyakan Produk
                  </Button>
                </div>
                <div className="payment-rule border-c-gray border rounded-md p-4">
                  <p className="font-bold text-md">Aturan Pembayaran:</p>
                  <ol className="py-2">
                    <li>1. 30% Down Payment, untuk book tanggal acara</li>
                    <li>2. 100%, maximum H-1 tanggal loading</li>
                  </ol>
                  <p className="italic">
                    Jika sampai H-1 tanggal loading pembayaran belum mencapai
                    100%, sisa dana akan dikembalikan ke User, kecuali dana yang
                    sudah masuk Down Payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="right min-w-[275px] sticky top-0 ">
            <SideBar
              dataProducts={dataContent}
              currentPrice={
                currentPrice > 0 ? currentPrice : dataContent?.main_price
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-1 items-center text-2xl py-20">
          <FcHighPriority /> Produk tidak tersedia
        </div>
      )}
    </Box>
  );
}
