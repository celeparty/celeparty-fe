import Box from "@/components/Box"
import Basecontent from "@/components/Basecontent"
import Image from "next/image"
import Link from "next/link"

interface iItemMenu {
    title: string
    icon: string
    iconWidth: number
    iconHeight: number
    link: string
    status?: boolean
}

function ItemMenu({ title, icon, iconWidth, iconHeight, link }: iItemMenu) {
    return <Link href={link} className="relative flex gap-3 items-center mb-5 group">
        <div className="relative">
            <Image src={`${icon}`} width={iconWidth} height={iconHeight} alt={title} />
        </div>
        <div className="text-white border border-solid border-white px-3 py-2 rounded-lg flex-1 group-hover:bg-c-green">{title}</div>
    </Link>
}

export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative wrapper-main py-7">
            <Basecontent>
                <div className="flex justify-between items-start gap-7">
                    <Box className="bg-c-blue text-white max-w-[280px] mt-0">
                        <h4>Menu Mitra</h4>
                        <div className="relative mt-5">
                            <ItemMenu
                                title="Pesanan"
                                icon="/images/icon-order.svg"
                                iconWidth={30}
                                iconHeight={30}
                                link="/mitra/home"
                            />
                            <ItemMenu
                                title="Produk Saya"
                                icon="/images/icon-product.svg"
                                iconWidth={30}
                                iconHeight={30}
                                link="/mitra/home"
                            />
                            <ItemMenu
                                title="Tambah Produk"
                                icon="/images/icon-add-product.svg"
                                iconWidth={30}
                                iconHeight={30}
                                link="/mitra/home"
                            />
                            <ItemMenu
                                title="Dompet Saya"
                                icon="/images/icon-wallet.svg"
                                iconWidth={30}
                                iconHeight={30}
                                link="/mitra/home"
                            />
                            <ItemMenu
                                title="Profil"
                                icon="/images/icon-profile.svg"
                                iconWidth={30}
                                iconHeight={30}
                                link="/mitra/profile"
                            />
                        </div>
                    </Box>
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </Basecontent>
        </div>

    )
}