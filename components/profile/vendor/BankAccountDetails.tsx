import React from "react";

interface iBankAccountProps {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const BankAccountDetails: React.FC<iBankAccountProps> = ({
  accountName,
  accountNumber,
  bankName,
}) => {
  return (
    <>
      <div className="[&_label]:min-w-[220px]">
        <h4 className="text-black text-[14px] lg:text-[17px] font-extrabold">
          Informasi Rekening
        </h4>
        <div className="flex">
          <label className="text-[14px] lg:text-[16px] text-black">
            Nama Bank
          </label>
          <div className="text-[14px] lg:text-[16px] text-black uppercase">
            {bankName}
          </div>
        </div>
        <div className="flex py-1">
          <label className="text-[14px] lg:text-[16px] text-black">
            Nomor Rekening
          </label>
          <div className="text-[14px] lg:text-[16px] text-black capitalize">
            {accountNumber}
          </div>
        </div>
        <div className="flex">
          <label className="text-[14px] lg:text-[16px] text-black">
            Nama Pemilik Rekening
          </label>
          <div className="text-[14px] lg:text-[16px] text-black capitalize">
            {accountName}
          </div>
        </div>
      </div>
    </>
  );
};
