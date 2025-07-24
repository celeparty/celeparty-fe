"use client";

interface iItemStatus {
  status: string;
  value: number | string;
  color: string;
}

function ItemStatus({ status, value, color }: iItemStatus): JSX.Element {
  return (
    <div
      className={`py-3 px-5 text-center rounded-lg text-white min-w-[160px] text-sm sm:text-base`}
      style={{ backgroundColor: `${color}` }}
    >
      <h4 className="text-xs sm:text-sm">{status}</h4>
      <strong className="text-base sm:text-lg">{value}</strong>
    </div>
  );
}
export default function HomeMitra() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-center items-center lg:mt-7">
      <ItemStatus status="PENDING" value={1} color="#3E2882" />
      <ItemStatus status="PROCESS" value={1} color="#56C200" />
      <ItemStatus status="CANCEL" value={1} color="#F60E0E" />
      <ItemStatus status="INCOME" value="Rp. 1.000.000" color="#44CADC" />
    </div>
  );
}
