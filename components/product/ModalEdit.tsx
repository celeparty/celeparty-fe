import { useState, useEffect } from "react";

interface ModalEditProps {
  product: any;
  onClose: () => void;
  onSave: (updatedProduct: any) => void;
}

export default function ModalEdit({ product, onClose, onSave }: ModalEditProps): JSX.Element {
  const [formData, setFormData] = useState<any>(product);

  useEffect(() => {
    setFormData(product);
  }, [product]);

  if (!product) return <></>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-md w-[90%] md:w-[400px]">
        <h2 className="text-lg font-bold mb-3">Edit Produk</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            value={formData.main_price}
            onChange={(e) => setFormData({ ...formData, main_price: Number(e.target.value) })}
            className="border p-2 w-full"
          />
        </div>
        {/* Tambahkan field lain jika diperlukan */}
        <div className="flex justify-end gap-2 mt-4">
          <button className="bg-gray-500 text-white px-3 py-1 rounded-md" onClick={onClose}>
            Batal
          </button>
          <button className="bg-blue-500 text-white px-3 py-1 rounded-md" onClick={() => onSave(formData)}>
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
