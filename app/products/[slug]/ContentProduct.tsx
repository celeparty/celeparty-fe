"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { whatsAppNumber } from "@/lib/appSettings";
import { axiosData } from "@/lib/services";
import { formatRupiah } from "@/lib/utils";
import { formatTimeWithWIB } from "@/lib/dateFormatIndonesia";
import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FcHighPriority } from "react-icons/fc";
import SideBar from "./SideBar";
import { ProductImageSlider } from "@/components/product/ProductImageSlider";
import { getLowestVariantPrice } from "@/lib/productUtils";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ContentProduct(props: any) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [imgUrls, setImgUrls] = useState<string[]>([]);
  const isTicket = props.type === 'ticket';

  const getQuery = async () => {
    const endpoint = isTicket 
      ? `/api/tickets/${props.slug}?populate=*` 
      : `/api/products/${props.slug}?populate=*`;
    return await axiosData("GET", endpoint);
  };
  const query = useQuery({
    queryKey: ["qProductDetail", props.slug, props.type],
    queryFn: getQuery,
  });

  const dataContent = query?.data?.data;
  const [variantPrice, setVariantPrice] = useState(
    dataContent?.variant[0]?.price
  );

  useEffect(() => {
    if (query.isSuccess) {
      const { variant } = dataContent;
      const lowestPrice = getLowestVariantPrice(variant);
      if (lowestPrice) {
        setVariantPrice(lowestPrice);
      }
    }
  }, [dataContent]);

  const populateImageUrls = () => {
    let urls: string[] = [];
    if (dataContent) {
      const { main_image } = dataContent;
      main_image.forEach((element: any) => {
        if (element.url) {
          urls.push(element.url);
        }
      });
    }

    setImgUrls(urls);
  };

  useEffect(() => {
    populateImageUrls();
  }, [dataContent]);

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

  const askProduct = () => {
    const phone = whatsAppNumber;
    const message = encodeURIComponent(
      `Saya ingin bertanya mengenai produk ini ${dataContent?.title} ${window.location.href}`
    );
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <Box className="px-4">
      {dataContent ? (
        <div className="relative flex lg:flex-row flex-col justify-between gap-11 [&_h4]:mb-2 [&_h4]:text-[18px] [&_h4]:font-medium">
          <div className="flex lg:flex-row flex-col gap-9 justify-between items-start">
            <div className="relative imageProduct lg:min-w-[350px] lg:w-[350px] lg:h-[350px] w-[320px] h-[320px]">
              <ProductImageSlider urls={imgUrls}></ProductImageSlider>
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
                {dataContent?.variant &&
                dataContent.variant.length > 0 &&
                variantPrice > 0
                  ? formatRupiah(variantPrice)
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

              {dataContent?.variant.length > 1 && (
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
                            setVariantPrice(variant.price);
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
              {dataContent?.event_date && (
                <div className="lg:mt-5 mt-[10px] border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold mb-2 text-c-blue">ℹ️ Informasi Acara</h4>
                  <div className="space-y-1 text-sm">
                    <div><b>Tanggal Acara:</b> {dataContent?.event_date}</div>
                    {dataContent?.waktu_event && <div><b>Jam Acara:</b> {formatTimeWithWIB(dataContent?.waktu_event)}</div>}
                    {dataContent?.end_date && dataContent.end_date !== dataContent.event_date && (
                      <div><b>Tanggal Selesai:</b> {dataContent?.end_date}</div>
                    )}
                    {dataContent?.end_time && <div><b>Jam Selesai:</b> {formatTimeWithWIB(dataContent?.end_time)}</div>}
                    {dataContent?.kota_event && <div><b>Kota Acara:</b> {dataContent?.kota_event}</div>}
                    {dataContent?.lokasi_event && <div><b>Lokasi Acara:</b> {dataContent?.lokasi_event}</div>}
                  </div>
                </div>
              )}
              <div className="lg:mt-5 mt-[10px] text-[12px]">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList>
                    <TabsTrigger value="description">Deskripsi</TabsTrigger>
                    <TabsTrigger value="terms_conditions">Terms and Conditions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="whitespace-pre-line">
                    {dataContent?.description ? (
                      parse(`${dataContent?.description}`)
                    ) : (
                      <>Deskripsi Tidak Tersedia</>
                    )}
                  </TabsContent>
                  <TabsContent value="terms_conditions" className="whitespace-pre-line">
                    {dataContent?.terms_conditions ? (
                      parse(`${dataContent?.terms_conditions}`)
                    ) : (
                      <>Tidak ada Terms and Conditions</>
                    )}
                  </TabsContent>
                </Tabs>
                <div className="wa-button mt-4 mb-4">
                  <Button
                    onClick={() => {
                      askProduct();
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
                {dataContent.escrow && (
                  <>
                    <div className="payment-rule border-c-gray border rounded-md p-4">
                      <p className="font-bold text-md">Aturan Pembayaran:</p>
                      <ol className="py-2">
                        <li>1. 30% Down Payment, untuk book tanggal acara</li>
                        <li>2. 100%, maximum H-1 tanggal loading</li>
                      </ol>
                      <p className="italic">
                        Jika sampai H-1 tanggal loading pembayaran belum
                        mencapai 100%, sisa dana akan dikembalikan ke User,
                        kecuali dana yang sudah masuk Down Payment.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="right min-w-[275px] sticky top-0 ">
            <SideBar
              dataProducts={dataContent}
              currentPrice={
                variantPrice > 0 ? variantPrice : dataContent?.main_price
              }
              selectedVariantId={selectedVariantId}
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
