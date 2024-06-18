import Image from "next/image";

const SectionLeftItem = () => {
  return (
    <div className="flex items-center gap-6 mb-4">
      <div>
        <Image src={"/images/vendor-one.png"} width={30} height={30} alt="" />
      </div>
      <button className="border border-solid border-white p-2 rounded-lg text-white font-hind text-[16px] font-semibold hover:bg-c-green hover:border-none w-[152px] text-start">
        Pesanan
      </button>
    </div>
  );
};

const SectionLeft = () => {
  return (
    <div className="w-[321px] h-[580px] bg-c-blue">
      <h5 className="text-white text-[12px] font-hind font-medium mb-4">
        Menu Mitra
      </h5>
      <SectionLeftItem />
    </div>
  );
};

const SectionRight = () => {
  return <div className="bg-yellow-500 flex-1">SECTION RIGHT</div>;
};

const MyVendor = () => {
  return (
    <div className="flex">
      <SectionLeft />
      <SectionRight />
    </div>
  );
};

export default MyVendor;
