interface NotificationItem {
  title: string;
  description: string;
}

const TableStatus = () => {
  return (
    <div className="mt-20 h-[400px]">
      <h1 className="font-hind font-semibold text-[16px] text-black mb-6">
        Status Pembelian
      </h1>
      <table className="min-w-full bg-white border-b-2 border-gray-200">
        <thead className="">
          <tr>
            <th className="px-6 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Item
            </th>
            <th className="px-6 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
              Vendor
            </th>
          </tr>
        </thead>
        <tbody className="[&_td]:text-start [&_td]:font-normal [&_td]:text-[10px] [&_td]:font-hind [&_td]:text-[#3C3C3C] [&_td]:border-b-4">
          <tr>
            <td className="px-6 py-4 border-b border-gray-200">2023/01/24/1</td>
            <td className="px-6 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="px-6 py-4 border-b border-gray-200">Pending</td>
            <td className="px-6 py-4 border-b border-gray-200">Rp. 220.000</td>
            <td className="px-6 py-4 border-b border-gray-200">ABC Cakes</td>
          </tr>
          <tr>
            <td className="px-6 py-4 border-b border-gray-200">2023/01/24/2</td>
            <td className="px-6 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="px-6 py-4 border-b border-gray-200">Processing</td>
            <td className="px-6 py-4 border-b border-gray-200">Rp. 220.000</td>
            <td className="px-6 py-4 border-b border-gray-200">ABC Cakes</td>
          </tr>
          <tr>
            <td className="px-6 py-4 border-b border-gray-200">2023/01/24/3</td>
            <td className="px-6 py-4 border-b border-gray-200">
              Matcha Drip Cake
            </td>
            <td className="px-6 py-4 border-b border-gray-200">Shipping</td>
            <td className="px-6 py-4 border-b border-gray-200">Rp. 220.000</td>
            <td className="px-6 py-4 border-b border-gray-200">ABC Cakes</td>
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
      <h3 className="font-hind font-semibold text-[12px] text-black leading-[20px]">
        {title}
      </h3>
      <p className="font-hind font-normal text-[10px] leading-[15px] text-[#3C3C3C]">
        {description}
      </p>
    </div>
  );
};

const Notification = () => {
  return (
    <div className="mt-12">
      <h1 className="text-[16px] my-4 leading-[26px] font-hind text-black font-semibold">
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

const InputUser = () => {
  return (
    <form className="[&_label]:font-medium [&_label]:font-hind [&_label]:text-[16px] [&_input]:border [&_input]:border-[#ADADAD] [&_input]:rounded-lg">
      <div className="mb-6 flex items-center w-[500px]">
        <label className="text-black w-[30%]" htmlFor="nama">
          Nama
        </label>
        <input
          type="text"
          id="nama"
          name="nama"
          className="shadow appearance-none w-[70%] border rounded py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6 flex items-center  w-[500px]">
        <label className="text-black w-[30%]" htmlFor="tanggalLahir">
          Tanggal Lahir
        </label>
        <input
          type="date"
          id="tanggalLahir"
          name="tanggalLahir"
          className="shadow appearance-none w-[70%] border rounded  py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6 flex items-center  w-[500px]">
        <label className="w-[30%] text-black" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="shadow appearance-none border rounded w-[70%] py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-8 flex items-center w-[500px]">
        <label className="w-[30%] text-black" htmlFor="noHp">
          No HP
        </label>
        <input
          type="tel"
          id="noHp"
          name="noHp"
          className="shadow appearance-none border rounded w-[70%] py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end w-[500px] font-hind">
          <button
            type="submit"
            className="bg-[#CBD002] w-[350px] text-white py-2 px-4 rounded-lg font-medium text-[16px]"
          >
            Simpan
          </button>
        </div>
        <div className="flex items-center justify-end w-[500px]">
          <button
            type="submit"
            className="border-solid border border-black w-[350px] rounded-lg text-black font-medium text-[16px] py-2 px-4"
          >
            Ubah Kata Sandi
          </button>
        </div>
      </div>
    </form>
  );
};

const ProfilePage = () => {
  return (
    <div className="wrapper my-10">
      <div className="px-10 py-6 border-2 border-gray-300 rounded-lg shadow-xl">
        <h1 className="text-[16px] my-4 leading-[26px] font-hind text-black font-semibold">
          Biodata Diri
        </h1>
        <div className="flex gap-24">
          <div className="w-[300px]">
            <div className="w-full h-[300px] mb-4 bg-black rounded-lg"></div>
            <button className="border-solid border border-black w-full py-2 rounded-lg mb-2">
              Pilih Foto
            </button>
            <p className="font-hind font-normal text-[11px] text-center leading-[20px]">
              Besar file: maksimum 10.000.000 bytes (10 Megabytes). <br />{" "}
              Ekstensi file yang diperbolehkan: .JPG .JPEG .PNG
            </p>
          </div>
          <div>
            <InputUser />
          </div>
        </div>
        <Notification />
        <TableStatus />
      </div>
    </div>
  );
};

export default ProfilePage;
