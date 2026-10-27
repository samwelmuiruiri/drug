import { Patient, SymptomEvidence, TriageResult, DifferentialDiagnosis, TriageLevel, Department, Vitals } from './types.ts';

export interface SymptomDefinition {
  id: string;
  name: string;
  category: string;
  isRedFlag?: boolean;
  synonyms: string[];
}

export const COMMON_SYMPTOMS: SymptomDefinition[] = [
  { id: 's_1', name: 'Chest Pain / Pressure', category: 'Cardiovascular', isRedFlag: true, synonyms: ['chest tightness', 'angina', 'crushing chest pain', 'substernal discomfort'] },
  { id: 's_2', name: 'Shortness of Breath', category: 'Respiratory', isRedFlag: true, synonyms: ['dyspnea', 'breathlessness', 'difficulty breathing', 'gasping'] },
  { id: 's_3', name: 'High Fever (>38.5°C / 101.3°F)', category: 'General', synonyms: ['pyrexia', 'chills', 'rigors', 'elevated temperature'] },
  { id: 's_4', name: 'Productive Cough with Phlegm', category: 'Respiratory', synonyms: ['wet cough', 'sputum', 'bronchial cough'] },
  { id: 's_5', name: 'Severe Acute Headache', category: 'Neurology', isRedFlag: true, synonyms: ['thunderclap headache', 'migraine', 'cranial pressure'] },
  { id: 's_6', name: 'Right Lower Quadrant Abdominal Pain', category: 'Gastroenterology', isRedFlag: true, synonyms: ['iliac fossa pain', 'appendiceal pain', 'rebound tenderness'] },
  { id: 's_7', name: 'Epigastric Burning / Indigestion', category: 'Gastroenterology', synonyms: ['heartburn', 'acid reflux', 'dyspepsia', 'sour belching'] },
  { id: 's_8', name: 'Radiation to Left Arm / Jaw', category: 'Cardiovascular', isRedFlag: true, synonyms: ['cardiac radiation', 'arm numbness', 'jaw ache'] },
  { id: 's_9', name: 'Wheezing / Audible Expiratory Sound', category: 'Respiratory', synonyms: ['bronchospasm', 'asthmatic whistle', 'stridor'] },
  { id: 's_10', name: 'Dizziness / Near Syncope', category: 'Neurology', synonyms: ['lightheadedness', 'presyncope', 'unsteadiness', 'vertigo'] },
  { id: 's_11', name: 'Profuse Cold Sweats / Diaphoresis', category: 'Cardiovascular', isRedFlag: true, synonyms: ['cold sweat', 'night sweats', 'clammy skin'] },
  { id: 's_12', name: 'Persistent Vomiting & Nausea', category: 'Gastroenterology', synonyms: ['emesis', 'queasiness', 'inability to retain fluids'] },
  { id: 's_13', name: 'Severe Joint Pain & Swelling', category: 'Orthopedics', synonyms: ['arthralgia', 'synovial effusion', 'acute knee pain'] },
  { id: 's_14', name: 'Burning Micturition / Dysuria', category: 'Nephrology', synonyms: ['urinary burning', 'painful urination', 'frequency', 'hematuria'] },
  { id: 's_15', name: 'Sore Throat & Tonsillar Exudate', category: 'ENT', synonyms: ['pharyngitis', 'painful swallowing', 'odynophagia'] },
  { id: 's_16', name: 'Unilateral Facial Droop / Weakness', category: 'Neurology', isRedFlag: true, synonyms: ['facial numbness', 'asymmetry', 'stroke sign'] },
  { id: 's_17', name: 'Skin Rash with Itching / Urticaria', category: 'Dermatology', synonyms: ['hives', 'erythema', 'pruritus', 'contact allergy'] },
  { id: 's_18', name: 'Palpitations / Rapid Heartbeat', category: 'Cardiovascular', synonyms: ['fluttering chest', 'tachycardia', 'skipped beats'] },
  { id: 's_19', name: 'Hemoptysis (Coughing up Blood)', category: 'Respiratory', isRedFlag: true, synonyms: ['blood in sputum', 'pulmonary hemorrhage'] },
  { id: 's_20', name: 'Sudden Visual Blur or Loss', category: 'Neurology', isRedFlag: true, synonyms: ['amaurosis', 'diplopia', 'visual scotoma'] },
  { id: 's_21', name: 'Fatigue & Generalized Body Aches', category: 'General', synonyms: ['malaise', 'myalgia', 'lethargy', 'weakness'] },
  { id: 's_22', name: 'Diarrhea / Watery Stools', category: 'Gastroenterology', synonyms: ['loose motions', 'gastroenteritis', 'cramping'] },
  { id: 's_23', name: 'Ear Pain & Hearing Muffled', category: 'ENT', synonyms: ['otalgia', 'earache', 'tympanic fullness'] },
  { id: 's_24', name: 'Ankle Sprain & Inability to Bear Weight', category: 'Orthopedics', synonyms: ['ligament tear', 'twisted ankle', 'malleolar pain'] },
];

export function assessTriage(
  age: number,
  sex: 'male' | 'female' | 'other',
  vitals: Vitals,
  symptoms: SymptomEvidence[],
  chiefComplaint: string
): TriageResult {
  const presentSymptomIds = symptoms.filter(s => s.choice === 'present').map(s => s.id);
  const complaintLower = chiefComplaint.toLowerCase();

  const redFlags: string[] = [];

  // Vitals checks
  if (vitals.spo2 > 0 && vitals.spo2 < 90) {
    redFlags.push(`Critical Hypoxemia: SpO2 ${vitals.spo2}% (Normal > 95%)`);
  }
  if (vitals.bpSystolic > 190 || vitals.bpDiastolic > 120) {
    redFlags.push(`Hypertensive Crisis Range: BP ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`);
  } else if (vitals.bpSystolic > 0 && vitals.bpSystolic < 85) {
    redFlags.push(`Hypotension / Shock Warning: Systolic BP ${vitals.bpSystolic} mmHg`);
  }
  if (vitals.heartRate > 130) {
    redFlags.push(`Severe Tachycardia: Heart Rate ${vitals.heartRate} bpm`);
  } else if (vitals.heartRate > 0 && vitals.heartRate < 45) {
    redFlags.push(`Severe Bradycardia: Heart Rate ${vitals.heartRate} bpm`);
  }
  if (vitals.painScore >= 8) {
    redFlags.push(`High Agony / Severe Pain: Score ${vitals.painScore}/10`);
  }

  // Symptom Red Flags
  const hasChestPain = presentSymptomIds.includes('s_1') || complaintLower.includes('chest') || complaintLower.includes('angina');
  const hasRadiation = presentSymptomIds.includes('s_8') || complaintLower.includes('radiation') || complaintLower.includes('arm');
  const hasColdSweats = presentSymptomIds.includes('s_11') || complaintLower.includes('sweat') || complaintLower.includes('diaphoresis');
  const hasShortnessOfBreath = presentSymptomIds.includes('s_2') || complaintLower.includes('breath') || complaintLower.includes('dyspnea');
  const hasStrokeSigns = presentSymptomIds.includes('s_16') || presentSymptomIds.includes('s_20') || complaintLower.includes('facial') || complaintLower.includes('stroke') || complaintLower.includes('numb');
  const hasHemoptysis = presentSymptomIds.includes('s_19') || complaintLower.includes('blood in sputum') || complaintLower.includes('coughing blood');
  const hasRLQ = presentSymptomIds.includes('s_6') || complaintLower.includes('appendix') || complaintLower.includes('right lower');

  if (hasChestPain && (hasRadiation || hasColdSweats || age > 45)) {
    redFlags.push('High-Risk Acute Coronary Syndrome (ACS) clinical pattern');
  }
  if (hasStrokeSigns) {
    redFlags.push('Acute Focal Neurological Deficit - Stroke code alert');
  }
  if (hasHemoptysis) {
    redFlags.push('Active Hemoptysis - Airway & pulmonary bleeding concern');
  }
  if (hasRLQ && (vitals.temp > 38 || vitals.painScore >= 6)) {
    redFlags.push('Surgical Abdomen / Peritoneal Signs suspected');
  }

  // ESI Logic
  let esiLevel: TriageLevel = 4;
  let urgencyTitle = 'Less Urgent';
  let targetWaitMinutes = 60;
  let clinicalRationale = 'Single diagnostic or therapeutic resource expected; stable physiological vitals.';

  if (vitals.spo2 < 86 || vitals.bpSystolic < 75 || hasStrokeSigns) {
    esiLevel = 1;
    urgencyTitle = 'Resuscitation (Immediate)';
    targetWaitMinutes = 0;
    clinicalRationale = 'Life-threatening physiological decompensation or acute neurological crisis requiring zero-delay resuscitation team activation.';
  } else if (redFlags.length >= 2 || (hasChestPain && (hasRadiation || hasColdSweats)) || vitals.spo2 < 91 || (vitals.bpSystolic > 195 && vitals.painScore >= 7)) {
    esiLevel = 2;
    urgencyTitle = 'Emergent (< 15 min)';
    targetWaitMinutes = 15;
    clinicalRationale = 'High-risk situation, severe distress, or critical vital sign derangement requiring immediate physician triage and cardiac monitoring.';
  } else if (
    (hasShortnessOfBreath && vitals.respiratoryRate > 22) ||
    hasRLQ ||
    (vitals.temp >= 38.5 && vitals.heartRate > 100) ||
    redFlags.length === 1 ||
    presentSymptomIds.length >= 3
  ) {
    esiLevel = 3;
    urgencyTitle = 'Urgent (< 30 min)';
    targetWaitMinutes = 30;
    clinicalRationale = 'Complex clinical presentation expected to require multiple diagnostics (blood work, imaging, IV medications); vitals borderline.';
  } else if (presentSymptomIds.length <= 1 && vitals.painScore <= 3 && vitals.temp < 37.8) {
    esiLevel = 5;
    urgencyTitle = 'Non-Urgent (< 120 min)';
    targetWaitMinutes = 120;
    clinicalRationale = 'Simple outpatient encounter, medication renewal or mild localized complaint with no resource requirements beyond physical exam.';
  }

  // Differentials
  const differentials: DifferentialDiagnosis[] = [];

  if (hasChestPain) {
    differentials.push({
      id: 'd_acs',
      name: 'Acute Coronary Syndrome / Myocardial Infarction',
      probability: hasRadiation || hasColdSweats ? 82 : 55,
      severity: 'critical',
      category: 'Cardiovascular',
      summary: 'Ischemic myocardial injury with severe retrosternal pressure, diaphoresis, and left upper limb radiation.',
      recommendedAction: 'Immediate 12-lead ECG, High-sensitivity Troponin I, Aspirin 300mg chewed, continuous telemetry.',
    });
    differentials.push({
      id: 'd_gerd',
      name: 'Gastroesophageal Reflux Disease / Esophageal Spasm',
      probability: 42,
      severity: 'moderate',
      category: 'Gastroenterology',
      summary: 'Postprandial retrosternal burning or esophageal mucosal irritation, often aggravated by recumbency.',
      recommendedAction: 'Trial antacid / PPI therapy, observe ECG evolution to rule out ischemic mimic.',
    });
    differentials.push({
      id: 'd_costo',
      name: 'Costochondritis / Musculoskeletal Chest Wall Pain',
      probability: 30,
      severity: 'low',
      category: 'Orthopedics',
      summary: 'Inflammation of costosternal joints with point tenderness on direct manual palpation.',
      recommendedAction: 'NSAID therapy, reassurance after normal cardiac biomarkers.',
    });
  }

  if (hasShortnessOfBreath || presentSymptomIds.includes('s_4') || presentSymptomIds.includes('s_9')) {
    differentials.push({
      id: 'd_pna',
      name: 'Community-Acquired Pneumonia / Lower Respiratory Tract Infection',
      probability: vitals.temp > 38 ? 78 : 50,
      severity: 'high',
      category: 'Pulmonology',
      summary: 'Parenchymal alveolar consolidation presenting with pyrexia, productive purulent sputum, and crackles.',
      recommendedAction: 'Posteroanterior Chest X-ray, Full Blood Count with differential, Sputum culture, Antibiotic regimen.',
    });
    differentials.push({
      id: 'd_asthma',
      name: 'Acute Bronchial Asthma / Reactive Airway Exacerbation',
      probability: presentSymptomIds.includes('s_9') ? 85 : 45,
      severity: 'high',
      category: 'Pulmonology',
      summary: 'Reversible bronchoconstriction characterized by bilateral expiratory wheeze and tachypnea.',
      recommendedAction: 'Nebulized Salbutamol + Ipratropium, Peak Expiratory Flow rate, systemic corticosteroid if PEF < 60%.',
    });
  }

  if (hasRLQ || complaintLower.includes('appendix')) {
    differentials.push({
      id: 'd_app',
      name: 'Acute Appendicitis',
      probability: 88,
      severity: 'critical',
      category: 'Gastroenterology',
      summary: 'Luminal obstruction of vermiform appendix with periumbilical pain migrating to McBurneys point with guarding.',
      recommendedAction: 'Urgent Surgical Consultation, Abdominal Ultrasound / Contrast CT, NPO (nil by mouth), IV fluids.',
    });
    differentials.push({
      id: 'd_mesenteric',
      name: 'Mesenteric Adenitis / Infectious Gastroenteritis',
      probability: 35,
      severity: 'moderate',
      category: 'Gastroenterology',
      summary: 'Benign self-limiting inflammation of mesenteric lymph nodes mimicking acute appendicitis, common in young patients.',
      recommendedAction: 'Ultrasound confirmation, supportive hydration, anti-spasmodic as needed.',
    });
  }

  if (presentSymptomIds.includes('s_5') || complaintLower.includes('headache')) {
    differentials.push({
      id: 'd_migraine',
      name: 'Acute Migraine with Cranial Autonomic Symptoms',
      probability: 72,
      severity: 'moderate',
      category: 'Neurology',
      summary: 'Neurovascular headache disorder with throbbing unilateral pain, photophobia, and nausea.',
      recommendedAction: 'Triptan / NSAID abortive therapy, dark quiet room recovery, hydration.',
    });
  }

  if (presentSymptomIds.includes('s_3') && presentSymptomIds.includes('s_21')) {
    differentials.push({
      id: 'd_viral',
      name: 'Acute Viral Syndrome / Seasonal Influenza',
      probability: 76,
      severity: 'moderate',
      category: 'General Medicine',
      summary: 'Systemic viremia with high fever, diffuse myalgias, arthralgias, and upper respiratory congestion.',
      recommendedAction: 'Antipyretics (Paracetamol 1g QDS), oral hydration, viral PCR swab if high-risk host.',
    });
  }

  // Fallback differential if none matched
  if (differentials.length === 0) {
    differentials.push({
      id: 'd_gen_eval',
      name: 'Clinical Evaluation of Presenting Symptoms',
      probability: 60,
      severity: 'moderate',
      category: 'General Medicine',
      summary: 'Presenting complaints require detailed physical examination and baseline lab tests.',
      recommendedAction: 'Comprehensive clinical history, baseline blood tests, targeted specialist review.',
    });
  }

  // Recommended Department
  let recommendedDepartment: Department = 'General Medicine';
  if (hasChestPain || differentials.some(d => d.category === 'Cardiovascular')) {
    recommendedDepartment = esiLevel <= 2 ? 'Emergency & Acute Care' : 'Cardiology';
  } else if (hasRLQ || differentials.some(d => d.id === 'd_app')) {
    recommendedDepartment = esiLevel <= 2 ? 'Emergency & Acute Care' : 'Gastroenterology';
  } else if (differentials.some(d => d.category === 'Pulmonology')) {
    recommendedDepartment = 'Pulmonology';
  } else if (differentials.some(d => d.category === 'Neurology')) {
    recommendedDepartment = 'Neurology';
  } else if (age <= 14) {
    recommendedDepartment = 'Pediatrics';
  } else if (presentSymptomIds.includes('s_13') || presentSymptomIds.includes('s_24')) {
    recommendedDepartment = 'Orthopedics';
  }

  // Suggested Investigations
  const suggestedInvestigations: string[] = [];
  if (hasChestPain) {
    suggestedInvestigations.push('12-Lead Electrocardiogram (ECG)');
    suggestedInvestigations.push('High-Sensitivity Cardiac Troponin I');
    suggestedInvestigations.push('Chest Radiography (CXR AP)');
  }
  if (hasShortnessOfBreath || presentSymptomIds.includes('s_4')) {
    suggestedInvestigations.push('Chest X-Ray Posteroanterior (PA)');
    suggestedInvestigations.push('Complete Blood Count (CBC) with Differential');
    suggestedInvestigations.push('Arterial Blood Gas (ABG) Analysis');
  }
  if (hasRLQ) {
    suggestedInvestigations.push('Abdominal & Pelvic Ultrasonography');
    suggestedInvestigations.push('C-Reactive Protein (CRP) & ESR');
    suggestedInvestigations.push('Routine Urinalysis');
  }
  if (suggestedInvestigations.length === 0) {
    suggestedInvestigations.push('Complete Blood Count (CBC)');
    suggestedInvestigations.push('Random Blood Glucose & Basic Metabolic Panel');
  }

  // Suggested Follow-up Questions for the Clinician
  const suggestedQuestions = [];
  if (hasChestPain) {
    suggestedQuestions.push({
      id: 'q_exertion',
      question: 'Does the chest discomfort worsen when walking, climbing stairs, or with physical exertion?',
      options: [
        { label: 'Yes, directly related to exertion', choiceId: 'present' as const },
        { label: 'No, occurs at rest or with respiration', choiceId: 'absent' as const },
      ],
    });
    suggestedQuestions.push({
      id: 'q_nitro',
      question: 'Have you taken Sublingual Nitroglycerin or antacids, and did it relieve the pain?',
      options: [
        { label: 'Relieved by rest / nitrates', choiceId: 'present' as const },
        { label: 'No relief / not tried', choiceId: 'absent' as const },
      ],
    });
  } else if (hasShortnessOfBreath) {
    suggestedQuestions.push({
      id: 'q_orthopnea',
      question: 'Do you need to prop yourself up on extra pillows to breathe comfortably while lying in bed?',
      options: [
        { label: 'Yes, experience orthopnea', choiceId: 'present' as const },
        { label: 'No, can lie completely flat', choiceId: 'absent' as const },
      ],
    });
  } else if (hasRLQ) {
    suggestedQuestions.push({
      id: 'q_app_fever',
      question: 'Did the pain start around the belly button before shifting down to your lower right abdomen?',
      options: [
        { label: 'Yes, classic periumbilical migration', choiceId: 'present' as const },
        { label: 'No, started elsewhere', choiceId: 'absent' as const },
      ],
    });
  }

  return {
    esiLevel,
    urgencyTitle,
    targetWaitMinutes,
    clinicalRationale,
    redFlags,
    differentials,
    recommendedDepartment,
    suggestedInvestigations,
    suggestedQuestions,
  };
}

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'P-8041',
    tokenNumber: 'C-01',
    name: 'Robert Hastings',
    age: 58,
    sex: 'male',
    phone: '+1 (555) 389-2140',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    registeredAt: '08:15 AM',
    department: 'Cardiology',
    triageLevel: 2,
    status: 'consultation',
    assignedDoctor: 'Dr. Marcus Vance (Room 101)',
    consultationRoom: 'Room 101 - Cardiology Suite',
    chiefComplaint: 'Crushing central chest tightness radiating to left shoulder and jaw with profuse cold sweating for 90 minutes.',
    vitals: {
      bpSystolic: 154,
      bpDiastolic: 96,
      heartRate: 104,
      temp: 36.8,
      spo2: 95,
      respiratoryRate: 22,
      painScore: 8,
    },
    symptoms: [
      { id: 's_1', name: 'Chest Pain / Pressure', choice: 'present', severity: 'severe', duration: '90 minutes', source: 'initial' },
      { id: 's_8', name: 'Radiation to Left Arm / Jaw', choice: 'present', severity: 'moderate', duration: '90 minutes', source: 'initial' },
      { id: 's_11', name: 'Profuse Cold Sweats / Diaphoresis', choice: 'present', severity: 'severe', duration: '1 hour', source: 'initial' },
      { id: 's_2', name: 'Shortness of Breath', choice: 'present', severity: 'moderate', duration: '45 minutes', source: 'interview' },
    ],
    triageResult: {
      esiLevel: 2,
      urgencyTitle: 'Emergent (< 15 min)',
      targetWaitMinutes: 15,
      clinicalRationale: 'Classic Acute Coronary Syndrome presentation with diaphoresis, left jaw radiation, tachycardia, and elevated ischemic risk profile in 58M.',
      redFlags: [
        'High-Risk Acute Coronary Syndrome (ACS) clinical pattern',
        'Severe Pain Score 8/10',
        'Tachypneic at 22 breaths/min',
      ],
      differentials: [
        {
          id: 'd_acs',
          name: 'Acute Coronary Syndrome (NSTEMI / STEMI)',
          probability: 88,
          severity: 'critical',
          category: 'Cardiovascular',
          summary: 'Acute myocardial ischemia due to coronary plaque rupture or thrombosis.',
          recommendedAction: 'Immediate 12-lead ECG, STAT Troponin I, Aspirin 300mg chewed, Clopidogrel 300mg, IV access.',
        },
        {
          id: 'd_angina',
          name: 'Unstable Angina Pectoris',
          probability: 64,
          severity: 'high',
          category: 'Cardiovascular',
          summary: 'Severe new-onset ischemic symptoms occurring at rest.',
          recommendedAction: 'Continuous ECG monitor, sublingual nitrate under BP surveillance.',
        },
      ],
      recommendedDepartment: 'Cardiology',
      suggestedInvestigations: [
        '12-Lead Electrocardiogram (STAT)',
        'High-Sensitivity Troponin I',
        'Chest X-Ray (AP Portable)',
        'Lipid Profile & Serum Electrolytes',
      ],
    },
    soapNote: {
      subjective: '58 y/o male with history of hypertension and hyperlipidemia presents with sudden onset substernal crushing pain while driving. Pain radiates to left mandible and shoulder. Denies recent trauma, denies hemoptysis. Diaphoretic and visibly anxious.',
      objective: 'BP: 154/96 mmHg, HR: 104 bpm regular, RR: 22/min, SpO2: 95% on room air, Temp: 36.8°C. S1/S2 present, no murmurs or pericardial friction rub. Lungs clear to auscultation bilaterally. No peripheral pedal edema.',
      assessment: 'Acute Coronary Syndrome - High probability. Rule out NSTEMI vs Unstable Angina.',
      plan: '1. STAT 12-lead ECG performed; 2. Aspirin 300mg PO chewed; 3. Draw STAT hs-cTnI, CBC, Basic Metabolic Panel, Coagulation screen; 4. IV line 18G left antecubital; 5. Cardiology senior registrar bedside consultation; 6. Admit to Coronary Care Unit (CCU).',
      dietaryAdvice: 'Strict NPO until cardiac evaluation complete.',
      followUp: 'Serial cardiac enzymes at 0h and 3h post-presentation.',
    },
    prescriptions: [
      { id: 'rx_1', drugName: 'Aspirin (Dispersible)', dosage: '300 mg', route: 'Oral', frequency: 'STAT (Immediate)', duration: 'Once', instructions: 'Chew and swallow immediately' },
      { id: 'rx_2', drugName: 'Clopidogrel', dosage: '300 mg', route: 'Oral', frequency: 'STAT (Immediate)', duration: 'Once', instructions: 'Loading dose with water' },
      { id: 'rx_3', drugName: 'Atorvastatin', dosage: '80 mg', route: 'Oral', frequency: 'OD (Night)', duration: '30 days', instructions: 'Take at bedtime' },
    ],
    labOrders: [
      { id: 'lo_1', testName: '12-Lead Electrocardiogram (ECG)', category: 'Cardiology', urgency: 'STAT', status: 'completed', result: 'Sinus tachycardia 102 bpm, 1.5mm ST depression in V4-V6 with T-wave inversions.' },
      { id: 'lo_2', testName: 'High-Sensitivity Cardiac Troponin I', category: 'Biochemistry', urgency: 'STAT', status: 'processing', notes: 'Drawn at 08:30 AM' },
      { id: 'lo_3', testName: 'Complete Blood Count (CBC)', category: 'Hematology', urgency: 'Urgent', status: 'sample_collected' },
    ],
  },
  {
    id: 'P-8042',
    tokenNumber: 'E-02',
    name: 'Emily Thornton',
    age: 24,
    sex: 'female',
    phone: '+1 (555) 720-9114',
    bloodGroup: 'B+',
    allergies: [],
    registeredAt: '08:40 AM',
    department: 'Emergency & Acute Care',
    triageLevel: 3,
    status: 'diagnostics',
    assignedDoctor: 'Dr. Sarah Chen (Room 104)',
    consultationRoom: 'Room 104 - Acute Surgical Bay',
    chiefComplaint: 'Severe constant right lower quadrant pain, started 8 hours ago around umbilicus and migrated. Nausea and low-grade fever.',
    vitals: {
      bpSystolic: 118,
      bpDiastolic: 74,
      heartRate: 98,
      temp: 38.3,
      spo2: 99,
      respiratoryRate: 18,
      painScore: 7,
    },
    symptoms: [
      { id: 's_6', name: 'Right Lower Quadrant Abdominal Pain', choice: 'present', severity: 'severe', duration: '8 hours', source: 'initial' },
      { id: 's_3', name: 'High Fever (>38.5°C / 101.3°F)', choice: 'present', severity: 'moderate', duration: '6 hours', source: 'initial' },
      { id: 's_12', name: 'Persistent Vomiting & Nausea', choice: 'present', severity: 'moderate', duration: '5 hours', source: 'interview' },
    ],
    triageResult: {
      esiLevel: 3,
      urgencyTitle: 'Urgent (< 30 min)',
      targetWaitMinutes: 30,
      clinicalRationale: 'Classic periumbilical-to-RLQ pain migration with localized peritonism and pyrexia in a 24F, requiring urgent surgical ultrasound.',
      redFlags: ['Surgical Abdomen / Peritoneal Signs suspected', 'Pain Score 7/10 with guarding'],
      differentials: [
        {
          id: 'd_app',
          name: 'Acute Appendicitis',
          probability: 86,
          severity: 'critical',
          category: 'Gastroenterology',
          summary: 'Inflammation and impending perforation of the appendix requiring urgent surgical review.',
          recommendedAction: 'Urgent Abdominal/Pelvic Ultrasound, NPO, IV fluid resuscitation, General Surgery consult.',
        },
        {
          id: 'd_ovarian',
          name: 'Ruptured Ovarian Cyst / Pelvic Inflammatory Disease',
          probability: 32,
          severity: 'high',
          category: 'Gynecology',
          summary: 'Gynecological etiology mimicking appendiceal pain.',
          recommendedAction: 'Pelvic transabdominal & transvaginal ultrasound, urine hCG.',
        },
      ],
      recommendedDepartment: 'Emergency & Acute Care',
      suggestedInvestigations: ['Abdominal & Pelvic Ultrasound', 'Complete Blood Count & CRP', 'Urine hCG (Pregnancy test)', 'Routine Urinalysis'],
    },
    prescriptions: [
      { id: 'rx_4', drugName: 'Paracetamol IV Infusion', dosage: '1 g', route: 'IV', frequency: 'QDS (Every 6h)', duration: '24 hours', instructions: 'Infuse over 15 minutes for analgesia' },
      { id: 'rx_5', drugName: 'Ondansetron', dosage: '4 mg', route: 'IV', frequency: 'TDS (As needed)', duration: '24 hours', instructions: 'Slow IV push for nausea' },
    ],
    labOrders: [
      { id: 'lo_4', testName: 'Abdominal Ultrasound', category: 'Radiology', urgency: 'STAT', status: 'processing', notes: 'Focused appendix and right adnexa view' },
      { id: 'lo_5', testName: 'Urine hCG Pregnancy Test', category: 'Biochemistry', urgency: 'STAT', status: 'completed', result: 'Negative' },
      { id: 'lo_6', testName: 'Complete Blood Count (CBC)', category: 'Hematology', urgency: 'Urgent', status: 'completed', result: 'WBC 14.8 x 10^9/L (Neutrophilia 84%), Platelets 280.' },
    ],
  },
  {
    id: 'P-8043',
    tokenNumber: 'P-03',
    name: 'Liam Zhang',
    age: 9,
    sex: 'male',
    phone: '+1 (555) 412-8809',
    bloodGroup: 'A+',
    allergies: ['Dust mites'],
    registeredAt: '09:05 AM',
    department: 'Pulmonology',
    triageLevel: 3,
    status: 'waiting',
    assignedDoctor: 'Dr. Elena Rostova (Room 103)',
    consultationRoom: 'Room 103 - Pediatric & Respiratory Clinic',
    chiefComplaint: 'Audible wheezing, dry coughing bouts, and mild intercostal retractions after viral cold 2 days ago.',
    vitals: {
      bpSystolic: 102,
      bpDiastolic: 66,
      heartRate: 112,
      temp: 37.4,
      spo2: 94,
      respiratoryRate: 26,
      painScore: 3,
    },
    symptoms: [
      { id: 's_9', name: 'Wheezing / Audible Expiratory Sound', choice: 'present', severity: 'moderate', duration: '2 days', source: 'initial' },
      { id: 's_2', name: 'Shortness of Breath', choice: 'present', severity: 'moderate', duration: '24 hours', source: 'initial' },
      { id: 's_4', name: 'Productive Cough with Phlegm', choice: 'present', severity: 'mild', duration: '3 days', source: 'interview' },
    ],
    triageResult: {
      esiLevel: 3,
      urgencyTitle: 'Urgent (< 30 min)',
      targetWaitMinutes: 30,
      clinicalRationale: 'Pediatric asthmatic exacerbation with SpO2 94% and tachypnea (RR 26), responsive to bronchodilator nebulization.',
      redFlags: ['SpO2 94% on ambient air (Target > 95% in pediatrics)', 'Tachypnea in 9-year-old'],
      differentials: [
        {
          id: 'd_asthma_ped',
          name: 'Viral-Induced Asthma Exacerbation',
          probability: 89,
          severity: 'high',
          category: 'Pulmonology',
          summary: 'Rhinovirus triggered airway hyperresponsiveness with diffuse expiratory wheezing.',
          recommendedAction: 'Inhaled Salbutamol 4-6 puffs via spacer or nebulizer 2.5mg, oral Prednisolone 1mg/kg.',
        },
        {
          id: 'd_bronchitis',
          name: 'Acute Bronchitis',
          probability: 45,
          severity: 'moderate',
          category: 'Pulmonology',
          summary: 'Lower bronchial inflammation with prominent paroxysmal cough.',
          recommendedAction: 'Hydration, supportive bronchodilator if wheezing persists.',
        },
      ],
      recommendedDepartment: 'Pulmonology',
      suggestedInvestigations: ['Peak Expiratory Flow (PEF)', 'Continuous pulse oximetry monitoring'],
    },
    prescriptions: [
      { id: 'rx_6', drugName: 'Salbutamol Inhaler (100mcg/puff)', dosage: '4 puffs', route: 'Inhaled', frequency: 'QDS PRN', duration: '5 days', instructions: 'Use with spacer device' },
      { id: 'rx_7', drugName: 'Prednisolone Liquid', dosage: '25 mg', route: 'Oral', frequency: 'OD (Morning)', duration: '3 days', instructions: 'Take with breakfast' },
    ],
    labOrders: [],
  },
  {
    id: 'P-8044',
    tokenNumber: 'G-04',
    name: 'Aisha Al-Mansoor',
    age: 42,
    sex: 'female',
    phone: '+1 (555) 604-3321',
    bloodGroup: 'O-',
    allergies: [],
    registeredAt: '09:20 AM',
    department: 'General Medicine',
    triageLevel: 4,
    status: 'waiting',
    assignedDoctor: 'Dr. Tariq Mahmood (Room 105)',
    consultationRoom: 'Room 105 - Outpatient Medicine',
    chiefComplaint: '3 days of high fever (39°C), severe retro-orbital headache, body aches, and dry throat.',
    vitals: {
      bpSystolic: 122,
      bpDiastolic: 78,
      heartRate: 88,
      temp: 38.9,
      spo2: 98,
      respiratoryRate: 16,
      painScore: 5,
    },
    symptoms: [
      { id: 's_3', name: 'High Fever (>38.5°C / 101.3°F)', choice: 'present', severity: 'severe', duration: '3 days', source: 'initial' },
      { id: 's_21', name: 'Fatigue & Generalized Body Aches', choice: 'present', severity: 'moderate', duration: '3 days', source: 'initial' },
      { id: 's_15', name: 'Sore Throat & Tonsillar Exudate', choice: 'present', severity: 'mild', duration: '2 days', source: 'interview' },
    ],
    prescriptions: [],
    labOrders: [],
  },
  {
    id: 'P-8045',
    tokenNumber: 'O-05',
    name: 'David Kowalski',
    age: 33,
    sex: 'male',
    phone: '+1 (555) 918-4720',
    bloodGroup: 'A-',
    allergies: ['NSAIDs (Ibuprofen)'],
    registeredAt: '09:35 AM',
    department: 'Orthopedics',
    triageLevel: 4,
    status: 'waiting',
    assignedDoctor: 'Dr. Julian Scott (Room 106)',
    consultationRoom: 'Room 106 - Musculoskeletal Clinic',
    chiefComplaint: 'Inversion injury of right ankle during soccer 4 hours ago; localized lateral malleolus edema and antalgic gait.',
    vitals: {
      bpSystolic: 126,
      bpDiastolic: 82,
      heartRate: 76,
      temp: 36.6,
      spo2: 99,
      respiratoryRate: 14,
      painScore: 5,
    },
    symptoms: [
      { id: 's_24', name: 'Ankle Sprain & Inability to Bear Weight', choice: 'present', severity: 'moderate', duration: '4 hours', source: 'initial' },
      { id: 's_13', name: 'Severe Joint Pain & Swelling', choice: 'present', severity: 'moderate', duration: '4 hours', source: 'initial' },
    ],
    prescriptions: [],
    labOrders: [],
  },
  {
    id: 'P-8046',
    tokenNumber: 'N-06',
    name: 'Grace Holloway',
    age: 67,
    sex: 'female',
    phone: '+1 (555) 830-1928',
    bloodGroup: 'AB+',
    allergies: [],
    registeredAt: '07:45 AM',
    department: 'General Medicine',
    triageLevel: 5,
    status: 'completed',
    assignedDoctor: 'Dr. Tariq Mahmood (Room 105)',
    consultationRoom: 'Room 105 - Outpatient Medicine',
    chiefComplaint: 'Routine 3-month Type 2 Diabetes and hypertension follow-up; fasting blood sugar monitoring and script renewal.',
    vitals: {
      bpSystolic: 128,
      bpDiastolic: 80,
      heartRate: 72,
      temp: 36.5,
      spo2: 98,
      respiratoryRate: 14,
      painScore: 0,
    },
    symptoms: [],
    soapNote: {
      subjective: '67 y/o female attends for scheduled outpatient chronic disease review. Reports good adherence to Metformin and Losartan. No polyuria, no polydipsia, no hypoglycemia episodes.',
      objective: 'BP: 128/80 mmHg, HR: 72 bpm regular. BMI 26.2 kg/m². Monofilament foot exam: sensation intact bilaterally. Peripheral pulses 2+ palpable.',
      assessment: '1. Type 2 Diabetes Mellitus, well controlled (HbA1c 6.8% last month); 2. Primary Essential Hypertension, at target.',
      plan: 'Continue Metformin 500mg BD and Losartan 50mg OD. Order fasting lipid profile in 6 months. Annual ophthalmology retinal exam booked.',
      dietaryAdvice: 'Maintain low glycemic index diet, Mediterranean style with regular 30-min walking.',
      followUp: 'Next routine OPD visit in 12 weeks.',
    },
    prescriptions: [
      { id: 'rx_8', drugName: 'Metformin Hydrochloride', dosage: '500 mg', route: 'Oral', frequency: 'BD (Twice daily)', duration: '90 days', instructions: 'Take with main meals' },
      { id: 'rx_9', drugName: 'Losartan Potassium', dosage: '50 mg', route: 'Oral', frequency: 'OD (Morning)', duration: '90 days', instructions: 'Take in the morning with water' },
    ],
    labOrders: [],
    completedAt: '08:35 AM',
  },
];

export const HOSPITAL_DOCTORS = [
  { id: 'doc_1', name: 'Dr. Marcus Vance', title: 'Consultant Interventional Cardiologist', department: 'Cardiology' as Department, room: 'Room 101', status: 'busy' as const, patientsSeenToday: 14 },
  { id: 'doc_2', name: 'Dr. Priya Patel', title: 'Senior Consultant Internist', department: 'General Medicine' as Department, room: 'Room 102', status: 'available' as const, patientsSeenToday: 18 },
  { id: 'doc_3', name: 'Dr. Elena Rostova', title: 'Consultant Pulmonologist & Intensivist', department: 'Pulmonology' as Department, room: 'Room 103', status: 'busy' as const, patientsSeenToday: 11 },
  { id: 'doc_4', name: 'Dr. Sarah Chen', title: 'Emergency Medicine & Acute Care Director', department: 'Emergency & Acute Care' as Department, room: 'Room 104', status: 'busy' as const, patientsSeenToday: 22 },
  { id: 'doc_5', name: 'Dr. Tariq Mahmood', title: 'Attending Physician, OPD Medicine', department: 'General Medicine' as Department, room: 'Room 105', status: 'available' as const, patientsSeenToday: 16 },
  { id: 'doc_6', name: 'Dr. Julian Scott', title: 'Orthopedic & Trauma Specialist', department: 'Orthopedics' as Department, room: 'Room 106', status: 'available' as const, patientsSeenToday: 9 },
];
