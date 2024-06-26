import Image from "next/image";

type Props = {
  img: string;
  title: string;
};

const SectionLeftItem = ({ img, title }: Props) => {
  return (
    <div className="flex items-center gap-6 mb-4">
      <div>
        <Image src={img} width={30} height={30} alt="" />
      </div>
      <button className="border border-solid border-white p-2 rounded-lg text-white font-hind text-[16px] font-semibold hover:bg-c-green hover:border-none w-[152px] text-start border-box">
        {title}
      </button>
    </div>
  );
};

const SectionLeft = () => {
  return (
    <div className="w-[321px] h-[580px] px-8 py-5 bg-c-blue">
      <h5 className="text-white text-[16px] font-hind font-medium mb-4">
        Menu Mitra
      </h5>
      <SectionLeftItem img="/images/vendor-one.png" title="Pesanan" />
      <SectionLeftItem img="/images/vector-two.png" title="Produk Saya" />
      <SectionLeftItem img="/images/vendor-three.png" title="Tambah Produk" />
      <SectionLeftItem img="/images/vendor-four.png" title="Dompet Saya" />
      <SectionLeftItem img="/images/vendor-five.png" title="Profil" />
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
