import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'

export const useTransaction = create(persist((set, get) => ({
    transaction: {
        "user_event_type_id": 4,
        "event_location": "cimahi",
        "event_province": "Jawa Barat",
        "event_city": "cimahi",
        "event_region": "citeurum",
        "event_area": "Pamekaran",
        "event_date": "2024-07-10 07:00:00",
        "event_capacity": 100
    },
    setTransaction: (data: any) => set((transactions: { transaction: any; }) => ({
        transaction: [...transactions.transaction, ...data]
    })),
}),
    {
        name: 'transaction',
        storage: createJSONStorage(() => sessionStorage),
    }
))