import React, { useState, useEffect } from 'react';
import { OvertimeRecord, UserSettings } from './types';
import {
  computeMonthlySummaries,
  decimalToHoursMinutesStr,
  formatMonthKey,
  calculateDailyMetrics,
} from './utils/timeCalculations';
import { defaultSettings, getSampleRecords } from './utils/sampleData';

// Subcomponents
import MetricCard from './components/MetricCard';
import SettingsModal from './components/SettingsModal';
import QuickAddForm from './components/QuickAddForm';
import OvertimeChart from './components/OvertimeChart';
import LogList from './components/LogList';

// Icons
import {
  Settings,
  Download,
  RotateCcw,
  Clock,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Plus,
  Moon,
  Info
} from 'lucide-react';

export default function App() {
  // State Initialization
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('ahmad_ot_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [records, setRecords] = useState<OvertimeRecord[]>(() => {
    const saved = localStorage.getItem('ahmad_ot_records');
    return saved ? JSON.parse(saved) : getSampleRecords(defaultSettings);
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-07'); // Default to July 2026
  const [editingRecord, setEditingRecord] = useState<OvertimeRecord | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ahmad_ot_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ahmad_ot_records', JSON.stringify(records));
  }, [records]);

  // Clock display for mobile feel
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate all records when user settings (e.g. rate or multiplier) change
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    setRecords((prev) =>
      prev.map((r) => {
        const updatedMetrics = calculateDailyMetrics(r.morningTime, r.closingTime, newSettings);
        return {
          ...r,
          ...updatedMetrics,
        };
      })
    );
  };

  // Add or update a record
  const handleAddOrUpdateRecord = (newRecord: OvertimeRecord) => {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === newRecord.id);
      if (exists) {
        // Update
        return prev.map((r) => (r.id === newRecord.id ? newRecord : r));
      } else {
        // Create new
        return [...prev, newRecord];
      }
    });
    setEditingRecord(undefined); // Clear active edit state
  };

  // Delete a record
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (editingRecord && editingRecord.id === id) {
      setEditingRecord(undefined);
    }
  };

  // Trigger editing a record
  const handleTriggerEdit = (record: OvertimeRecord) => {
    setEditingRecord(record);
    // Ensure form is visible
    setShowQuickAdd(true);
    // Scroll smoothly to form
    const formElement = document.getElementById('log-hours-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Reset to default sample records
  const handleResetData = () => {
    if (
      confirm(
        'Are you sure you want to restore the default sample data? This will overwrite your current logs.'
      )
    ) {
      setRecords(getSampleRecords(settings));
      setEditingRecord(undefined);
      setSelectedMonth('2026-07');
    }
  };

  // Export selected month to CSV
  const handleExportCSV = () => {
    const monthRecords = records
      .filter((r) => r.date.startsWith(selectedMonth))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (monthRecords.length === 0) {
      alert('No logs available to export for the selected month!');
      return;
    }

    const headers = [
      'Date',
      'Morning Time (In)',
      'Closing Time (Out)',
      'Total Hours Worked',
      'Regular Hours',
      'Overtime Hours',
      `Regular Earnings (${settings.currency})`,
      `Overtime Earnings (${settings.currency})`,
      `Total Earnings (${settings.currency})`,
      'Notes',
    ];

    const rows = monthRecords.map((r) => [
      r.date,
      r.morningTime,
      r.closingTime,
      r.totalHours,
      r.regularHours,
      r.overtimeHours,
      r.regularEarnings,
      r.overtimeEarnings,
      r.totalEarnings,
      r.notes || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ahmads_Overtime_Payroll_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get available months represented in records for filter tabs
  const getAvailableMonths = () => {
    const months = new Set<string>();
    // Make sure June and July 2026 are always visible even if records are cleared
    months.add('2026-06');
    months.add('2026-07');
    records.forEach((r) => {
      months.add(r.date.substring(0, 7));
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a)); // Newest months first
  };

  const availableMonths = getAvailableMonths();

  // Compute stats for current selection
  const monthlySummaries = computeMonthlySummaries(records);
  const currentSummary = monthlySummaries[selectedMonth] || {
    totalRegularHours: 0,
    totalOvertimeHours: 0,
    totalHours: 0,
    totalRegularEarnings: 0,
    totalOvertimeEarnings: 0,
    totalEarnings: 0,
    recordCount: 0,
  };

  // Switch month helper
  const handleShiftMonth = (direction: 'prev' | 'next') => {
    const currentIdx = availableMonths.indexOf(selectedMonth);
    if (direction === 'prev' && currentIdx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIdx + 1]);
    } else if (direction === 'next' && currentIdx > 0) {
      setSelectedMonth(availableMonths[currentIdx - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-0 sm:py-8 px-0 sm:px-4 text-slate-100 select-none antialiased">
      {/* Decorative desktop ambient light spots */}
      <div className="hidden sm:block absolute top-12 left-1/4 w-[30rem] h-[30rem] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-12 right-1/4 w-[24rem] h-[24rem] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Main Responsive Container */}
      <div className="relative w-full sm:max-w-md bg-slate-950 sm:bg-slate-950 sm:border-8 sm:border-slate-900 rounded-none sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-screen sm:h-[860px]">
        
        {/* Smartphone top details (Only shown on wider screens simulating a mobile) */}
        <div className="hidden sm:flex justify-center items-center h-6 bg-slate-900 text-slate-500 text-[10px] select-none shrink-0 border-b border-slate-950">
          <div className="w-24 h-4 bg-black rounded-b-xl absolute top-0 flex justify-center items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-850 mr-1.5"></span>
            <span className="w-10 h-1 bg-slate-850 rounded-full"></span>
          </div>
          <div className="flex justify-between w-full px-6 font-mono text-[9px] text-slate-400">
            <span>Ahmad's OT</span>
            <span>2026-07-09</span>
          </div>
        </div>

        {/* Mobile Header Bar inside the app */}
        <header className="bg-slate-950 px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 border border-emerald-500/10">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1">
                Ahmad's OverTime
                <span className="text-[10px] bg-slate-900 text-slate-400 font-semibold px-1.5 py-0.5 rounded border border-slate-800">Mobile Only</span>
              </h1>
              <p className="text-[10px] text-slate-400">Payroll & Overtime Ledger</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow-md flex items-center justify-center active:scale-95"
            title="Configure settings"
            id="settings_button"
          >
            <Settings className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable Container (Main Mobile Frame Content) */}
        <div className="flex-1 overflow-y-auto pb-8 space-y-5 px-4 pt-4 scroll-smooth">
          
          {/* Calendar Month Carousel / Selector */}
          <div className="flex items-center justify-between bg-slate-900/40 border border-slate-900 p-2 rounded-2xl">
            <button
              onClick={() => handleShiftMonth('prev')}
              disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
              className="p-2 bg-slate-900 hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none text-slate-300 rounded-xl transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Viewing Pay Month</span>
              <span className="text-sm font-bold text-white font-mono">
                {formatMonthKey(selectedMonth)}
              </span>
            </div>

            <button
              onClick={() => handleShiftMonth('next')}
              disabled={availableMonths.indexOf(selectedMonth) === 0}
              className="p-2 bg-slate-900 hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none text-slate-300 rounded-xl transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <section className="grid grid-cols-2 gap-3">
            <MetricCard
              title="Est. Monthly Pay"
              value={`${settings.currency}${currentSummary.totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              subtext="Total computed income"
              icon={DollarSign}
              variant="emerald"
            />
            <MetricCard
              title="OT Cash Earned"
              value={`${settings.currency}${currentSummary.totalOvertimeEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              subtext={`Rate: ${settings.currency}${settings.overtimeRateType === 'multiplier' ? (settings.hourlyRate * settings.overtimeMultiplier).toFixed(2) : settings.flatOvertimeRate.toFixed(2)}/hr`}
              icon={TrendingUp}
              variant="amber"
            />
            <MetricCard
              title="Overtime Hours"
              value={decimalToHoursMinutesStr(currentSummary.totalOvertimeHours)}
              subtext="Accumulated OT"
              icon={Clock}
              variant="blue"
            />
            <MetricCard
              title="Worked Days"
              value={`${currentSummary.recordCount} Days`}
              subtext="Logged in history"
              icon={CalendarDays}
              variant="slate"
            />
          </section>

          {/* Intuitive Data Visualization */}
          <section>
            <OvertimeChart
              records={records}
              selectedMonth={selectedMonth}
              currency={settings.currency}
            />
          </section>

          {/* Direct Actions Exporter Panel */}
          <section className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Monthly CSV
            </button>
            <button
              onClick={handleResetData}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              Reset Demo Data
            </button>
          </section>

          {/* Interactive Collapse Toggle for logging hours */}
          <section className="border-t border-slate-900/60 pt-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
              >
                <Plus className={`w-4 h-4 text-emerald-400 transition-transform duration-300 ${showQuickAdd ? 'rotate-45' : ''}`} />
                <span>{showQuickAdd ? 'Hide Input Fields' : 'Log New Overtime'}</span>
              </button>
              <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Shift: 8AM - 5PM
              </span>
            </div>

            {showQuickAdd && (
              <div id="log-hours-form" className="animate-fade-in">
                <QuickAddForm
                  settings={settings}
                  onAddRecord={handleAddOrUpdateRecord}
                  existingRecordForDate={
                    editingRecord || records.find((r) => r.id === new Date().toISOString().split('T')[0])
                  }
                />
              </div>
            )}
          </section>

          {/* Logs History */}
          <section className="border-t border-slate-900/60 pt-4">
            <LogList
              records={records}
              settings={settings}
              selectedMonth={selectedMonth}
              onEdit={handleTriggerEdit}
              onDelete={handleDeleteRecord}
            />
          </section>

          {/* Interactive footer details */}
          <footer className="text-center space-y-1 py-2 bg-slate-900/20 border border-slate-900/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Designed with 💖 for Ahmad's personal use.</span>
            </p>
            <p className="text-[9px] text-slate-600">
              Vercel & GitHub compatible • Pure Offline Client Persistence
            </p>
          </footer>

        </div>

        {/* Smartphone Virtual Home Indicator (Simulation) */}
        <div className="hidden sm:block h-5 bg-slate-900 select-none shrink-0 relative">
          <div className="w-32 h-1 bg-slate-600 rounded-full absolute bottom-1.5 left-1/2 -translate-x-1/2"></div>
        </div>

      </div>

      {/* Settings Panel Modal Component */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
