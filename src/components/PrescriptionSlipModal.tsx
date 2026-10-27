import React from 'react';
import { Patient } from '../types.ts';
import { X, Printer, Activity, CheckCircle2 } from 'lucide-react';

interface PrescriptionSlipModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionSlipModal: React.FC<PrescriptionSlipModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[95vh] overflow-y-auto my-auto">
        {/* Actions bar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500 font-medium">
            Medical Record Slip · Token <strong className="text-slate-800">{patient.tokenNumber}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Prescription</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Body */}
        <div id="printable-prescription" className="p-8 space-y-6 text-slate-900 bg-white">
          {/* Hospital Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xl">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight uppercase text-slate-900">
                  St. Jude Metropolitan Hospital
                </h2>
                <div className="text-xs text-slate-600">
                  Outpatient Department (OPD) & Specialized Ambulatory Center
                </div>
                <div className="text-[11px] text-slate-500">
                  742 Academic Health Sciences Blvd, Metro District · Ph: +1 (555) 019-4800
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <div className="text-slate-500 text-[10px] uppercase font-bold">OPD Token #</div>
              <div className="text-xl font-bold text-blue-700">{patient.tokenNumber}</div>
              <div className="text-slate-400 text-[10px]">MRN: {patient.id}</div>
            </div>
          </div>

          {/* Patient Details & Vitals Strip */}
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Patient Name:</span>
              <strong className="text-slate-900 text-sm">{patient.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Age / Biological Sex:</span>
              <span>{patient.age} Years / {patient.sex.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Blood Group & Allergies:</span>
              <span className={patient.allergies.length > 0 ? 'text-rose-700 font-bold' : ''}>
                {patient.bloodGroup} · {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No known allergies'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Encounter Date:</span>
              <span>{today}</span>
            </div>
          </div>

          {/* Clinical Vitals at Presentation */}
          <div className="flex items-center justify-between text-xs py-2 px-3 bg-white border border-slate-200 rounded text-slate-700 font-mono">
            <span>BP: <strong>{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic} mmHg</strong></span>
            <span>Pulse: <strong>{patient.vitals.heartRate} bpm</strong></span>
            <span>SpO2: <strong>{patient.vitals.spo2}%</strong></span>
            <span>Temp: <strong>{patient.vitals.temp}°C</strong></span>
            <span>RR: <strong>{patient.vitals.respiratoryRate}/min</strong></span>
            <span>Pain: <strong>{patient.vitals.painScore}/10</strong></span>
          </div>

          {/* Clinical Assessment & Diagnosis */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Impression / Assessment</div>
            <div className="text-sm font-bold text-slate-900 p-2.5 bg-blue-50/50 border border-blue-100 rounded">
              {patient.soapNote?.assessment || patient.chiefComplaint}
            </div>
          </div>

          {/* Official Rx Medication Prescription Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-1">
              <span className="text-base font-serif italic text-blue-700">℞</span>
              <span>Prescription Orders</span>
            </div>

            {patient.prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No oral/parenteral medications prescribed during this visit.</p>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
                    <th className="py-2">#</th>
                    <th className="py-2">Medication / Generic</th>
                    <th className="py-2">Dosage</th>
                    <th className="py-2">Route</th>
                    <th className="py-2">Frequency</th>
                    <th className="py-2">Duration</th>
                    <th className="py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {patient.prescriptions.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="py-2 text-slate-400">{idx + 1}</td>
                      <td className="py-2 font-bold text-slate-900">{p.drugName}</td>
                      <td className="py-2 text-blue-700 font-mono">{p.dosage}</td>
                      <td className="py-2 text-slate-600">{p.route}</td>
                      <td className="py-2 text-slate-800">{p.frequency}</td>
                      <td className="py-2 text-slate-800">{p.duration}</td>
                      <td className="py-2 text-slate-600 italic">{p.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Lab Orders if any */}
          {patient.labOrders.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Laboratory & Diagnostic Imaging Requisition
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.labOrders.map(lo => (
                  <span key={lo.id} className="text-xs px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                    {lo.testName} ({lo.urgency})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Advice and Follow-up */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Special Dietary & Lifestyle Instructions:</span>
              <p className="text-slate-600">{patient.soapNote?.dietaryAdvice || 'Balanced diet with proper hydration.'}</p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Review / Next Appointment:</span>
              <p className="text-slate-600">{patient.soapNote?.followUp || 'As scheduled or if symptoms worsen.'}</p>
            </div>
          </div>

          {/* Signoff & Stamp */}
          <div className="pt-8 flex items-end justify-between text-xs border-t border-slate-200">
            <div>
              <div className="text-slate-400 text-[10px]">VERIFICATION CODE</div>
              <div className="font-mono text-xs text-slate-700">QR-SJM-{patient.id}-{patient.tokenNumber}</div>
              <div className="text-[10px] text-slate-400 mt-1">This medical slip is legally validated under OPD clinical governance.</div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-serif italic text-base text-blue-900">{patient.assignedDoctor}</div>
              <div className="text-xs font-semibold text-slate-800">{patient.department} Clinic</div>
              <div className="text-[10px] text-slate-500">MD, State Medical Board Reg # 48201-B</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
