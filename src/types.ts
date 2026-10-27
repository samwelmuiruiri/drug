export type TriageLevel = 1 | 2 | 3 | 4 | 5;

export type PatientStatus = 'waiting' | 'triage' | 'consultation' | 'diagnostics' | 'completed';

export type Sex = 'male' | 'female' | 'other';

export type Department =
  | 'Emergency & Acute Care'
  | 'General Medicine'
  | 'Cardiology'
  | 'Pulmonology'
  | 'Gastroenterology'
  | 'Orthopedics'
  | 'Pediatrics'
  | 'Neurology'
  | 'ENT & Head/Neck'
  | 'Dermatology';

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  temp: number; // in Celsius
  spo2: number; // in %
  respiratoryRate: number; // breaths per min
  painScore: number; // 0 to 10
}

export interface SymptomEvidence {
  id: string;
  name: string;
  choice: 'present' | 'absent' | 'unknown';
  severity?: 'mild' | 'moderate' | 'severe';
  duration?: string;
  source?: 'initial' | 'interview';
}

export interface DifferentialDiagnosis {
  id: string;
  name: string;
  probability: number; // 0 to 100%
  severity: 'critical' | 'high' | 'moderate' | 'low';
  category: string;
  summary: string;
  recommendedAction: string;
}

export interface TriageResult {
  esiLevel: TriageLevel;
  urgencyTitle: string;
  targetWaitMinutes: number;
  clinicalRationale: string;
  redFlags: string[];
  differentials: DifferentialDiagnosis[];
  recommendedDepartment: Department;
  suggestedInvestigations: string[];
  suggestedQuestions?: {
    id: string;
    question: string;
    options: { label: string; choiceId: 'present' | 'absent' }[];
  }[];
}

export interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string;
  route: 'Oral' | 'IV' | 'IM' | 'Inhaled' | 'Topical' | 'Sublingual';
  frequency: string;
  duration: string;
  instructions: string;
}

export interface LabOrder {
  id: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Radiology' | 'Cardiology' | 'Microbiology' | 'Urinalysis';
  urgency: 'STAT' | 'Urgent' | 'Routine';
  status: 'ordered' | 'sample_collected' | 'processing' | 'completed';
  notes?: string;
  result?: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  dietaryAdvice: string;
  followUp: string;
}

export interface Patient {
  id: string;
  tokenNumber: string;
  name: string;
  age: number;
  sex: Sex;
  phone: string;
  bloodGroup: string;
  allergies: string[];
  registeredAt: string;
  department: Department;
  triageLevel: TriageLevel;
  status: PatientStatus;
  assignedDoctor: string;
  consultationRoom: string;
  chiefComplaint: string;
  vitals: Vitals;
  symptoms: SymptomEvidence[];
  triageResult?: TriageResult;
  soapNote?: SoapNote;
  prescriptions: PrescriptionItem[];
  labOrders: LabOrder[];
  completedAt?: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  department: Department;
  room: string;
  status: 'available' | 'busy' | 'break';
  patientsSeenToday: number;
}
