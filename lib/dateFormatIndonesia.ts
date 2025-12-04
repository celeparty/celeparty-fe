/**
 * Indonesian Date and Time Formatting Utilities
 * Format: "04 - Desember - 2025" for dates
 * Format: "14:30 WIB" for times
 */

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const INDONESIAN_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/**
 * Format date to Indonesian format: "04 - Desember - 2025"
 * @param date - Date object, date string, or null
 * @returns Formatted string or empty string if date is invalid
 */
export const formatDateIndonesia = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  try {
    let dateObj: Date;

    if (typeof date === "string") {
      // Handle various date string formats
      dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        // Try parsing YYYY-MM-DD format
        const [year, month, day] = date.split("-");
        if (year && month && day) {
          dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          return "";
        }
      }
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) return "";

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = INDONESIAN_MONTHS[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${day} - ${month} - ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format time to Indonesian format: "14:30 WIB"
 * @param time - Date object or time string (HH:MM or HH:MM:SS)
 * @returns Formatted string like "14:30 WIB"
 */
export const formatTimeIndonesia = (time: Date | string | null | undefined): string => {
  if (!time) return "";

  try {
    let hours: number;
    let minutes: number;

    if (typeof time === "string") {
      // Handle time string in format HH:MM or HH:MM:SS
      const timeParts = time.split(":");
      if (timeParts.length < 2) {
        return "";
      }
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
    } else if (time instanceof Date) {
      hours = time.getHours();
      minutes = time.getMinutes();
    } else {
      return "";
    }

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return "";
    }

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return `${formattedHours}:${formattedMinutes} WIB`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

/**
 * Format date and time together: "04 - Desember - 2025 14:30 WIB"
 * @param datetime - Date object or datetime string
 * @returns Formatted string
 */
export const formatDateTimeIndonesia = (datetime: Date | string | null | undefined): string => {
  if (!datetime) return "";

  try {
    let dateObj: Date;

    if (typeof datetime === "string") {
      dateObj = new Date(datetime);
      if (isNaN(dateObj.getTime())) {
        return "";
      }
    } else {
      dateObj = datetime;
    }

    const date = formatDateIndonesia(dateObj);
    const time = formatTimeIndonesia(dateObj);

    return date && time ? `${date} ${time}` : "";
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "";
  }
};

/**
 * Format date with day name: "Senin, 04 - Desember - 2025"
 * @param date - Date object or date string
 * @returns Formatted string
 */
export const formatDateWithDayIndonesia = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  try {
    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "";
      }
    } else {
      dateObj = date;
    }

    const dayName = INDONESIAN_DAYS[dateObj.getDay()];
    const formattedDate = formatDateIndonesia(dateObj);

    return `${dayName}, ${formattedDate}`;
  } catch (error) {
    console.error("Error formatting date with day:", error);
    return "";
  }
};

/**
 * Format plain time string to include WIB: "14:30" -> "14:30 WIB"
 * @param timeString - Time string in format HH:MM or HH:MM:SS
 * @returns Formatted string like "14:30 WIB"
 */
export const formatTimeWithWIB = (timeString: string | null | undefined): string => {
  if (!timeString) return "";
  return formatTimeIndonesia(timeString);
};

/**
 * Get duration between two dates in readable format
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration string like "2 hari 3 jam" or empty string
 */
export const formatDurationIndonesia = (
  startDate: Date | string,
  endDate: Date | string
): string => {
  try {
    const start = typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    const diff = Math.abs(end.getTime() - start.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} hari`);
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);

    return parts.join(" ");
  } catch (error) {
    console.error("Error formatting duration:", error);
    return "";
  }
};
