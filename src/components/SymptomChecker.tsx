import React, { useState } from 'react';
import { Sex, Vitals, SymptomEvidence, TriageResult, Patient, Department } from '../types.ts';
import { assessTriage, COMMON_SYMPTOMS } from '../clinicalEngine.ts';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle,
  ArrowRight,
  BrainCircuit,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface SymptomCheckerProps {
  onEnrollPatient: (patient: Patient) => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onEnrollPatient }) => {
  const [age, setAge] = useState<number>(45);
  const [sex, setSex] = useState<Sex>('male');
  const [searchPhrase, setSearchPhrase] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [patientName, setPatientName] = useState('');

  // Vitals
  const [vitals, setVitals] = useState<Vitals>({
    bpSystolic: 130,
    bpDiastolic: 85,
    heartRate: 88,
    temp: 37.2,
    spo2: 97,
    respiratoryRate: 18,
    painScore: 5,
  });

  // Evidence list
  const [evidenceList, setEvidenceList] = useState<SymptomEvidence[]>([
    { id: 's_1', name: 'Chest Pain / Pressure', choice: 'present', severity: 'severe', duration: '2 hours', source: 'initial' },
    { id: 's_11', name: 'Profuse Cold Sweats / Diaphoresis', choice: 'present', severity: 'moderate', duration: '1 hour', source: 'initial' },
  ]);

  // Dynamic interview questions state
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, 'present' | 'absent'>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [triageReport, setTriageReport] = useState<TriageResult | null>(null);

  // Search filter
  const searchResults = searchPhrase.trim().length >= 2
    ? COMMON_SYMPTOMS.filter(
        s =>
          s.name.toLowerCase().includes(searchPhrase.toLowerCase()) ||
          s.synonyms.some(syn => syn.toLowerCase().includes(searchPhrase.toLowerCase())) ||
          s.category.toLowerCase().includes(searchPhrase.toLowerCase())
      )
    : [];

  const handleAddSymptom = (id: string, name: string) => {
    if (!evidenceList.some(e => e.id === id)) {
      setEvidenceList(prev => [
        ...prev,
        { id, name, choice: 'present', severity: 'moderate', duration: 'Acute' },
      ]);
    }
    setSearchPhrase('');
  };

  const handleToggleChoice = (id: string, choice: 'present' | 'absent' | 'unknown') => {
    setEvidenceList(prev =>
      prev.map(item => (item.id === id ? { ...item, choice } : item))
    );
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList(prev => prev.filter(item => item.id !== id));
  };

  // Run Triage calculation
  const handleAnalyze = async () => {
    setIsAiLoading(true);

    // Merge interview answers into evidence list
    const combinedEvidence = [...evidenceList];
    Object.entries(interviewAnswers).forEach(([qId, choice]) => {
      if (!combinedEvidence.some(e => e.id === qId)) {
        combinedEvidence.push({
          id: qId,
          name: qId.replace('q_', '').replace('_', ' '),
          choice,
          source: 'interview',
        });
      }
    });

    try {
      // First try calling our backend /api/diagnosis
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          sex,
          evidence: combinedEvidence.map(e => ({
            id: e.id,
            name: e.name,
            choice_id: e.choice,
            source: e.source || 'initial',
          })),
          chiefComplaint,
          vitals,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.esiLevel && result.differentials) {
          setTriageReport(result);
          setIsAiLoading(false);
          return;
        }
      }
    } catch {
      // Fallback seamlessly to client clinical engine
    }

    // High precision client-side engine evaluation
    const assessed = assessTriage(age, sex, vitals, combinedEvidence, chiefComplaint);
    setTriageReport(assessed);
    setIsAiLoading(false);
  };

  const handleEnroll = () => {
    if (!triageReport) return;
    const nameToUse = patientName.trim() || 'Triage Walk-in Patient';
    const dept = triageReport.recommendedDepartment;
    const tokenLetter = dept.charAt(0).toUpperCase();
    const randomNum = Math.floor(10 + Math.random() * 90);
    const tokenNumber = `${tokenLetter}-${randomNum}`;
    const id = `P-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const registeredAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let doctorName = 'Dr. Priya Patel (Room 102)';
    let roomName = 'Room 102 - Outpatient Clinic';

    if (dept === 'Cardiology') {
      doctorName = 'Dr. Marcus Vance (Room 101)';
      roomName = 'Room 101 - Cardiology Suite';
    } else if (dept === 'Emergency & Acute Care') {
      doctorName = 'Dr. Sarah Chen (Room 104)';
      roomName = 'Room 104 - Acute Surgical Bay';
    } else if (dept === 'Pulmonology') {
      doctorName = 'Dr. Elena Rostova (Room 103)';
      roomName = 'Room 103 - Respiratory Clinic';
    }

    const newPatient: Patient = {
      id,
      tokenNumber,
      name: nameToUse,
      age,
      sex,
      phone: '+1 (555) 555-0199',
      bloodGroup: 'O+',
      allergies: [],
      registeredAt,
      department: dept as Department,
      triageLevel: triageReport.esiLevel,
      status: 'waiting',
      assignedDoctor: doctorName,
      consultationRoom: roomName,
      chiefComplaint: chiefComplaint || evidenceList.map(e => e.name).join(', '),
      vitals,
      symptoms: evidenceList,
      triageResult: triageReport,
      prescriptions: [],
      labOrders: triageReport.suggestedInvestigations.map((inv, idx) => ({
        id: `lo_gen_${idx}`,
        testName: inv,
        category: inv.includes('ECG') ? 'Cardiology' : inv.includes('X-Ray') || inv.includes('Ultrasound') ? 'Radiology' : 'Biochemistry',
        urgency: triageReport.esiLevel <= 2 ? 'STAT' : 'Urgent',
        status: 'ordered',
      })),
    };

    onEnrollPatient(newPatient);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Clinical Symptom Analysis & Smart Triage
              </h3>
              <p className="text-xs text-slate-500">
                Dual-engine medical evaluation: verified clinical triage protocols + Gemini diagnostic reasoning.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={isAiLoading || evidenceList.length === 0}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all cursor-pointer ${
                isAiLoading || evidenceList.length === 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Triage...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Execute Clinical Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Inputs (Left) and Triage Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Demographics, Vitals, Symptoms, Interview */}
        <div className="lg:col-span-5 space-y-4">
          {/* Patient Demographics & Vitals */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Demographics & Vitals
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Patient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Johnathan Smith"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={e => setAge(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Sex</label>
                  <select
                    value={sex}
                    onChange={e => setSex(e.target.value as Sex)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vitals Input Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">BP (mmHg)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={vitals.bpSystolic}
                    onChange={e => setVitals({ ...vitals, bpSystolic: parseInt(e.target.value) || 0 })}
                    className="w-12 text-xs px-1.5 py-1 border border-slate-300 rounded font-mono tabular-nums text-center"
                  />
                  <span className="text-slate-400">/</span>
                  <input
                    type="number"
                    value={vitals.bpDiastolic}
                    onChange={e => setVitals({ ...vitals, bpDiastolic: parseInt(e.target.value) || 0 })}
                    className="w-12 text-xs px-1.5 py-1 border border-slate-300 rounded font-mono tabular-nums text-center"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Pulse / HR</span>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={e => setVitals({ ...vitals, heartRate: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-2 py-1 border border-slate-300 rounded font-mono tabular-nums"
                />
              </div>

              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">SpO2 %</span>
                <input
                  type="number"
                  value={vitals.spo2}
                  onChange={e => setVitals({ ...vitals, spo2: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-2 py-1 border border-slate-300 rounded font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Chief Presenting Complaint</label>
              <input
                type="text"
                placeholder="e.g. Sudden severe retrosternal pressure with diaphoresis..."
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Symptom Search & Evidence List */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Clinical Symptoms ({evidenceList.length})
            </h4>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search symptom (e.g. chest, dyspnea, fever, abdominal)..."
                value={searchPhrase}
                onChange={e => setSearchPhrase(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Dropdown Suggestions */}
            {searchResults.length > 0 && (
              <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-md bg-white divide-y divide-slate-100 shadow-sm">
                {searchResults.map(sym => (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => handleAddSymptom(sym.id, sym.name)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-medium text-slate-800">{sym.name}</span>
                    <span className="text-[10px] text-slate-400">{sym.category}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Evidence items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {evidenceList.map(item => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{item.name}</div>
                    {item.duration && (
                      <div className="text-[10px] text-slate-400">Duration: {item.duration}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Present / Absent toggle buttons */}
                    <button
                      type="button"
                      onClick={() => handleToggleChoice(item.id, 'present')}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${
                        item.choice === 'present'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleChoice(item.id, 'absent')}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${
                        item.choice === 'absent'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove symptom"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Diagnostic Interview Follow-up Questions */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Clinical Clarification Interview
              </h4>
              <span className="text-[10px] text-slate-400">Red-flag differentiation</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <p className="text-xs text-slate-800 font-medium">
                  Does the patient experience any radiation of discomfort to the neck, jaw, or left shoulder/arm?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInterviewAnswers({ ...interviewAnswers, q_radiation: 'present' })}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      interviewAnswers.q_radiation === 'present'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Yes, radiates
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewAnswers({ ...interviewAnswers, q_radiation: 'absent' })}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      interviewAnswers.q_radiation === 'absent'
                        ? 'bg-slate-700 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    No radiation
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <p className="text-xs text-slate-800 font-medium">
                  Is there any sudden onset focal weakness, facial droop, or difficulty speaking?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInterviewAnswers({ ...interviewAnswers, q_neuro: 'present' })}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      interviewAnswers.q_neuro === 'present'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Yes (Stroke code alert)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewAnswers({ ...interviewAnswers, q_neuro: 'absent' })}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      interviewAnswers.q_neuro === 'absent'
                        ? 'bg-slate-700 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    No neurological signs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Triage Report & Differential Diagnoses */}
        <div className="lg:col-span-7 space-y-4">
          {!triageReport ? (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
              <Stethoscope className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900">Ready for Clinical Evaluation</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Enter or modify patient vitals and symptoms on the left, then click <strong>"Execute Clinical Analysis"</strong> to generate a comprehensive Emergency Severity Index (ESI) triage level, differential diagnoses, and diagnostic test recommendations.
              </p>
              <button
                onClick={handleAnalyze}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                Run Triage Analysis Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ESI Triage Urgency Banner */}
              <div
                className={`rounded-lg p-5 border text-white ${
                  triageReport.esiLevel === 1
                    ? 'bg-rose-700 border-rose-800'
                    : triageReport.esiLevel === 2
                    ? 'bg-amber-600 border-amber-700'
                    : triageReport.esiLevel === 3
                    ? 'bg-amber-500 border-amber-600 text-slate-950'
                    : 'bg-blue-600 border-blue-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider opacity-80">
                      Emergency Severity Index (ESI) Triage Level
                    </div>
                    <div className="text-2xl font-bold tracking-tight">
                      ESI {triageReport.esiLevel}: {triageReport.urgencyTitle}
                    </div>
                    <div className="text-xs mt-1 opacity-90">
                      Target Time to Clinical Examination: <strong className="tabular-nums">{triageReport.targetWaitMinutes} minutes</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleEnroll}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Enrol & Queue Token</span>
                  </button>
                </div>

                <p className="text-xs mt-3 pt-3 border-t border-white/20">
                  <strong>Clinical Rationale:</strong> {triageReport.clinicalRationale}
                </p>
              </div>

              {/* Red Flags Alert Card if present */}
              {triageReport.redFlags && triageReport.redFlags.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Identified Clinical Red Flags & Life Threats ({triageReport.redFlags.length})</span>
                  </div>
                  <ul className="space-y-1 text-xs text-rose-900">
                    {triageReport.redFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Differential Diagnoses Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Calculated Differential Diagnoses
                  </h4>
                  <span className="text-xs text-slate-400">Ranked by diagnostic probability</span>
                </div>

                <div className="space-y-3">
                  {triageReport.differentials.map(diff => (
                    <div
                      key={diff.id}
                      className="p-3.5 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{diff.name}</span>
                          <span className="text-[11px] text-slate-500 font-medium">({diff.category})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            diff.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700'
                              : diff.severity === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {diff.severity.toUpperCase()}
                          </span>
                          <span className="text-xs font-mono font-bold text-blue-700 tabular-nums">
                            {diff.probability}% Match
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mb-2">{diff.summary}</p>

                      <div className="bg-slate-50 border border-slate-100 p-2 rounded text-xs text-slate-800">
                        <strong className="text-slate-900">Action:</strong> {diff.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Investigations */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recommended Diagnostic Workup & Investigations
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {triageReport.suggestedInvestigations.map((inv, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md font-medium"
                    >
                      {inv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
