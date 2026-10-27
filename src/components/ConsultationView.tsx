import React, { useState } from 'react';
import { Patient, PrescriptionItem, LabOrder, SoapNote } from '../types.ts';
import { 
  FileText, 
  Pill, 
  FlaskConical, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  User, 
  Stethoscope,
  HeartPulse
} from 'lucide-react';

interface ConsultationViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onUpdatePatient: (updated: Patient) => void;
  onOpenPrescriptionSlip: (patient: Patient) => void;
}

export const ConsultationView: React.FC<ConsultationViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onUpdatePatient,
  onOpenPrescriptionSlip,
}) => {
  const patient = selectedPatient || patients[0];

  // Active section inside consultation: 'soap' | 'prescription' | 'labs'
  const [activeSection, setActiveSection] = useState<'soap' | 'prescription' | 'labs'>('soap');

  // Local SOAP state initialized from patient
  const [soap, setSoap] = useState<SoapNote>(
    patient?.soapNote || {
      subjective: `${patient?.age} y/o ${patient?.sex} presents with: ${patient?.chiefComplaint || 'Consultation review.'}`,
      objective: `BP: ${patient?.vitals.bpSystolic}/${patient?.vitals.bpDiastolic} mmHg, HR: ${patient?.vitals.heartRate} bpm, Temp: ${patient?.vitals.temp}°C, SpO2: ${patient?.vitals.spo2}%, RR: ${patient?.vitals.respiratoryRate}/min. Alert and oriented.`,
      assessment: patient?.triageResult?.differentials?.[0]?.name || 'Clinical Evaluation',
      plan: '1. Initiate targeted pharmacotherapy;\n2. Baseline investigations as ordered;\n3. Monitor clinical response in outpatient bay.',
      dietaryAdvice: 'Normal balanced diet with adequate oral hydration. Avoid excessive sodium/sugar.',
      followUp: 'Review in 7 days or immediately if warning symptoms escalate.',
    }
  );

  // New Rx form state
  const [newDrug, setNewDrug] = useState({
    drugName: 'Paracetamol',
    dosage: '500 mg',
    route: 'Oral' as PrescriptionItem['route'],
    frequency: 'TDS (3x/day)',
    duration: '5 days',
    instructions: 'Take after food with full glass of water',
  });

  // New Lab Order state
  const [newLabTest, setNewLabTest] = useState({
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology' as LabOrder['category'],
    urgency: 'Urgent' as LabOrder['urgency'],
  });

  const [savedNotification, setSavedNotification] = useState(false);

  if (!patient) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Patient Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select a patient from the OPD Queue to begin the doctor consultation encounter.</p>
      </div>
    );
  }

  // Allergy safety check
  const hasPenicillinAllergy = patient.allergies.some(a => a.toLowerCase().includes('penicillin'));
  const isPenicillinDrug = newDrug.drugName.toLowerCase().includes('amoxicillin') || newDrug.drugName.toLowerCase().includes('penicillin') || newDrug.drugName.toLowerCase().includes('ampicillin');
  const allergyWarning = hasPenicillinAllergy && isPenicillinDrug;

  const handleSaveSoap = () => {
    const updated = {
      ...patient,
      soapNote: soap,
      status: patient.status === 'waiting' ? 'consultation' : patient.status,
    };
    onUpdatePatient(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrug.drugName) return;

    const item: PrescriptionItem = {
      id: `rx_${Date.now()}`,
      drugName: newDrug.drugName,
      dosage: newDrug.dosage,
      route: newDrug.route,
      frequency: newDrug.frequency,
      duration: newDrug.duration,
      instructions: newDrug.instructions,
    };

    const updated = {
      ...patient,
      prescriptions: [...patient.prescriptions, item],
    };
    onUpdatePatient(updated);
  };

  const handleRemovePrescription = (id: string) => {
    const updated = {
      ...patient,
      prescriptions: patient.prescriptions.filter(p => p.id !== id),
    };
    onUpdatePatient(updated);
  };

  const handleAddLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order: LabOrder = {
      id: `lo_${Date.now()}`,
      testName: newLabTest.testName,
      category: newLabTest.category,
      urgency: newLabTest.urgency,
      status: 'ordered',
    };

    const updated = {
      ...patient,
      labOrders: [...patient.labOrders, order],
    };
    onUpdatePatient(updated);
  };

  const handleCompleteEncounter = () => {
    const now = new Date();
    const completedAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated: Patient = {
      ...patient,
      soapNote: soap,
      status: 'completed',
      completedAt,
    };
    onUpdatePatient(updated);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Patient Header Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Patient Selector and Details */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex flex-col items-center justify-center font-mono shrink-0 shadow-xs">
              <span className="text-[10px] text-blue-200">ROOM</span>
              <span className="text-sm font-bold">101</span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={patient.id}
                  onChange={e => {
                    const found = patients.find(p => p.id === e.target.value);
                    if (found) {
                      onSelectPatient(found);
                      if (found.soapNote) setSoap(found.soapNote);
                    }
                  }}
                  className="text-base font-bold text-slate-900 border-b border-dashed border-slate-400 bg-transparent pr-4 focus:outline-none cursor-pointer"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.tokenNumber} - {p.name} ({p.department} · {p.status.toUpperCase()})
                    </option>
                  ))}
                </select>

                <span className="text-xs text-slate-500 font-mono">
                  ID: {patient.id} · {patient.age}y · {patient.sex.toUpperCase()} · Blood {patient.bloodGroup}
                </span>

                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  patient.triageLevel <= 2 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  ESI {patient.triageLevel} Priority
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>Doctor: <strong>{patient.assignedDoctor}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Clinic: <strong>{patient.department}</strong></span>
                {patient.allergies.length > 0 && (
                  <span className="flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Allergies: {patient.allergies.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Vitals Summary Pill */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-mono tabular-nums shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">BP</span>
              <span className="font-semibold text-slate-800">{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}</span>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-[10px] text-slate-400 block uppercase">HR</span>
              <span className="font-semibold text-slate-800">{patient.vitals.heartRate}</span>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-[10px] text-slate-400 block uppercase">SpO2</span>
              <span className="font-semibold text-slate-800">{patient.vitals.spo2}%</span>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-[10px] text-slate-400 block uppercase">Temp</span>
              <span className="font-semibold text-slate-800">{patient.vitals.temp}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Doctor Station */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('soap')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeSection === 'soap'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SOAP Clinical Notes</span>
          </button>

          <button
            onClick={() => setActiveSection('prescription')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeSection === 'prescription'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Prescription Pad ({patient.prescriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('labs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeSection === 'labs'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Lab & Diagnostic Orders ({patient.labOrders.length})</span>
          </button>
        </div>

        {/* Global Consultation Action Buttons */}
        <div className="flex items-center gap-2">
          {savedNotification && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Notes Saved
            </span>
          )}

          <button
            onClick={() => onOpenPrescriptionSlip(patient)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Prescription Slip</span>
          </button>

          <button
            onClick={handleCompleteEncounter}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer ${
              patient.status === 'completed'
                ? 'bg-slate-200 text-slate-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{patient.status === 'completed' ? 'Completed' : 'Discharge & Complete'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SOAP NOTES */}
      {activeSection === 'soap' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Standard Clinical SOAP Encounter Documentation</h4>
              <p className="text-xs text-slate-500">Record Subjective history, Objective exam, Assessment, and Plan.</p>
            </div>
            <button
              onClick={handleSaveSoap}
              className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Save SOAP Note
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subjective */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-[11px] font-bold">S</span>
                <span>Subjective (HPI, Complaints & Symptoms)</span>
              </label>
              <textarea
                rows={4}
                value={soap.subjective}
                onChange={e => setSoap({ ...soap, subjective: e.target.value })}
                className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Objective */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-[11px] font-bold">O</span>
                <span>Objective (Physical Exam, Auscultation, Vitals)</span>
              </label>
              <textarea
                rows={4}
                value={soap.objective}
                onChange={e => setSoap({ ...soap, objective: e.target.value })}
                className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Assessment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 inline-flex items-center justify-center text-[11px] font-bold">A</span>
                <span>Assessment (Clinical Impression / Differential)</span>
              </label>
              <textarea
                rows={3}
                value={soap.assessment}
                onChange={e => setSoap({ ...soap, assessment: e.target.value })}
                className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Plan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[11px] font-bold">P</span>
                <span>Plan (Treatments, Diagnostics, Dispositions)</span>
              </label>
              <textarea
                rows={3}
                value={soap.plan}
                onChange={e => setSoap({ ...soap, plan: e.target.value })}
                className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary & Lifestyle Advice</label>
              <input
                type="text"
                value={soap.dietaryAdvice}
                onChange={e => setSoap({ ...soap, dietaryAdvice: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-Up Instructions</label>
              <input
                type="text"
                value={soap.followUp}
                onChange={e => setSoap({ ...soap, followUp: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PRESCRIPTION WRITER (Rx) */}
      {activeSection === 'prescription' && (
        <div className="space-y-4">
          {/* Add Drug Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" />
              <span>Digital Prescription Generator (Rx)</span>
            </h4>

            {allergyWarning && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-300 rounded-md flex items-center gap-2 text-xs text-rose-800 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>CRITICAL ALLERGY ALERT: Patient has documented Penicillin allergy! Confirm drug safety before prescribing.</span>
              </div>
            )}

            <form onSubmit={handleAddPrescription} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Medication Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol, Amoxicillin, Atorvastatin"
                    value={newDrug.drugName}
                    onChange={e => setNewDrug({ ...newDrug, drugName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={newDrug.dosage}
                    onChange={e => setNewDrug({ ...newDrug, dosage: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Route</label>
                  <select
                    value={newDrug.route}
                    onChange={e => setNewDrug({ ...newDrug, route: e.target.value as PrescriptionItem['route'] })}
                    className="w-full text-xs px-2 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Oral">Oral</option>
                    <option value="IV">IV</option>
                    <option value="IM">IM</option>
                    <option value="Inhaled">Inhaled</option>
                    <option value="Topical">Topical</option>
                    <option value="Sublingual">Sublingual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={newDrug.frequency}
                    onChange={e => setNewDrug({ ...newDrug, frequency: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newDrug.duration}
                    onChange={e => setNewDrug({ ...newDrug, duration: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Special instructions (e.g. Take after meals, with water)..."
                  value={newDrug.instructions}
                  onChange={e => setNewDrug({ ...newDrug, instructions: e.target.value })}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-md"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Script</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Prescriptions Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Prescribed Medications ({patient.prescriptions.length})
            </h4>

            {patient.prescriptions.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No medications prescribed yet for this encounter.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {patient.prescriptions.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.drugName}</span>
                        <span className="text-xs font-mono text-blue-700 font-semibold">{item.dosage}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{item.route}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.frequency} · {item.duration} · {item.instructions}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemovePrescription(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors cursor-pointer"
                      title="Remove drug"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: LABS & DIAGNOSTICS */}
      {activeSection === 'labs' && (
        <div className="space-y-4">
          {/* Order new test */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              <span>Order Clinical Investigation & Diagnostics</span>
            </h4>

            <form onSubmit={handleAddLabOrder} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                required
                placeholder="Test Name (e.g. 12-lead ECG, Troponin I, Chest X-Ray, LFT, CBC)..."
                value={newLabTest.testName}
                onChange={e => setNewLabTest({ ...newLabTest, testName: e.target.value })}
                className="w-full sm:flex-1 text-xs px-3 py-2 border border-slate-300 rounded-md"
              />

              <select
                value={newLabTest.category}
                onChange={e => setNewLabTest({ ...newLabTest, category: e.target.value as LabOrder['category'] })}
                className="w-full sm:w-auto text-xs px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Radiology">Radiology</option>
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Urinalysis">Urinalysis</option>
              </select>

              <select
                value={newLabTest.urgency}
                onChange={e => setNewLabTest({ ...newLabTest, urgency: e.target.value as LabOrder['urgency'] })}
                className="w-full sm:w-auto text-xs px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="STAT">STAT (Emergency)</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Lab Order</span>
              </button>
            </form>
          </div>

          {/* Current Orders List */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Diagnostic Investigations Log ({patient.labOrders.length})
            </h4>

            {patient.labOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No lab or imaging orders requested for this patient.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {patient.labOrders.map(order => (
                  <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{order.testName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                          {order.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          order.urgency === 'STAT' ? 'bg-rose-100 text-rose-800' : 'bg-blue-50 text-blue-800'
                        }`}>
                          {order.urgency}
                        </span>
                      </div>
                      {order.result && (
                        <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded">
                          <strong>Result:</strong> {order.result}
                        </div>
                      )}
                      {order.notes && !order.result && (
                        <div className="text-xs text-slate-500">{order.notes}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
