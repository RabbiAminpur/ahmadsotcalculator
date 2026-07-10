import React, { useState, useEffect } from 'react';
import { UserSettings, OvertimeRecord } from '../types';
import { calculateDailyMetrics, decimalToHoursMinutesStr } from '../utils/timeCalculations';
import { Calendar, Clock, Plus, PenTool, Check, AlertCircle } from 'lucide-react';

interface QuickAddFormProps {
  settings: UserSettings;
  onAddRecord: (record: OvertimeRecord) => void;
  existingRecordForDate?: OvertimeRecord;
}

export default function QuickAddForm({ settings, onAddRecord, existingRecordForDate }: QuickAddFormProps) {
  // Default to today
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTodayString());
  const [morningTime, setMorningTime] = useState(settings.defaultMorningTime);
  const [closingTime, setClosingTime] = useState(settings.defaultClosingTime);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // If we change settings, update the default times
  useEffect(() => {
    if (!existingRecordForDate) {
      setMorningTime(settings.defaultMorningTime);
      setClosingTime(settings.defaultClosingTime);
    }
  }, [settings, existingRecordForDate]);

  // If there's an existing record for the selected date, let's populate it so the user is editing it!
  useEffect(() => {
    if (existingRecordForDate) {
      setMorningTime(existingRecordForDate.morningTime);
      setClosingTime(existingRecordForDate.closingTime);
      setNotes(existingRecordForDate.notes || '');
    } else {
      // Clear fields back to defaults
      setMorningTime(settings.defaultMorningTime);
      setClosingTime(settings.defaultClosingTime);
      setNotes('');
    }
  }, [existingRecordForDate, date, settings]);

  // Compute live calculations
  const liveMetrics = calculateDailyMetrics(morningTime, closingTime, settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const record: OvertimeRecord = {
      id: date,
      date,
      morningTime,
      closingTime,
      ...liveMetrics,
      notes: notes.trim(),
    };

    onAddRecord(record);
    setIsSuccess(true);
    
    // Clear notes if it was a new record
    if (!existingRecordForDate) {
      setNotes('');
    }

    setTimeout(() => {
      setIsSuccess(false);
    }, 2500);
  };

  return (
    <div className="bg-slate-900/75 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {existingRecordForDate ? 'Edit Logged Day' : 'Log Daily Overtime'}
          </h2>
          <p className="text-xs text-slate-400">
            {existingRecordForDate
              ? 'Updating hours for an already logged date'
              : 'Add your arrival and departure times'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Date Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Morning Time */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Morning Time (In)
            </label>
            <input
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Closing Time */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Closing Time (Out)
            </label>
            <input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Work</span>
            <span className="text-sm font-bold text-white font-mono">
              {decimalToHoursMinutesStr(liveMetrics.totalHours)}
            </span>
            {settings.unpaidBreakMinutes > 0 && (
              <span className="block text-[8px] text-slate-500">
                ({settings.unpaidBreakMinutes}m unpaid break)
              </span>
            )}
          </div>

          <div className="border-x border-slate-800/80">
            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Overtime</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {liveMetrics.overtimeHours > 0 ? decimalToHoursMinutesStr(liveMetrics.overtimeHours) : '0h'}
            </span>
            <span className="block text-[8px] text-emerald-500 font-semibold">
              {liveMetrics.overtimeHours > 0 ? 'Counted past 5:00 PM' : 'No overtime'}
            </span>
          </div>

          <div>
            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Est. Earnings</span>
            <span className="text-sm font-bold text-white font-mono">
              {settings.currency}
              {liveMetrics.totalEarnings.toLocaleString()}
            </span>
            <span className="block text-[8px] text-slate-400">
              {liveMetrics.overtimeEarnings > 0 ? (
                <span className="text-emerald-400">+{settings.currency}{liveMetrics.overtimeEarnings} OT</span>
              ) : (
                'Base shift rate'
              )}
            </span>
          </div>
        </div>

        {/* Notes input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5 text-slate-500" /> Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Worked on final report, client server fix"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {existingRecordForDate && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This date is already logged. Submitting will update the existing entry.</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
            isSuccess
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-400/5 hover:shadow-emerald-300/15'
          }`}
        >
          {isSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Logged Successfully!
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {existingRecordForDate ? 'Update Daily Log' : 'Save To Daily Logs'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
