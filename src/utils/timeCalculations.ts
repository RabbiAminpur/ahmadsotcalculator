import { OvertimeRecord, UserSettings } from '../types';

/**
 * Converts a 'HH:MM' string to decimal hours (e.g., '08:30' -> 8.5)
 */
export function timeToDecimal(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

/**
 * Converts decimal hours to a 'Hh Mm' user-friendly string
 */
export function decimalToHoursMinutesStr(decimalHours: number): string {
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Converts decimal hours back to a 'HH:MM' string
 */
export function decimalToTimeStr(decimalHours: number): string {
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Calculates a record's worked and overtime details
 */
export function calculateDailyMetrics(
  morningTime: string,
  closingTime: string,
  settings: UserSettings
): {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  regularEarnings: number;
  overtimeEarnings: number;
  totalEarnings: number;
} {
  const morningDec = timeToDecimal(morningTime);
  let closingDec = timeToDecimal(closingTime);

  // Handle overnight shifts (if closing time is less than morning time)
  if (closingDec < morningDec) {
    closingDec += 24;
  }

  // Total elapsed hours
  const totalElapsed = closingDec - morningDec;

  // Overtime starts after 17:00 (5:00 PM).
  // If closing time is after 17:00, calculate overtime.
  // We need to account for overnight shifts as well.
  const overtimeThreshold = 17; // 5:00 PM in 24-hour format
  
  let overtimeHours = 0;
  if (closingDec > overtimeThreshold) {
    // If the morning time was *after* 5 PM, then ALL hours are overtime.
    if (morningDec >= overtimeThreshold) {
      overtimeHours = totalElapsed;
    } else {
      overtimeHours = closingDec - overtimeThreshold;
    }
  }

  // Regular hours are total minus overtime
  let regularHours = Math.max(0, totalElapsed - overtimeHours);

  // Subtract unpaid break from regular hours if applicable
  const breakHours = settings.unpaidBreakMinutes / 60;
  if (breakHours > 0 && regularHours > 0) {
    if (regularHours >= breakHours) {
      regularHours -= breakHours;
    } else {
      // If break is longer than regular hours, take the rest from overtime, or clamp regular to 0
      regularHours = 0;
    }
  }

  // Calculate earnings
  const regRate = settings.hourlyRate;
  const otRate =
    settings.overtimeRateType === 'multiplier'
      ? regRate * settings.overtimeMultiplier
      : settings.flatOvertimeRate;

  const regularEarnings = regularHours * regRate;
  const overtimeEarnings = overtimeHours * otRate;
  const totalEarnings = regularEarnings + overtimeEarnings;

  return {
    totalHours: Number(totalElapsed.toFixed(2)),
    regularHours: Number(regularHours.toFixed(2)),
    overtimeHours: Number(overtimeHours.toFixed(2)),
    regularEarnings: Number(regularEarnings.toFixed(2)),
    overtimeEarnings: Number(overtimeEarnings.toFixed(2)),
    totalEarnings: Number(totalEarnings.toFixed(2)),
  };
}

/**
 * Formats date into "Thursday, Jul 9"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get Month Name from 'YYYY-MM'
 */
export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Group records by month and compute stats
 */
export function computeMonthlySummaries(
  records: OvertimeRecord[]
): Record<string, {
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalHours: number;
  totalRegularEarnings: number;
  totalOvertimeEarnings: number;
  totalEarnings: number;
  recordCount: number;
}> {
  const summaries: Record<string, {
    totalRegularHours: number;
    totalOvertimeHours: number;
    totalHours: number;
    totalRegularEarnings: number;
    totalOvertimeEarnings: number;
    totalEarnings: number;
    recordCount: number;
  }> = {};

  records.forEach((record) => {
    const monthKey = record.date.substring(0, 7); // 'YYYY-MM'
    if (!summaries[monthKey]) {
      summaries[monthKey] = {
        totalRegularHours: 0,
        totalOvertimeHours: 0,
        totalHours: 0,
        totalRegularEarnings: 0,
        totalOvertimeEarnings: 0,
        totalEarnings: 0,
        recordCount: 0,
      };
    }

    const s = summaries[monthKey];
    s.totalRegularHours += record.regularHours;
    s.totalOvertimeHours += record.overtimeHours;
    s.totalHours += record.totalHours;
    s.totalRegularEarnings += record.regularEarnings;
    s.totalOvertimeEarnings += record.overtimeEarnings;
    s.totalEarnings += record.totalEarnings;
    s.recordCount += 1;
  });

  // Round values
  Object.keys(summaries).forEach((k) => {
    const s = summaries[k];
    s.totalRegularHours = Number(s.totalRegularHours.toFixed(2));
    s.totalOvertimeHours = Number(s.totalOvertimeHours.toFixed(2));
    s.totalHours = Number(s.totalHours.toFixed(2));
    s.totalRegularEarnings = Number(s.totalRegularEarnings.toFixed(2));
    s.totalOvertimeEarnings = Number(s.totalOvertimeEarnings.toFixed(2));
    s.totalEarnings = Number(s.totalEarnings.toFixed(2));
  });

  return summaries;
}
