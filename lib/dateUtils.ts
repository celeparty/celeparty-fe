export const formatYearDate = (dateStr: string) => {
	if (!dateStr) return null;
	// Jika sudah yyyy-MM-dd, return langsung
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
	// Coba parse dan format (misal dari input lokal)
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return null;
	return d.toISOString().slice(0, 10);
};
