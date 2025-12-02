export const formatYearDate = (dateStr: string | Date | null | undefined): string | null => {
	if (!dateStr) return null;
	
	try {
		let dateObj: Date;
		
		// Jika sudah yyyy-MM-dd format string, return langsung
		if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
			return dateStr;
		}
		
		// Jika Date object
		if (dateStr instanceof Date) {
			dateObj = dateStr;
		} else if (typeof dateStr === 'string') {
			// Coba parse string
			dateObj = new Date(dateStr);
		} else {
			return null;
		}
		
		// Validasi date
		if (isNaN(dateObj.getTime())) {
			console.warn('Invalid date:', dateStr);
			return null;
		}
		
		// Return dalam format YYYY-MM-DD
		return dateObj.toISOString().slice(0, 10);
	} catch (error) {
		console.error('Error formatting date:', error, dateStr);
		return null;
	}
};
