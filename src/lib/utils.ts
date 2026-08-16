export function formatJuluDate(
  dateInput: Date | string | number | undefined | null,
): string {
  if (!dateInput) return "-";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formatted = formatter.format(date);

  return formatted.replace(" at ", ", ");
}

export function formatDate(
  dateInput: Date | string | number | undefined | null,
): string {
  if (!dateInput) return "-";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formatted = formatter.format(date);

  return formatted.replace(" at ", ", ");
}

export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatIndo(date: Date, includeYear = true): string {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    ...(includeYear && { year: "numeric" }),
  });
}

export const getTodayWIB = (): string => {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Jakarta',
  });
};

export function formatStockValue(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export const getPeriodLabel = (
  filter: "today" | "yesterday" | "month" | "last_month" | "custom",
): string => {
  const now = new Date();

  // Formatter tanggal Bahasa Indonesia (contoh: 27 Jul 2026)
  const formatIndo = (date: Date, includeYear = true) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      ...(includeYear && { year: "numeric" }),
    });
  };

  switch (filter) {
    case "today": {
      return `Hari Ini (${formatIndo(now)})`;
    }

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return `Kemarin (${formatIndo(yesterday)})`;
    }

    case "month": {
      // Jika di bulan yang sama, tahun dicantumkan di akhir saja agar rapi (Contoh: "01 - 27 Juli 2026")
      return `01 - ${formatIndo(now)}`;
    }

    case "last_month": {
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Day 0 = Hari terakhir bulan lalu

      const startDay = "01";
      const endPeriod = formatIndo(endOfLastMonth);

      return `${startDay} - ${endPeriod}`;
    }

    default:
      return "";
  }
};
