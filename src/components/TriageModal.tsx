import React from 'react';
import { Patient } from '../types.ts';
import { X, AlertTriangle, Stethoscope, ArrowRight, ShieldAlert } from 'lucide-react';

interface TriageModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConsultation: (patient: Patient) => void;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  patient,
  isOpen,
  onClose,
  onOpenConsultation,
}) => {
  if (!isOpen || !patient) return null;

  const result = patient.triageResult;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Triage Assessment · Token {patient.tokenNumber}
              </h3>
              <span className="text-xs text-slate-500">
                {patient.name} · {patient.age}y {patient.sex.toUpperCase()} · Registered {patient.registeredAt}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Urgency Badge */}
          <div className={`p-4 rounded-lg text-white ${
            patient.triageLevel <= 2 ? 'bg-rose-600' : patient.triageLevel === 3 ? 'bg-amber-600' : 'bg-blue-600'
          }`}>
            <div className="text-xs uppercase font-mono tracking-wider opacity-90">Emergency Severity Index</div>
            <div className="text-xl font-bold">ESI Level {patient.triageLevel} · {result?.urgencyTitle || 'Urgent'}</div>
            <p className="text-xs mt-2 opacity-95">
              {result?.clinicalRationale || 'Physiological review indicated; target examination under clinical supervision.'}
            </p>
          </div>

          {/* Vitals Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">BP</span>
              <strong className="text-slate-900">{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Heart Rate</span>
              <strong className="text-slate-900">{patient.vitals.heartRate} bpm</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">SpO2</span>
              <strong className="text-slate-900">{patient.vitals.spo2}%</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Temp</span>
              <strong className="text-slate-900">{patient.vitals.temp}°C</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Resp Rate</span>
              <strong className="text-slate-900">{patient.vitals.respiratoryRate}/min</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Pain</span>
              <strong className="text-slate-900">{patient.vitals.painScore}/10</strong>
            </div>
          </div>

          {/* Red Flags if any */}
          {result?.redFlags && result.redFlags.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Detected Red Flag Indicators:</span>
              </div>
              <ul className="list-disc list-inside text-rose-900 pl-1">
                {result.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Differentials */}
          {result?.differentials && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Differential Diagnoses Match
              </h4>
              <div className="space-y-2">
                {result.differentials.map(diff => (
                  <div key={diff.id} className="p-3 border border-slate-200 rounded-md text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{diff.name}</span>
                      <span className="text-blue-700 font-mono">{diff.probability}%</span>
                    </div>
                    <p className="text-slate-600">{diff.summary}</p>
                    <div className="text-slate-800 bg-slate-50 p-1.5 rounded">
                      <strong>Action:</strong> {diff.recommendedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Department and Tests */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Assigned: <strong>{patient.assignedDoctor}</strong> ({patient.department})
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenConsultation(patient);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Open Doctor Station</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
