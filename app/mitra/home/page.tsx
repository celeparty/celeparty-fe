"use client"
import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


interface iItemStatus {
    status: string
    value: number | string
    color: string
}

function ItemStatus({ status, value, color }: iItemStatus): JSX.Element {
    return <div className={`py-3 px-5 text-center rounded-lg text-white min-w-[160px]`} style={{ backgroundColor: `${color}` }}>
        <h4>{status}</h4>
        <strong>{value}</strong>
    </div>

}
export default async function HomeMitra() {

    return (
        <div>
            <div className="flex justify-center items-center gap-3">
                <ItemStatus
                    status="PENDING"
                    value={1}
                    color="#3E2882"
                />
                <ItemStatus
                    status="PROCESS"
                    value={1}
                    color="#56C200"
                />
                <ItemStatus
                    status="CANCEL"
                    value={1}
                    color="#F60E0E"
                />
                <ItemStatus
                    status="INCOME"
                    value="Rp. 1.000.000"
                    color="#44CADC"
                />
            </div>
            <div className="mt-7">
                <Table className="bg-white">
                    <TableHeader className="bg-white">
                        <TableRow>
                            <TableHead className="w-[150px]">ORDER DATE</TableHead>
                            <TableHead>ITEM</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead >TOTAL</TableHead>
                            <TableHead >ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="bg-white">
                            <TableCell className="font-medium">2023/01/24/1</TableCell>
                            <TableCell>Matcha Drip Cake</TableCell>
                            <TableCell>Pending</TableCell>
                            <TableCell>Rp. 220.000</TableCell>
                            <TableCell><div className="text-red-500">CANCELLED</div></TableCell>
                        </TableRow>
                        <TableRow className="bg-white">
                            <TableCell className="font-medium">2023/01/24/1</TableCell>
                            <TableCell>Matcha Drip Cake</TableCell>
                            <TableCell>Completed</TableCell>
                            <TableCell>Rp. 220.000</TableCell>
                            <TableCell><div className="text-green-500">COMPLETED</div></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>

    )
}
