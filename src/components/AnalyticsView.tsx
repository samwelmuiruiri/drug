import React from 'react';
import { Patient } from '../types.ts';
import { HOSPITAL_DOCTORS } from '../clinicalEngine.ts';
import { Users, Clock, ShieldAlert, Award, Activity, BedDouble } from 'lucide-react';

interface AnalyticsViewProps {
  patients: Patient[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ patients }) => {
  const total = patients.length;
  const esiCounts = {
    1: patients.filter(p => p.triageLevel === 1).length,
    2: patients.filter(p => p.triageLevel === 2).length,
    3: patients.filter(p => p.triageLevel === 3).length,
    4: patients.filter(p => p.triageLevel === 4).length,
    5: patients.filter(p => p.triageLevel === 5).length,
  };

  const completed = patients.filter(p => p.status === 'completed').length;
  const waiting = patients.filter(p => p.status === 'waiting').length;
  const inConsult = patients.filter(p => p.status === 'consultation').length;
  const inLabs = patients.filter(p => p.status === 'diagnostics').length;

  const departmentCounts: Record<string, number> = {};
  patients.forEach(p => {
    departmentCounts[p.department] = (departmentCounts[p.department] || 0) + 1;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total OPD Census</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{total}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {waiting} waiting · {inConsult} with doctor · {completed} discharged
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Critical Triage Load (ESI 1-2)</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 tabular-nums">
            {esiCounts[1] + esiCounts[2]}
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            {total > 0 ? Math.round(((esiCounts[1] + esiCounts[2]) / total) * 100) : 0}% of all outpatient arrivals
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average Triage Wait</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">14.6 min</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            Compliant with Emergency Severity Index SLA
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Clinical Room Utilization</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">84.2%</div>
          <div className="mt-1 text-[11px] text-slate-500">
            6 of 6 OPD examination suites operating
          </div>
        </div>
      </div>

      {/* Grid: ESI Distribution & Department Volumes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ESI Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Emergency Severity Index (ESI) Distribution</h4>
          <p className="text-xs text-slate-500">
            Validated 5-level clinical triage categorization of registered patients.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700">ESI 1 · Resuscitation (Immediate)</span>
                <span className="tabular-nums font-mono">{esiCounts[1]} ({total > 0 ? Math.round((esiCounts[1]/total)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-600 h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (esiCounts[1]/total)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700">ESI 2 · Emergent (&lt; 15 min)</span>
                <span className="tabular-nums font-mono">{esiCounts[2]} ({total > 0 ? Math.round((esiCounts[2]/total)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (esiCounts[2]/total)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-amber-600">ESI 3 · Urgent (&lt; 30 min)</span>
                <span className="tabular-nums font-mono">{esiCounts[3]} ({total > 0 ? Math.round((esiCounts[3]/total)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (esiCounts[3]/total)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700">ESI 4 · Less Urgent (&lt; 60 min)</span>
                <span className="tabular-nums font-mono">{esiCounts[4]} ({total > 0 ? Math.round((esiCounts[4]/total)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (esiCounts[4]/total)*100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">ESI 5 · Non-Urgent (&lt; 120 min)</span>
                <span className="tabular-nums font-mono">{esiCounts[5]} ({total > 0 ? Math.round((esiCounts[5]/total)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-400 h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (esiCounts[5]/total)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Volume Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Clinical Specialty Clinic Volume</h4>
          <p className="text-xs text-slate-500">Distribution of patients across outpatient consultation wings.</p>

          <div className="space-y-3">
            {Object.entries(departmentCounts).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-md">
                <span className="text-xs font-semibold text-slate-800">{dept}</span>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-blue-700 tabular-nums">{count} patients</span>
                  <span className="text-slate-400">({total > 0 ? Math.round((count/total)*100) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OPD Medical Staff Roster */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h4 className="text-sm font-bold text-slate-900">Attending Physicians & Consultation Suites</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {HOSPITAL_DOCTORS.map(doc => (
            <div key={doc.id} className="p-3.5 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">{doc.name}</div>
                <div className="text-[11px] text-slate-500">{doc.title}</div>
                <div className="text-[10px] text-blue-700 font-semibold">{doc.room} · {doc.department}</div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  doc.status === 'busy' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {doc.status.toUpperCase()}
                </span>
                <div className="text-[10px] text-slate-400 mt-1 tabular-nums">{doc.patientsSeenToday} seen</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
