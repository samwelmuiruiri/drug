import React from 'react';
import { Activity, Clock, ShieldAlert, Plus, Volume2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'queue' | 'registration' | 'symptom_checker' | 'consultation' | 'analytics';
  setActiveTab: (tab: 'queue' | 'registration' | 'symptom_checker' | 'consultation' | 'analytics') => void;
  waitingCount: number;
  criticalCount: number;
  onQuickRegister: () => void;
  onTestChime: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  waitingCount,
  criticalCount,
  onQuickRegister,
  onTestChime,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Top Banner Notice: Clinical Center Info */}
      <div className="bg-slate-900 text-slate-300 text-xs px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">St. Jude Metropolitan Hospital</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Outpatient Department (OPD) & Clinical Triage Wing</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-emerald-400 font-medium">Session: Morning Shift (08:00 - 14:00)</span>
        </div>
        <div className="flex items-center gap-4 tabular-nums">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Avg Wait: 18 min</span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 text-rose-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{criticalCount} Emergent Cases</span>
            </div>
          )}
          <button
            onClick={onTestChime}
            title="Test Public Address Chime & Speaker"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>PA Sound Check</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar: 3-Zone Contract */}
      <div className="px-6 py-3 flex items-center justify-between gap-8 max-w-7xl mx-auto">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
              OPD Clinical Triage
            </span>
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
              Level 1 Trauma & Academic Medical Center
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, clear active states) */}
        <nav className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            OPD Queue ({waitingCount})
          </button>
          <button
            onClick={() => setActiveTab('registration')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'registration'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Patient Intake
          </button>
          <button
            onClick={() => setActiveTab('symptom_checker')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'symptom_checker'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Smart Clinical Triage
          </button>
          <button
            onClick={() => setActiveTab('consultation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'consultation'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Consultation Station
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            OPD Census & Analytics
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickRegister}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Walk-In</span>
          </button>
        </div>
      </div>
    </header>
  );
};
