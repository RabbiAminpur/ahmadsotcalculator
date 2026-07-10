export interface OvertimeRecord {
  id: string; // 'YYYY-MM-DD'
  date: string; // 'YYYY-MM-DD'
  morningTime: string; // 'HH:MM'
  closingTime: string; // 'HH:MM'
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  regularEarnings: number;
  overtimeEarnings: number;
  totalEarnings: number;
  notes?: string;
}

export interface UserSettings {
  hourlyRate: number;
  overtimeMultiplier: number;
  overtimeRateType: 'multiplier' | 'flat';
  flatOvertimeRate: number;
  currency: string;
  defaultMorningTime: string; // '08:00'
  defaultClosingTime: string; // '17:00'
  unpaidBreakMinutes: number; // e.g. 60 min
}

export interface MonthlySummary {
  monthKey: string; // 'YYYY-MM'
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalHours: number;
  totalRegularEarnings: number;
  totalOvertimeEarnings: number;
  totalEarnings: number;
  recordCount: number;
}
