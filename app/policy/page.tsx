"use client";

import { useState } from "react";

const sections = [
  { id: "definisi", title: "Definisi dan Interpretasi" },
  { id: "ruang", title: "Ruang Lingkup Layanan" },
  { id: "akun", title: "Pendaftaran dan Akun" },
  { id: "kek", title: "Ketentuan Event Kreator" },
  { id: "kv", title: "Ketentuan Vendor" },
  { id: "kp", title: "Ketentuan Pengguna/Pembeli" },
  { id: "pb", title: "Pembayaran dan Biaya" },
  { id: "refund", title: "Kebijakan Pembatalan dan Refund" },
  { id: "batasan", title: "Batasan Tanggung Jawab" },
  { id: "larangan", title: "Larangan" },
  { id: "haki", title: "Hak Kekayaan Intelektual" },
  { id: "perubahan", title: "Perubahan Syarat dan Ketentuan" },
  { id: "hukum", title: "Hukum Yang Berlaku" },
  { id: "kontak", title: "Kontak Celeparty" },
];

export default function PolicyPage() {
  const [active, setActive] = useState("definisi");

return (
		<div className="lg:mx-auto wrapper bg-c-blue lg:rounded-lg lg:my-8">
			<div className="max-w-[707px] mx-auto  leading-[20px] pt-8 pb-12 px-2 lg:px-0">
				<main className="max-w-6xl mx-auto flex gap-8 py-12 px-4">
			      {/* Sidebar */}
			      <aside className="w-1/4">
			        <h2 className="text-2xl font-bold mb-6">Syarat dan Ketentuan</h2>
			        <ul className="space-y-2 text-sm">
			          {sections.map((s) => (
			            <li key={s.id}>
			              <a
			                href={`#${s.id}`}
			                onClick={() => setActive(s.id)}
			                className={`block ${
			                  active === s.id ? "text-blue-600 font-medium" : "text-gray-700"
			                } hover:text-blue-600`}
			              >
			                {s.title}
			              </a>
			            </li>
			          ))}
			        </ul>
			      </aside>
			
			      {/* Content */}
			      <div className="flex-1 space-y-12">
			        <section id="definisi">
			          <h3 className="text-xl font-semibold mb-4">Definisi dan Interpretasi</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             "Website" berarti platform CELEPARTY yang menyediakan layanan penjualan tiket event dan penyewaan peralatan event.
			            </li>
			            <li>
			              "Pengguna" berarti setiap individu atau badan hukum yang mengakses atau menggunakan layanan.
			            </li>
			            <li>
			              "Event Kreator" berarti pihak yang membuat, menyelenggarakan, dan/atau menjual tiket event melalui Website.
			            </li>
			            <li>
			              "Vendor" berarti pihak yang menyediakan peralatan/event services untuk disewakan.
			            </li>
			            <li>
			              "Pembeli/Customer" berarti pihak yang membeli tiket atau menyewa peralatan event melalui Website.
			            </li>
			            <li>
			              "Layanan" berarti seluruh fitur, produk, dan jasa yang tersedia pada Website.
			            </li>
			          </ol>
			        </section>

					   <section id="ruang">
			          <h3 className="text-xl font-semibold mb-4">Ruang Lingkup Layanan</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Website bertindak sebagai platform penghubung antara Event Kreator, Vendor, dan Pengguna.
			            </li>
			            <li>
			              Website bukan penyelenggara event maupun penyedia peralatan, kecuali secara eksplisit disebutkan.
			            </li>
			            <li>
			              Segala transaksi, kesepakatan harga, kualitas, dan penyediaan layanan merupakan tanggung jawab penuh antara Event Kreator/Vendor dengan Pengguna.
			            </li>
			          </ol>
			        </section>
			
			        <section id="akun">
			          <h3 className="text-xl font-semibold mb-4">Pendaftaran dan Akun</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Untuk menggunakan layanan tertentu, Pengguna wajib membuat akun dengan data yang benar, lengkap, dan terkini.
			            </li>
			            <li>
			              Pengguna bertanggung jawab penuh atas kerahasiaan akun dan kata sandi.
			            </li>
			            <li>
			             Website berhak menonaktifkan atau menghapus akun jika ditemukan penyalahgunaan atau pelanggaran hukum.
			            </li>
			          </ol>
			        </section>			       
			
			        <section id="kek">
			          <h3 className="text-xl font-semibold mb-4">Ketentuan Event Kreator</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Event Kreator wajib memberikan informasi event yang benar, akurat, dan tidak menyesatkan.
			            </li>
			            <li>
			              Event Kreator bertanggung jawab atas:
							<ul>
								<li>Legalitas event, izin, dan lisensi terkait.</li>
								<li>Kualitas penyelenggaraan event.</li>
								<li>Kebijakan refund/cancellation sesuai peraturan.</li>
							</ul>
			            </li>
			            <li>
			            Website berhak menolak atau menghapus event yang melanggar hukum atau kebijakan internal.
			            </li>
			          </ol>
			        </section>
			
			        <section id="kv">
			          <h3 className="text-xl font-semibold mb-4">Ketentuan Vendor</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Vendor wajib mencantumkan detail produk/peralatan dengan jelas (spesifikasi, harga sewa, ketersediaan).
			            </li>
			            <li>
			              Vendor menjamin kualitas dan keamanan peralatan yang disewakan.
			            </li>
			            <li>
			             Vendor bertanggung jawab atas kerugian atau kerusakan yang timbul akibat penggunaan produk yang tidak sesuai standar.
			            </li>
			            <li>
			             Website berhak menurunkan listing jika produk tidak sesuai atau melanggar aturan.
			            </li>
			          </ol>
			        </section>
			        <section id="kp">
			          <h3 className="text-xl font-semibold mb-4">Ketentuan Pengguna/Pembeli</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Pengguna wajib memastikan kebenaran data yang diberikan saat melakukan pembelian tiket atau penyewaan.
			            </li>
			            <li>
			              Segala transaksi dianggap sah setelah pembayaran terkonfirmasi melalui sistem Website.
			            </li>
			            <li>
			             Pengguna dilarang melakukan penipuan, penyalahgunaan, atau tindakan melanggar hukum di platform.
			            </li>
			            <li>
			             Pengguna bertanggung jawab atas kerusakan atau kehilangan peralatan yang disewa sesuai kesepakatan dengan Vendor.
			            </li>
			          </ol>
			        </section>
			        <section id="pb">
			          <h3 className="text-xl font-semibold mb-4">Pembayaran dan Biaya</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Pembayaran dilakukan melalui metode resmi yang disediakan Website.
			            </li>
			            <li>
			              Website dapat mengenakan biaya layanan/komisi dari transaksi antara Event Kreator/Vendor dengan Pengguna.
			            </li>
			            <li>
			             Segala pajak, biaya tambahan, atau kewajiban hukum atas transaksi menjadi tanggung jawab pihak terkait (Event Kreator/Vendor).
			            </li>
			          </ol>
			        </section>
			        <section id="refund">
			          <h3 className="text-xl font-semibold mb-4">Kebijakan Pembatalan dan Refund</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Kebijakan refund tiket ditentukan oleh masing-masing Event Kreator.
			            </li>
			            <li>
			              Kebijakan pembatalan penyewaan peralatan ditentukan oleh masing-masing Vendor.
			            </li>
			            <li>
			             Website tidak bertanggung jawab atas pengembalian dana kecuali secara eksplisit disebutkan.
			            </li>
			          </ol>
			        </section>
			        <section id="batasan">
			          <h3 className="text-xl font-semibold mb-4">Batasan Tanggung Jawab</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Website hanya bertindak sebagai perantara, tidak menjamin:
							<ul>
								<li>Keaslian event.</li>
								<li>Kualitas peralatan.</li>
								<li>Kepatuhan hukum penyelenggara event/Vendor.</li>
							</ul>
			            </li>
			            <li>
			              Website tidak bertanggung jawab atas kerugian langsung maupun tidak langsung akibat penggunaan layanan.
			            </li>
			          </ol>
			        </section>
			
			        <section id="larangan">
			          <h3 className="text-xl font-semibold mb-4">
			            Larangan
			          </h3>
			          <p className="text-gray-700">
			            Pengguna di larang:
						  <ul>
							  <li>Menjual produk/jasa ilegal atau yang dilarang hukum.</li>
							  <li>Mengunggah konten yang melanggar hak cipta, SARA, atau pornografi.</li>
							  <li>Menggunakan sistem untuk tindakan penipuan atau peretasan.</li>
						  </ul>
			          </p>
			        </section>

					  <section id="haki">
			          <h3 className="text-xl font-semibold mb-4">Hak Kekayaan Intelektual</h3>
			          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
			            <li>
			             Seluruh konten, logo, desain, dan kode sumber Website adalah milik Celeparty.
			            </li>
			            <li>
			              Pengguna tidak diperkenankan menyalin, menggunakan, atau mendistribusikan tanpa izin tertulis.
			            </li>
			          </ol>
			        </section>

					  	  <section id="perubahan">
			          <h3 className="text-xl font-semibold mb-4">Perubahan Syarat dan Ketentuan</h3>
			           <p className="text-gray-700">
			              Website berhak memperbarui Syarat dan Ketentuan ini sewaktu-waktu. Perubahan berlaku setelah dipublikasikan di halaman resmi Website.		
			          </p>
			        </section>
			
			        <section id="hukum">
			          <h3 className="text-xl font-semibold mb-4">Hukum yang Berlaku</h3>
			          <p className="text-gray-700">
			            Syarat dan Ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia.
						Segala sengketa akan diselesaikan melalui musyawarah, atau jika perlu melalui jalur hukum di pengadilan.
			          </p>
			        <section id="kontak">
			          <h3 className="text-xl font-semibold mb-4">Kontak Celeparty</h3>
			          <p className="text-gray-700">
			            Jika ada pertanyaan mengenai Syarat dan Ketentuan ini, hubungi kami di:
						<ul><li>📧: celeparty.id@gmail.com </li>
							<li>📞: +6285211119011 </li>
						</ul>
						
			          </p>
			        </section>
			      </div>
			    </main>
			</div>
		</div>
	);
};

export default Test;
