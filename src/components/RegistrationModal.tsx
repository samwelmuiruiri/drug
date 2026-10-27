import React, { useState } from 'react';
import { Patient, Department, Sex, Vitals, SymptomEvidence } from '../types.ts';
import { assessTriage, COMMON_SYMPTOMS } from '../clinicalEngine.ts';
import { X, UserPlus, AlertCircle, Sparkles } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (patient: Patient) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [sex, setSex] = useState<Sex>('male');
  const [phone, setPhone] = useState('+1 (555) ');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergiesText, setAllergiesText] = useState('');
  const [department, setDepartment] = useState<Department>('General Medicine');
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Vitals
  const [vitals, setVitals] = useState<Vitals>({
    bpSystolic: 120,
    bpDiastolic: 80,
    heartRate: 78,
    temp: 36.8,
    spo2: 98,
    respiratoryRate: 16,
    painScore: 2,
  });

  // Selected Symptoms
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    setSelectedSymptomIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Compute live triage assessment
  const symptomList: SymptomEvidence[] = selectedSymptomIds.map(id => {
    const def = COMMON_SYMPTOMS.find(s => s.id === id);
    return {
      id,
      name: def?.name || id,
      choice: 'present',
      severity: 'moderate',
    };
  });

  const previewTriage = assessTriage(age, sex, vitals, symptomList, chiefComplaint);

  // Quick Preset Scenarios for instant evaluation
  const loadPreset = (type: 'acs' | 'appendicitis' | 'asthma' | 'fever') => {
    if (type === 'acs') {
      setName('Arthur Pendelton');
      setAge(62);
      setSex('male');
      setPhone('+1 (555) 392-8812');
      setBloodGroup('A+');
      setAllergiesText('Penicillin');
      setChiefComplaint('Crushing central retrosternal pressure radiating to jaw with cold sweats for 45 mins');
      setVitals({
        bpSystolic: 158,
        bpDiastolic: 98,
        heartRate: 106,
        temp: 36.7,
        spo2: 94,
        respiratoryRate: 22,
        painScore: 8,
      });
      setSelectedSymptomIds(['s_1', 's_8', 's_11', 's_2']);
      setDepartment('Cardiology');
    } else if (type === 'appendicitis') {
      setName('Chloe Martinez');
      setAge(22);
      setSex('female');
      setPhone('+1 (555) 714-2900');
      setBloodGroup('O+');
      setAllergiesText('None known');
      setChiefComplaint('Severe acute right lower quadrant pain, guarding, nausea and low grade fever for 10 hours');
      setVitals({
        bpSystolic: 114,
        bpDiastolic: 72,
        heartRate: 94,
        temp: 38.2,
        spo2: 99,
        respiratoryRate: 18,
        painScore: 7,
      });
      setSelectedSymptomIds(['s_6', 's_3', 's_12']);
      setDepartment('Emergency & Acute Care');
    } else if (type === 'asthma') {
      setName('Lucas Miller');
      setAge(11);
      setSex('male');
      setPhone('+1 (555) 619-3344');
      setBloodGroup('B+');
      setAllergiesText('Pollen, Cat dander');
      setChiefComplaint('Audible expiratory wheezing, tight chest, shortness of breath after soccer practice');
      setVitals({
        bpSystolic: 106,
        bpDiastolic: 68,
        heartRate: 118,
        temp: 37.1,
        spo2: 93,
        respiratoryRate: 26,
        painScore: 4,
      });
      setSelectedSymptomIds(['s_9', 's_2', 's_4']);
      setDepartment('Pulmonology');
    } else if (type === 'fever') {
      setName('Samantha Ray');
      setAge(29);
      setSex('female');
      setPhone('+1 (555) 843-1129');
      setBloodGroup('AB+');
      setAllergiesText('None known');
      setChiefComplaint('3 days of high fever (39.2°C), severe body aches, shivering chills, and persistent fatigue');
      setVitals({
        bpSystolic: 120,
        bpDiastolic: 76,
        heartRate: 90,
        temp: 39.1,
        spo2: 98,
        respiratoryRate: 16,
        painScore: 4,
      });
      setSelectedSymptomIds(['s_3', 's_21', 's_15']);
      setDepartment('General Medicine');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tokenLetter = department.charAt(0).toUpperCase();
    const randomNum = Math.floor(10 + Math.random() * 90);
    const tokenNumber = `${tokenLetter}-${randomNum}`;
    const id = `P-${Date.now().toString().slice(-4)}`;

    const allergies = allergiesText
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    const now = new Date();
    const registeredAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let doctorName = 'Dr. Priya Patel (Room 102)';
    let roomName = 'Room 102 - Outpatient Clinic';

    if (department === 'Cardiology') {
      doctorName = 'Dr. Marcus Vance (Room 101)';
      roomName = 'Room 101 - Cardiology Suite';
    } else if (department === 'Emergency & Acute Care') {
      doctorName = 'Dr. Sarah Chen (Room 104)';
      roomName = 'Room 104 - Acute Surgical Bay';
    } else if (department === 'Pulmonology') {
      doctorName = 'Dr. Elena Rostova (Room 103)';
      roomName = 'Room 103 - Respiratory Clinic';
    } else if (department === 'Orthopedics') {
      doctorName = 'Dr. Julian Scott (Room 106)';
      roomName = 'Room 106 - Trauma Clinic';
    }

    const newPatient: Patient = {
      id,
      tokenNumber,
      name,
      age: Number(age),
      sex,
      phone,
      bloodGroup,
      allergies,
      registeredAt,
      department,
      triageLevel: previewTriage.esiLevel,
      status: 'waiting',
      assignedDoctor: doctorName,
      consultationRoom: roomName,
      chiefComplaint: chiefComplaint || 'Routine clinical assessment',
      vitals,
      symptoms: symptomList,
      triageResult: previewTriage,
      prescriptions: [],
      labOrders: [],
    };

    onRegister(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[92vh] overflow-y-auto my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">OPD Patient Registration & Vitals Intake</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preset Buttons */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Test Presets (Load Real Clinical Case):</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => loadPreset('acs')}
                className="px-2.5 py-1 bg-white border border-rose-200 text-rose-700 rounded font-medium hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Acute Coronary Syndrome (Chest Pain 62M)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('appendicitis')}
                className="px-2.5 py-1 bg-white border border-amber-200 text-amber-700 rounded font-medium hover:bg-amber-50 transition-colors cursor-pointer"
              >
                Suspected Appendicitis (RLQ Pain 22F)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('asthma')}
                className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded font-medium hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Asthma Exacerbation (Wheezing 11M)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('fever')}
                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded font-medium hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Viral Pyrexia (High Fever 29F)
              </button>
            </div>
          </div>

          {/* Section 1: Demographics */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              1. Patient Demographics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Age (Years) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={age}
                  onChange={e => setAge(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Biological Sex *</label>
                <select
                  value={sex}
                  onChange={e => setSex(e.target.value as Sex)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-mono"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Known Drug Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Aspirin"
                  value={allergiesText}
                  onChange={e => setAllergiesText(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vitals Intake */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              2. Clinical Triage Vitals
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">BP Systolic</label>
                <input
                  type="number"
                  value={vitals.bpSystolic}
                  onChange={e => setVitals({ ...vitals, bpSystolic: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono tabular-nums"
                />
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">BP Diastolic</label>
                <input
                  type="number"
                  value={vitals.bpDiastolic}
                  onChange={e => setVitals({ ...vitals, bpDiastolic: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono tabular-nums"
                />
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Pulse / HR</label>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={e => setVitals({ ...vitals, heartRate: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono tabular-nums"
                />
                <span className="text-[10px] text-slate-400">bpm</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temp}
                  onChange={e => setVitals({ ...vitals, temp: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono tabular-nums"
                />
                <span className="text-[10px] text-slate-400">Celsius</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">SpO2 Oxygen</label>
                <input
                  type="number"
                  value={vitals.spo2}
                  onChange={e => setVitals({ ...vitals, spo2: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono tabular-nums"
                />
                <span className="text-[10px] text-slate-400">% room air</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Pain (0 - 10)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={vitals.painScore}
                  onChange={e => setVitals({ ...vitals, painScore: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono tabular-nums"
                />
                <span className="text-[10px] text-slate-400">NRS Scale</span>
              </div>
            </div>
          </div>

          {/* Section 3: Chief Complaint & Symptoms */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              3. Chief Complaint & Presenting Symptoms
            </h4>
            <textarea
              rows={2}
              required
              placeholder="Describe primary symptom, onset, duration, and patient statement..."
              value={chiefComplaint}
              onChange={e => setChiefComplaint(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
            />

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Select Common Clinical Symptoms:</span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-md">
                {COMMON_SYMPTOMS.map(sym => {
                  const isSelected = selectedSymptomIds.includes(sym.id);
                  return (
                    <button
                      type="button"
                      key={sym.id}
                      onClick={() => toggleSymptom(sym.id)}
                      className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium shadow-xs'
                          : sym.isRedFlag
                          ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sym.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Pre-Triage Assessment Box */}
          <div className="bg-slate-900 text-white p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Pre-Triage Evaluation:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  previewTriage.esiLevel <= 2 ? 'bg-rose-500 text-white' : previewTriage.esiLevel === 3 ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  ESI {previewTriage.esiLevel} · {previewTriage.urgencyTitle}
                </span>
              </div>
              <p className="text-xs text-slate-300">{previewTriage.clinicalRationale}</p>
              {previewTriage.redFlags.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-rose-300 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{previewTriage.redFlags.join(' · ')}</span>
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-col items-end">
              <label className="text-[11px] text-slate-400 mb-1">Target Department:</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as Department)}
                className="text-xs bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Emergency & Acute Care">Emergency & Acute Care</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Neurology">Neurology</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Confirm Registration & Generate Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
