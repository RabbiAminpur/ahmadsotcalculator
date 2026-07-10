import React from 'react';
import { OvertimeRecord, UserSettings } from '../types';
import { formatDate, decimalToHoursMinutesStr } from '../utils/timeCalculations';
import { Trash2, Edit3, Calendar, Clock, MessageSquare, ClipboardList } from 'lucide-react';

interface LogListProps {
  records: OvertimeRecord[];
  settings: UserSettings;
  selectedMonth: string;
  onEdit: (record: OvertimeRecord) => void;
  onDelete: (id: string) => void;
}

export default function LogList({ records, settings, selectedMonth, onEdit, onDelete }: LogListProps) {
  // Filter for the chosen month and sort by date descending (newest first)
  const monthRecords = records
    .filter((r) => r.date.startsWith(selectedMonth))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (monthRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center">
        <ClipboardList className="w-10 h-10 text-slate-700 mb-2" />
        <p className="text-slate-400 text-sm font-medium">No hours logged for this month</p>
        <p className="text-slate-500 text-xs mt-1">Select another month or use the form above to add logs!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-500" /> Daily Logs ({monthRecords.length})
        </h3>
        <span className="text-[10px] text-slate-500">Showing newest first</span>
      </div>

      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
        {monthRecords.map((record) => {
          const hasOvertime = record.overtimeHours > 0;

          return (
            <div
              key={record.id}
              className="bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/80 rounded-xl p-3.5 transition-all shadow-md flex flex-col gap-2.5 group"
            >
              {/* Header: Date & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-850 py-1 px-2.5 rounded-lg border border-slate-800 text-xs font-bold text-slate-300 font-mono">
                    {record.date.split('-')[2]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {formatDate(record.date)}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(record)}
                    className="p-1.5 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                    title="Edit entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete overtime log for ${formatDate(record.date)}?`)) {
                        onDelete(record.id);
                      }
                    }}
                    className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body: Hours Breakdown */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/45 p-2 rounded-lg border border-slate-900 text-center">
                {/* Morning/Closing times */}
                <div>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Clock Times</span>
                  <div className="flex items-center justify-center gap-0.5 text-[11px] text-slate-300 font-mono mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    <span>{record.morningTime} - {record.closingTime}</span>
                  </div>
                </div>

                {/* Regular Hours */}
                <div className="border-x border-slate-800/80">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Regular</span>
                  <span className="text-[11px] font-bold text-white font-mono mt-0.5 block">
                    {decimalToHoursMinutesStr(record.regularHours)}
                  </span>
                </div>

                {/* Overtime Hours */}
                <div>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Overtime</span>
                  <span className={`text-[11px] font-bold font-mono mt-0.5 block ${
                    hasOvertime ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {hasOvertime ? decimalToHoursMinutesStr(record.overtimeHours) : '0h'}
                  </span>
                </div>
              </div>

              {/* Earnings & Note footer */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-950/20">
                <div className="flex items-center gap-1 text-slate-400 max-w-[60%] overflow-hidden">
                  {record.notes ? (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="truncate italic text-[11px] text-slate-400" title={record.notes}>
                        {record.notes}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">No notes</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total Earnings</span>
                  <span className="font-bold text-white font-mono text-[13px]">
                    {settings.currency}
                    {record.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
