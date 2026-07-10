import React, { useState } from 'react';
import { UserSettings } from '../types';
import { X, Save, DollarSign, Clock, HelpCircle, Briefcase } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [hourlyRate, setHourlyRate] = useState(settings.hourlyRate);
  const [overtimeRateType, setOvertimeRateType] = useState(settings.overtimeRateType);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(settings.overtimeMultiplier);
  const [flatOvertimeRate, setFlatOvertimeRate] = useState(settings.flatOvertimeRate);
  const [currency, setCurrency] = useState(settings.currency);
  const [unpaidBreakMinutes, setUnpaidBreakMinutes] = useState(settings.unpaidBreakMinutes);
  const [defaultMorningTime, setDefaultMorningTime] = useState(settings.defaultMorningTime);
  const [defaultClosingTime, setDefaultClosingTime] = useState(settings.defaultClosingTime);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      hourlyRate: Number(hourlyRate) || 0,
      overtimeRateType,
      overtimeMultiplier: Number(overtimeMultiplier) || 1,
      flatOvertimeRate: Number(flatOvertimeRate) || 0,
      currency: currency || '$',
      unpaidBreakMinutes: Number(unpaidBreakMinutes) || 0,
      defaultMorningTime: defaultMorningTime || '08:00',
      defaultClosingTime: defaultClosingTime || '17:00',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[92vh] z-10 animate-slide-up">
        {/* Drag handle for mobile visual */}
        <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-4 sm:hidden"></div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Payroll Settings</h2>
              <p className="text-xs text-slate-400">Configure your wage rates & standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rate & Currency Section */}
          <div className="bg-slate-950/40 p-4 border border-slate-800/60 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Wage Settings
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Hourly Base Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-mono">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  maxLength={4}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Overtime Type Selection */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Overtime Rate Model</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setOvertimeRateType('multiplier')}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                    overtimeRateType === 'multiplier'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Multiplier (e.g. 1.5x)
                </button>
                <button
                  type="button"
                  onClick={() => setOvertimeRateType('flat')}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                    overtimeRateType === 'flat'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Flat Hourly Rate
                </button>
              </div>
            </div>

            {/* Overtime Values based on selection */}
            {overtimeRateType === 'multiplier' ? (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Overtime Multiplier</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={overtimeMultiplier}
                    onChange={(e) => setOvertimeMultiplier(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500 bg-slate-950/60 py-0.5 px-2 rounded-md font-mono">
                    ={currency}{(hourlyRate * overtimeMultiplier).toFixed(2)}/hr
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Flat Overtime Rate / hour</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-mono">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={flatOvertimeRate}
                    onChange={(e) => setFlatOvertimeRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Shift & Schedule Defaults */}
          <div className="bg-slate-950/40 p-4 border border-slate-800/60 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Shift Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Morning Start (Shift)</label>
                <input
                  type="time"
                  value={defaultMorningTime}
                  onChange={(e) => setDefaultMorningTime(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Regular Shift Close</label>
                <input
                  type="time"
                  value={defaultClosingTime}
                  onChange={(e) => setDefaultClosingTime(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">Daily Unpaid Break (Minutes)</label>
                <span className="text-[10px] text-slate-500 font-mono">Deducted from regular hours</span>
              </div>
              <select
                value={unpaidBreakMinutes}
                onChange={(e) => setUnpaidBreakMinutes(Number(e.target.value))}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value={0}>No break (0m)</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour (60m)</option>
                <option value={90}>1.5 hours (90m)</option>
              </select>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Standard shifts run from <strong className="text-white">8:00 AM to 5:00 PM</strong>. Any work completed past 5:00 PM counts as overtime. These settings configure your currency representation and calculate daily wages immediately when logging.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/10"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
