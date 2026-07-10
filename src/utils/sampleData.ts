import { OvertimeRecord, UserSettings } from '../types';
import { calculateDailyMetrics } from './timeCalculations';

export const defaultSettings: UserSettings = {
  hourlyRate: 25,
  overtimeMultiplier: 1.5,
  overtimeRateType: 'multiplier',
  flatOvertimeRate: 37.5,
  currency: '$',
  defaultMorningTime: '08:00',
  defaultClosingTime: '17:00',
  unpaidBreakMinutes: 60, // 1 hour unpaid lunch
};

// Generates a list of realistic mock records for June and July 2026
export function getSampleRecords(settings: UserSettings): OvertimeRecord[] {
  const dates = [
    // June 2026 (Full month of records to show monthly tracking)
    { date: '2026-06-01', morning: '08:00', closing: '17:00', notes: 'Regular work day' },
    { date: '2026-06-02', morning: '07:55', closing: '18:30', notes: 'Client meeting overflow' },
    { date: '2026-06-04', morning: '08:00', closing: '17:45', notes: 'Clearing support tickets' },
    { date: '2026-06-05', morning: '08:05', closing: '19:00', notes: 'Server migration assistance' },
    { date: '2026-06-08', morning: '08:00', closing: '17:00', notes: 'Regular work day' },
    { date: '2026-06-10', morning: '07:50', closing: '18:15', notes: 'Database backup and check' },
    { date: '2026-06-12', morning: '08:00', closing: '20:30', notes: 'Urgent system debug and patch' },
    { date: '2026-06-15', morning: '08:10', closing: '17:30', notes: 'Minor task finalization' },
    { date: '2026-06-17', morning: '08:00', closing: '19:15', notes: 'Mid-month sprint review' },
    { date: '2026-06-18', morning: '08:00', closing: '17:00', notes: 'Regular work day' },
    { date: '2026-06-22', morning: '07:45', closing: '18:45', notes: 'Onboarding new team member' },
    { date: '2026-06-25', morning: '08:00', closing: '19:30', notes: 'Refactoring old legacy code' },
    { date: '2026-06-29', morning: '08:00', closing: '17:00', notes: 'Regular work day' },

    // July 2026 (Up to current local date July 9)
    { date: '2026-07-01', morning: '08:00', closing: '17:00', notes: 'Regular work day' },
    { date: '2026-07-02', morning: '08:00', closing: '18:15', notes: 'Q3 planning session extension' },
    { date: '2026-07-03', morning: '07:50', closing: '17:50', notes: 'Preparing end of week summary' },
    { date: '2026-07-06', morning: '08:00', closing: '19:00', notes: 'Production hotfix deploy' },
    { date: '2026-07-07', morning: '08:05', closing: '17:00', notes: 'Regular work day' },
    { date: '2026-07-08', morning: '08:00', closing: '18:45', notes: 'Answering client escalations' },
  ];

  return dates.map((d) => {
    const metrics = calculateDailyMetrics(d.morning, d.closing, settings);
    return {
      id: d.date,
      date: d.date,
      morningTime: d.morning,
      closingTime: d.closing,
      ...metrics,
      notes: d.notes,
    };
  });
}
