import React, { useState } from 'react';
import { Patient, Department, PatientStatus } from '../types.ts';
import { 
  Search, 
  Volume2, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  UserCheck
} from 'lucide-react';
import { announceToken } from '../utils/audioAnnouncer.ts';

interface QueueViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onUpdateStatus: (patientId: string, newStatus: PatientStatus) => void;
  onOpenTriageModal: (patient: Patient) => void;
  onQuickIntake: () => void;
}

export const QueueView: React.FC<QueueViewProps> = ({
  patients,
  onSelectPatient,
  onUpdateStatus,
  onOpenTriageModal,
  onQuickIntake,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [callingToken, setCallingToken] = useState<string | null>(null);

  // Departments list for filters
  const departments: Department[] = [
    'Emergency & Acute Care',
    'General Medicine',
    'Cardiology',
    'Pulmonology',
    'Gastroenterology',
    'Orthopedics',
  ];

  // Filtering
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'all' || p.department === selectedDept;

    let matchesStatus = true;
    if (selectedStatus === 'active') {
      matchesStatus = p.status !== 'completed';
    } else if (selectedStatus !== 'all') {
      matchesStatus = p.status === selectedStatus;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Sort by Triage Level (1 & 2 first) and then status
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    // Completed goes to bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    // Lower ESI number = higher urgency
    if (a.triageLevel !== b.triageLevel) {
      return a.triageLevel - b.triageLevel;
    }
    return a.tokenNumber.localeCompare(b.tokenNumber);
  });

  // Urgency badge styles according to ESI standard
  const getEsiBadge = (level: number) => {
    switch (level) {
      case 1:
        return {
          bg: 'bg-rose-600 text-white',
          border: 'border-rose-600',
          text: 'ESI 1 · Resuscitation (Immediate)',
          accent: 'text-rose-600',
        };
      case 2:
        return {
          bg: 'bg-amber-600 text-white',
          border: 'border-amber-600',
          text: 'ESI 2 · Emergent (< 15 min)',
          accent: 'text-amber-600',
        };
      case 3:
        return {
          bg: 'bg-amber-100 text-amber-900 border border-amber-300',
          border: 'border-amber-400',
          text: 'ESI 3 · Urgent (< 30 min)',
          accent: 'text-amber-700',
        };
      case 4:
        return {
          bg: 'bg-blue-50 text-blue-800 border border-blue-200',
          border: 'border-blue-300',
          text: 'ESI 4 · Less Urgent',
          accent: 'text-blue-700',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border border-slate-200',
          border: 'border-slate-300',
          text: 'ESI 5 · Non-Urgent',
          accent: 'text-slate-600',
        };
    }
  };

  const handleCallToken = async (patient: Patient) => {
    setCallingToken(patient.tokenNumber);
    await announceToken(patient.tokenNumber, patient.consultationRoom, patient.name);
    setTimeout(() => {
      setCallingToken(null);
    }, 3500);
  };

  const activeCount = patients.filter(p => p.status !== 'completed').length;
  const criticalCount = patients.filter(p => p.status !== 'completed' && p.triageLevel <= 2).length;
  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  const inConsultationCount = patients.filter(p => p.status === 'consultation').length;
  const completedCount = patients.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="text-xs font-medium text-slate-500">Active Queue</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{activeCount}</span>
            <span className="text-xs text-slate-500">patients</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="text-xs font-medium text-slate-500">Waiting for Doctor</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 tabular-nums">{waitingCount}</span>
            <span className="text-xs text-blue-600">in waiting bay</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="text-xs font-medium text-slate-500">High Urgency (ESI 1-2)</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {criticalCount}
            </span>
            <span className="text-xs text-rose-600">priority cases</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="text-xs font-medium text-slate-500">In Consultation</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">{inConsultationCount}</span>
            <span className="text-xs text-slate-500">with physicians</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
          <div className="text-xs font-medium text-slate-500">Completed Encounters</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-700 tabular-nums">{completedCount}</span>
            <span className="text-xs text-slate-500">discharged today</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Token (e.g. C-01), Patient Name, or Complaint..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md shrink-0">
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedStatus === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setSelectedStatus('waiting')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedStatus === 'waiting' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting
            </button>
            <button
              onClick={() => setSelectedStatus('consultation')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedStatus === 'consultation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Room
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedStatus === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({patients.length})
            </button>
          </div>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-400 shrink-0 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Clinic:</span>
          </div>
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap cursor-pointer transition-colors ${
              selectedDept === 'all'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap cursor-pointer transition-colors ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Queue Cards List */}
      <div className="space-y-3">
        {sortedPatients.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-800">No Patients in Selected Filter</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no patients matching your search criteria or department filter.
            </p>
            <button
              onClick={onQuickIntake}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Register New Patient
            </button>
          </div>
        ) : (
          sortedPatients.map(patient => {
            const esi = getEsiBadge(patient.triageLevel);
            const isAbnormalBp = patient.vitals.bpSystolic > 140 || patient.vitals.bpSystolic < 90;
            const isAbnormalSpo2 = patient.vitals.spo2 > 0 && patient.vitals.spo2 < 95;
            const isFever = patient.vitals.temp >= 38.0;
            const isHighPain = patient.vitals.painScore >= 7;

            return (
              <div
                key={patient.id}
                className={`bg-white border rounded-lg p-4 transition-all hover:shadow-xs ${
                  patient.triageLevel === 1
                    ? 'border-rose-400 bg-rose-50/20'
                    : patient.triageLevel === 2
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Token + Patient Info */}
                  <div className="flex items-start gap-4">
                    {/* Token Number Box */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-slate-900 text-white shrink-0 shadow-xs">
                      <span className="text-xs text-slate-400 font-mono">TOKEN</span>
                      <span className="text-lg font-bold font-mono tracking-tight">{patient.tokenNumber}</span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onSelectPatient(patient)}>
                          {patient.name}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {patient.age}y · {patient.sex.toUpperCase()} · Blood {patient.bloodGroup}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${esi.bg}`}>
                          {esi.text}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium line-clamp-1">
                        <span className="text-slate-400 mr-1">Complaint:</span>
                        {patient.chiefComplaint}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                        <span>Clinic: <strong className="text-slate-700">{patient.department}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Room: <strong className="text-slate-700">{patient.consultationRoom}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Doctor: <strong className="text-slate-700">{patient.assignedDoctor}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Registered: {patient.registeredAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Vitals Overview Strip */}
                  <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 rounded-md p-2 lg:self-center shrink-0">
                    <div className="px-2 text-center border-r border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">BP (mmHg)</div>
                      <div className={`font-mono font-semibold tabular-nums ${isAbnormalBp ? 'text-rose-600' : 'text-slate-800'}`}>
                        {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                      </div>
                    </div>
                    <div className="px-2 text-center border-r border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Pulse</div>
                      <div className="font-mono font-semibold tabular-nums text-slate-800">
                        {patient.vitals.heartRate} bpm
                      </div>
                    </div>
                    <div className="px-2 text-center border-r border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">SpO2</div>
                      <div className={`font-mono font-semibold tabular-nums ${isAbnormalSpo2 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {patient.vitals.spo2}%
                      </div>
                    </div>
                    <div className="px-2 text-center border-r border-slate-200">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Temp</div>
                      <div className={`font-mono font-semibold tabular-nums ${isFever ? 'text-amber-600' : 'text-slate-800'}`}>
                        {patient.vitals.temp}°C
                      </div>
                    </div>
                    <div className="px-2 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Pain</div>
                      <div className={`font-mono font-semibold tabular-nums ${isHighPain ? 'text-rose-600' : 'text-slate-800'}`}>
                        {patient.vitals.painScore}/10
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status & Operational Controls */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Public Address Call Token Chime */}
                    <button
                      onClick={() => handleCallToken(patient)}
                      disabled={callingToken === patient.tokenNumber}
                      title="Announce token on Public Address audio system"
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                        callingToken === patient.tokenNumber
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{callingToken === patient.tokenNumber ? 'Calling...' : 'Call Token'}</span>
                    </button>

                    {/* Triage Protocol View */}
                    <button
                      onClick={() => onOpenTriageModal(patient)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                      title="View Clinical Triage & Differential Diagnosis"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Triage</span>
                    </button>

                    {/* Doctor Encounter Button */}
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Consultation</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {/* Status quick toggle */}
                    <select
                      value={patient.status}
                      onChange={e => onUpdateStatus(patient.id, e.target.value as PatientStatus)}
                      className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="waiting">Waiting</option>
                      <option value="consultation">In Room</option>
                      <option value="diagnostics">In Lab/X-Ray</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
