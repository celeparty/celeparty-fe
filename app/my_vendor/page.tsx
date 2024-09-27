import Image from "next/image";

type Props = {
	img: string;
	title: string;
};

type ButtonProps = {
	title: string;
	count: string;
	// colorBg: string;
	className: string;
};

type ActionItemProps = {
	src: string;
	title: string;
	icon: boolean;
	status: string;
	className: string;
};

const SectionLeftItem = ({ img, title }: Props) => {
	return (
		<div className="flex items-center gap-6 mb-4">
			<div>
				<Image src={img} width={30} height={30} alt="" />
			</div>
			<button className="border border-solid border-white p-2 rounded-lg text-white font-hind text-[16px] font-semibold hover:bg-c-green hover:border-none text-start border-box lg:w-w-[152px] w-full">
				{title}
			</button>
		</div>
	);
};

const SectionLeft = () => {
	return (
		<div className="w-full lg:w-[321px] h-fit lg:h-[580px] px-8 py-5 bg-c-blue">
			<h5 className="text-white text-[20px] lg:text-[16px] font-hind font-semibold lg:font-medium mb-4 lg:text-start text-center">
				Menu Mitra
			</h5>
			<SectionLeftItem img="/images/vendor-one.png" title="Pesanan" />
			<SectionLeftItem img="/images/vector-two.png" title="Produk Saya" />
			<SectionLeftItem
				img="/images/vendor-three.png"
				title="Tambah Produk"
			/>
			<SectionLeftItem
				img="/images/vendor-four.png"
				title="Dompet Saya"
			/>
			<SectionLeftItem img="/images/vendor-five.png" title="Profil" />
		</div>
	);
};

const SectionRight = () => {
	return (
		<div className="flex-1">
			<div className="flex justify-center my-4">
				<div className="flex flex-wrap lg:flex-nowrap gap-2 lg:gap-10 justify-center lg:justify-start">
					<ButtonStatus
						title="PENDING"
						count="1"
						className="bg-[#3E2882]"
					/>
					<ButtonStatus
						title="PROCCES"
						count="1"
						className="bg-[#56C200]"
					/>
					<ButtonStatus
						title="CANCEL"
						count="1"
						className="bg-[#F60E0E]"
					/>
					<ButtonStatus
						title="INCOME"
						count="Rp.220.000"
						className="bg-[#44CADC]"
					/>
				</div>
			</div>
			<div>
				<table className="min-w-full bg-white border-b-2 border-gray-200">
					<thead className="">
						<tr>
							<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
								ORDER DATE
							</th>
							<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
								ITEM
							</th>
							<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
								STATUS
							</th>
							<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
								TOTAL
							</th>
							<th className="lg:px-6 px-4 py-3 border-b-4 text-start text-xs font-bold text-[8px] text-black uppercase tracking-wider">
								ACTION
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
								<div className="flex lg:flex-row flex-col gap-4">
									<ActionItem
										src="/images/chcek-vendor.png"
										title="Process"
										icon={true}
										className=""
										status=""
									/>
									<ActionItem
										src="/images/cancel-vendor.png"
										title="Cancel"
										icon={true}
										className=""
										status=""
									/>
								</div>
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
								<div className="flex lg:flex-row flex-col gap-4">
									<ActionItem
										src="/images/airline-vendor.png"
										title="Shipment"
										icon={true}
										className=""
										status=""
									/>
									<ActionItem
										src="/images/cancel-vendor.png"
										title="Cancel"
										icon={true}
										className=""
										status=""
									/>
								</div>
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
								<div className="flex lg:flex-row flex-col gap-4">
									<ActionItem
										src=""
										title=""
										icon={false}
										className="font-hind font-semibold text-[10px] text-[#DA7E01]"
										status="Waiting Received Confirmation"
									/>
								</div>
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
								Completed
							</td>
							<td className="lg:px-6 px-4 py-4 border-b border-gray-200">
								Rp. 220.000
							</td>
							<td className="lg:px-6 px-4 py-4 border-b border-gray-200">
								<div className="flex lg:flex-row flex-col gap-4">
									<ActionItem
										src=""
										title=""
										icon={false}
										className="font-hind font-semibold text-[10px] text-[#56C200]"
										status="COMPLETED"
									/>
								</div>
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
								Cancelled
							</td>
							<td className="lg:px-6 px-4 py-4 border-b border-gray-200">
								Rp. 220.000
							</td>
							<td className="lg:px-6 px-4 py-4 border-b border-gray-200">
								<div className="flex lg:flex-row flex-col gap-4">
									<ActionItem
										src=""
										title=""
										icon={false}
										className="font-hind font-semibold text-[10px] text-[#F60E0E]"
										status="CANCELLED"
									/>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
};

const ButtonStatus = ({ title, count, className }: ButtonProps) => {
	return (
		<div
			className={`lg:w-[165px] w-[40%] h-[60] text-white px-10 py-4 [&_p]:text-center [&_h1]:text-center rounded-xl ${className}`}
		>
			<h1 className="font-hind font-normal text-[12px]">{title}</h1>
			<p className="font-hind font-normal text-[12px]">{count}</p>
		</div>
	);
};

const ActionItem = ({
	src,
	title,
	icon,
	status,
	className,
}: ActionItemProps) => {
	return (
		<div>
			{icon ? (
				<button>
					<div className="flex justify-center">
						<Image src={src} width={18} height={18} alt="" />
					</div>
					<p>{title}</p>
				</button>
			) : (
				<p className={`${className}`}>{status}</p>
			)}
		</div>
	);
};

const MyVendor = () => {
	return (
		<div className="flex gap-4 lg:gap-6 lg:flex-row flex-col">
			<SectionLeft />
			<SectionRight />
		</div>
	);
};

export default MyVendor;
