import { iProductReq, iProductVariant } from "@/lib/interfaces/iProduct";
import { formatNumberWithDots } from "@/lib/utils";
import { Control, Controller, FieldPath, UseFormRegister } from "react-hook-form";

type VariantItemProps = {
	index: number;
	control: Control<iProductReq>;
	register: UseFormRegister<iProductReq>;
	onRemove: () => void;
	errors?: any;
};

export const ProductVariantItem = ({ index, register, onRemove, errors, control }: VariantItemProps) => {
	const getFieldName = <T extends FieldPath<iProductVariant>>(field: T): `variant.${number}.${T}` =>
		`variant.${index}.${field}`;

	return (
		<div className="border p-4 mb-4 rounded-lg shadow-sm">
			<div className="grid grid-cols-12 gap-4">
				<div className="input-group md:col-span-4">
					<label className="block text-sm font-medium mb-1">Nama Variant</label>
					<input
						{...register(getFieldName("name"))}
						className="w-full p-2 border rounded"
						placeholder="e.g., Premium"
					/>
					{errors?.variant?.[index]?.name && (
						<p className="text-red-500 text-xs mt-1">{errors.variant[index].name.message}</p>
					)}
				</div>

				<div className="input-group md:col-span-4">
					<label className="block text-sm font-medium mb-1">Harga</label>
					<Controller
						name={`variant.${index}.price`}
						control={control}
						render={({ field }) => (
							<input
								{...field}
								value={field.value ? formatNumberWithDots(field.value.toString()) : ""}
								onChange={(e) => {
									const rawValue = e.target.value.replace(/\D/g, "");
									const formatted = formatNumberWithDots(rawValue);
									field.onChange(formatted);
								}}
								className="border border-gray-300 rounded-md py-2 px-5 w-full"
								placeholder="Harga Produk (Rp)"
							/>
						)}
					/>
					{errors?.variant?.[index]?.price && (
						<p className="text-red-500 text-xs mt-1">{errors.variant[index].price.message}</p>
					)}
				</div>

				<div className="input-group md:col-span-4">
					<label className="block text-sm font-medium mb-1">Jumlah Stock (Opsional)</label>
					<input
						{...register(getFieldName("quota"))}
						className="w-full p-2 border rounded"
						placeholder="e.g., 100"
					/>
					{errors?.variant?.[index]?.quota && (
						<p className="text-red-500 text-xs mt-1">{errors.variant[index].quota.message}</p>
					)}
				</div>

				<div className="input-group md:col-span-6">
					<label className="block text-sm font-medium mb-1">
						Deadline{" "}
						<span className="text-xs">
							(Opsional - jika melewati tanggal yang ditetapkan produk akan terhapus otomatis)
						</span>
					</label>
					<input
						type="date"
						{...register(getFieldName("purchase_deadline"))}
						className="w-full p-2 border rounded"
					/>
					{errors?.variant?.[index]?.purchase_deadline && (
						<p className="text-red-500 text-xs mt-1">{errors.variant[index].purchase_deadline.message}</p>
					)}
				</div>
			</div>

			<button type="button" onClick={onRemove} className="mt-2 text-red-600 text-sm hover:text-red-800">
				Hapus Variant
			</button>
		</div>
	);
};
