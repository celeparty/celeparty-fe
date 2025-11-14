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
	const { control, watch, setValue } = useFormContext();
	const [subregionOptions, setSubregionOptions] = useState<iSelectOption[]>([]);

	const regionValue = watch(`serviceLocation.${index}.id`);

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
										let updatedValue: iServiceLocation = {
											id,
											region: selectedProvince?.label || "",
											subregion: field.value?.subregion || "",
											idSubRegion: field.value?.idSubRegion || "",
										};
										field.onChange(updatedValue);
										setValue(`serviceLocation.${index}.id`, id);
										setValue(`serviceLocation.${index}.region`, selectedProvince?.label);
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
							label="Kabupaten"
							onChange={(id) => {
								let selectedRegion = subregionOptions.find((sr) => sr.value === id);
								if (selectedRegion) {
									let updatedValue: iServiceLocation = {
										idSubRegion: id,
										subregion: selectedRegion.label,
										region: field.value?.region || "",
										id: field.value?.id || "",
									};
									field.onChange(updatedValue);
									setValue(`serviceLocation.${index}.idSubRegion`, id);
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
	);
};

export default RegionSubregionSelector;
