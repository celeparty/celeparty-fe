"use client";
import React, { Children, ReactNode } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/lib/services";
import Link from "next/link";
import ErrorNetwork from "@/components/ErrorNetwork";

function ItemSlide(props: any) {
  return (
    <div className="w-[415px] lg:w-full h-[200px] lg:h-[300px] relative  bg-gradient-to-r from-violet-600 to-indigo-600 ">
      <Link href={props.link}>
        <Image src={props.image} fill alt="image" />
      </Link>
    </div>
  );
}

const settings = {
  arrow: true,
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: false,
};

export default function MainBanner() {
  const getQuery = async () => {
    return await getData("/banners");
  };
  const query = useQuery({
    queryKey: ["banner"],
    queryFn: getQuery,
  });

  if (query.isLoading) {
    return (
      <div className=" relative flex justify-center ">
        <div className="animate-pulse w-full">
          <div className="rounded-sm bg-slate-200 h-[300px] w-full "></div>
        </div>
      </div>
    );
  }

  if (query.isError) {
    return <ErrorNetwork />;
  }
  const dataContent = query?.data?.data.data;

  return (
    <div className="mainslider rounded-lg w-full overflow-hidden relative">
      <Slider {...settings}>
        {dataContent?.map((item: any) => (
          <ItemSlide
            key={item.id}
            link={item.target_url}
            image={item.image_url}
          />
        ))}
      </Slider>
    </div>
  );
}
