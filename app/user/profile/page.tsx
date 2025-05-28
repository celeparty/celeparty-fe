"use client";

import React from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileImageForm } from "@/components/profile/profile-image-form";

interface NotificationItem {
  title: string;
  description: string;
}

const TableStatus = () => {
  return (
    <div className="mt-20 lg:h-[400px] h-auto overflow-x-auto">
      <h1 className="font-hind font-semibold text-[16px] text-black mb-6">
        Status Pembelian
      </h1>
      <table className="min-w-full bg-white border-b-2 border-gray-200">
        <thead className="">
          <tr>
            <th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Order ID
            </th>
            <th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Item
            </th>
            <th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Status
            </th>
            <th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Total
            </th>
            <th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Vendor
            </th>
          </tr>
        </thead>
        <tbody className="[&_td]:text-start [&_td]:font-normal [&_td]:lg:text-[10px] [&_td]:text-[12px] [&_td]:font-hind [&_td]:text-[#3C3C3C] [&_td]:border-b-4">
          <tr>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              2023/01/24/1
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Pending
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Rp. 220.000
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              ABC Cakes
            </td>
          </tr>
          <tr>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              2023/01/24/2
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Processing
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Rp. 220.000
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              ABC Cakes
            </td>
          </tr>
          <tr>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              2023/01/24/3
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Shipping
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              Rp. 220.000
            </td>
            <td className="lg:px-6 px-4 py-4 border-b border-gray-200">
              ABC Cakes
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

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
        {/* <Notification /> */}
        <TableStatus />
      </div>
    </div>
  );
};

export default ProfilePage;
