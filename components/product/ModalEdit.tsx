import { useState } from "react"

interface ModalEditProps {
  product: any,
  onClose: () => void
}

export default function ModalEdit({product, onClose}: ModalEditProps) {
  const [title, setTitle] = useState<string>(product.title)
  const [price, setPrice] = useState<number>(product.main_price)

  const handleSubmit = () => {
    onClose()
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-md w-[90%] md:w-[400px]">
        <h2 className="text-lg font-bold mb-3">Edit Produk</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="bg-blue-500 text-white px-3 py-1 rounded-md" onClick={handleSubmit}>
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
