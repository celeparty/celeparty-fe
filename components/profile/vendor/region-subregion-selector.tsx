import { SelectInput } from "@/components/form-components/SelectInput";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { iServiceLocation, iSubregionRes } from "@/lib/interfaces/iMerchant";
import { axiosRegion } from "@/lib/services";
import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface RegionSubregionSelectorProps {
	index: number;
	provinceOptions: iSelectOption[];
}

const RegionSubregionSelector: React.FC<RegionSubregionSelectorProps> = ({ index, provinceOptions }) => {
	const { control, watch, setValue, formState: { errors } } = useFormContext();
	const [subregionOptions, setSubregionOptions] = useState<iSelectOption[]>([]);
	const [duplicateError, setDuplicateError] = useState<string>("");

	const regionValue = watch(`serviceLocation.${index}.id`);
	const subregionValue = watch(`serviceLocation.${index}.idSubRegion`);
	const allServiceLocations = watch("serviceLocation") || [];

	// Check for duplicate cities
	useEffect(() => {
		const currentSubregion = allServiceLocations[index]?.subregion;
		if (!currentSubregion) {
			setDuplicateError("");
			return;
		}

		const hasDuplicate = allServiceLocations.some((loc: any, idx: number) => 
			idx !== index && loc?.subregion === currentSubregion
		);

		if (hasDuplicate) {
			setDuplicateError(`Kota "${currentSubregion}" sudah dipilih sebelumnya`);
		} else {
			setDuplicateError("");
		}
	}, [allServiceLocations, index, subregionValue]);

	useEffect(() => {
		const fetchSubregion = async () => {
			if (!regionValue) return;
			try {
				const response = await axiosRegion("GET", "kabupaten", regionValue);
				setSubregionOptions(
					(response?.value || []).map((item: iSubregionRes) => ({
						label: item.name,
						value: item.id,
					})),
				);
			} catch (error) {
				console.error("Error fetching subregions:", error);
			}
		};

		fetchSubregion();
	}, [regionValue]);

	return (
		<div className="w-full">
			<div className="flex gap-2 w-full">
				<div className="w-[50%] mb-2">
					<Controller
						name={`serviceLocation.${index}.id`}
						control={control}
						render={({ field }) => (
							<>
								<SelectInput
									label="Provinsi"
									onChange={(id) => {
										let selectedProvince = provinceOptions.find((pv) => pv.value === id);
										if (selectedProvince) {
											// ✅ Only set the id field value
											field.onChange(id);
											// ✅ Also set the region name for reference
											setValue(`serviceLocation.${index}.region`, selectedProvince?.label);
											// ✅ Reset subregion when province changes
											setValue(`serviceLocation.${index}.idSubRegion`, "");
											setValue(`serviceLocation.${index}.subregion`, "");
										}
									}}
									value={field.value || ""}
									options={provinceOptions}
								/>
							</>
						)}
					/>
				</div>

				<div className="w-[50%] mb-2">
					<Controller
						name={`serviceLocation.${index}.idSubRegion`}
						control={control}
						render={({ field }) => (
							<SelectInput
								label="Kabupaten/Kota"
								onChange={(id) => {
									let selectedRegion = subregionOptions.find((sr) => sr.value === id);
									if (selectedRegion) {
										// ✅ Only set the idSubRegion field value
										field.onChange(id);
										// ✅ Also set the subregion name for reference
										setValue(`serviceLocation.${index}.subregion`, selectedRegion?.label);
									}
								}}
								value={field.value || ""}
								options={subregionOptions}
							/>
						)}
					/>
				</div>
			</div>
			{duplicateError && (
				<div className="text-red-500 text-sm mt-1 mb-2 flex items-center gap-1">
					<span>⚠️</span>
					<span>{duplicateError}</span>
				</div>
			)}
		</div>
	);
};

export default RegionSubregionSelector;
