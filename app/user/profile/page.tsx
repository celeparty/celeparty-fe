"use client";

import React from "react";

import Basecontent from "@/components/Basecontent";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileImageForm } from "@/components/profile/profile-image-form";
import { UserTransactionTable } from "@/components/profile/UserTransactionTable";

interface NotificationItem {
  title: string;
  description: string;
}

const NotificationItem: React.FC<NotificationItem> = ({
  title,
  description,
}) => {
  return (
    <div className="">
      <h3 className="font-hind font-semibold text-[15px] lg:text-[12px] text-black leading-[20px]">
        {title}
      </h3>
      <p className="font-hind font-normal text-[13px] lg:text-[10px] leading-[15px] text-[#3C3C3C]">
        {description}
      </p>
    </div>
  );
};

const Notification = () => {
  return (
    <div className="mt-12">
      <h1 className="lg:text-[16px] text-[20px] my-4 leading-[26px] font-hind text-black font-semibold">
        Notifikasi
      </h1>
      <div className="flex flex-col gap-4">
        <NotificationItem
          title="Rating untuk Mitra kami"
          description="Terimakasih sudah mempercayakan mitra kami untuk acara anda, mohon berikan penilaian untuk meningkatakan kualitas pelayanan mitra kami."
        />
        <NotificationItem
          title="Pesanan Anda sudah closed?"
          description="Terimakasih sudah mempercayakan kami untuk acara anda. Mohon konfirmasi penyelesaian pesanan anda."
        />
        <NotificationItem
          title="Pembayaranmu terverifikasi"
          description="Selamat pembayaran anda sudah terverifikasi, Mitra kami akan segera memproses pesanan anda."
        />
      </div>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <Basecontent>
      <div className="wrapper my-10">
        <div className="px-10 lg:py-6 py-2 lg:border-2 lg:border-gray-300 bg-[#F2F2F2] lg:rounded-lg lg:shadow-xl">
          <h1 className="text-[20px] lg:text-[16px] text-center lg:text-start my-4 leading-[26px] font-hind text-black font-semibold">
            Biodata Diri
          </h1>
          <div className="flex lg:flex-row flex-col lg:gap-24 gap-16">
            <div className="w-[300px] mx-auto lg:mx-0">
              <ProfileImageForm />
            </div>
            <div className="w-fit">
              <ProfileForm />
            </div>
          </div>
          <div className="mt-20 lg:h-[400px] h-auto overflow-x-auto">
            <h1 className="font-hind font-semibold text-[16px] text-black mb-6">
              Status Pembelian
            </h1>
            <UserTransactionTable isVendor={false} />
          </div>
        </div>
      </div>
    </Basecontent>
  );
};

export default ProfilePage;
