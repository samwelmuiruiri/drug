import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const INFERMEDICA_APP_ID = process.env.INFERMEDICA_APP_ID;
const INFERMEDICA_APP_KEY = process.env.INFERMEDICA_APP_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini client if API key is present
const ai = GEMINI_API_KEY ? new GoogleGenAI() : null;

// POST /api/search - Symptom search endpoint
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { phrase, sex, age } = req.body;
    const searchPhrase = String(phrase || '').trim().toLowerCase();

    if (!searchPhrase || searchPhrase.length < 2) {
      return res.status(400).json({ error: 'Please enter at least 2 characters for symptom search.' });
    }

    // If Infermedica credentials exist and are not default placeholders
    if (INFERMEDICA_APP_ID && INFERMEDICA_APP_KEY && !INFERMEDICA_APP_ID.includes('YOUR_APP')) {
      try {
        const params = new URLSearchParams({
          phrase: searchPhrase,
          sex: sex || 'male',
          'age.value': String(age || 30),
          'age.unit': 'year',
          max_results: '10',
        });

        const infermedicaRes = await fetch(`https://api.infermedica.com/v3/search?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'App-Id': INFERMEDICA_APP_ID,
            'App-Key': INFERMEDICA_APP_KEY,
            'Dev-Mode': 'true',
          },
          signal: AbortSignal.timeout(6000),
        });

        if (infermedicaRes.ok) {
          const results = await infermedicaRes.json();
          return res.json(results);
        }
      } catch (e) {
        console.warn('Infermedica search failed, falling back to clinical engine', e);
      }
    }

    // Built-in clinical symptoms dictionary
    const clinicalTerms = [
      { id: 's_1', label: 'Chest Pain / Pressure', category: 'Cardiovascular' },
      { id: 's_2', label: 'Shortness of Breath (Dyspnea)', category: 'Respiratory' },
      { id: 's_3', label: 'High Fever (>38.5°C)', category: 'General' },
      { id: 's_4', label: 'Productive Cough with Phlegm', category: 'Respiratory' },
      { id: 's_5', label: 'Severe Acute Headache', category: 'Neurology' },
      { id: 's_6', label: 'Right Lower Quadrant Abdominal Pain', category: 'Gastroenterology' },
      { id: 's_7', label: 'Epigastric Burning / Indigestion', category: 'Gastroenterology' },
      { id: 's_8', label: 'Radiation to Left Arm / Jaw', category: 'Cardiovascular' },
      { id: 's_9', label: 'Wheezing / Audible Expiratory Sound', category: 'Respiratory' },
      { id: 's_10', label: 'Dizziness / Near Syncope', category: 'Neurology' },
      { id: 's_11', label: 'Profuse Cold Sweats / Diaphoresis', category: 'Cardiovascular' },
      { id: 's_12', label: 'Persistent Vomiting & Nausea', category: 'Gastroenterology' },
      { id: 's_13', label: 'Severe Joint Pain & Swelling', category: 'Orthopedics' },
      { id: 's_14', label: 'Burning Micturition / Dysuria', category: 'Nephrology' },
      { id: 's_15', label: 'Sore Throat & Tonsillar Exudate', category: 'ENT' },
      { id: 's_16', label: 'Unilateral Facial Droop / Weakness', category: 'Neurology' },
      { id: 's_17', label: 'Skin Rash with Itching / Urticaria', category: 'Dermatology' },
      { id: 's_18', label: 'Palpitations / Rapid Heartbeat', category: 'Cardiovascular' },
      { id: 's_19', label: 'Hemoptysis (Coughing up Blood)', category: 'Respiratory' },
      { id: 's_20', label: 'Sudden Visual Blur or Loss', category: 'Neurology' },
      { id: 's_21', label: 'Fatigue & Generalized Body Aches', category: 'General' },
      { id: 's_22', label: 'Diarrhea / Watery Stools', category: 'Gastroenterology' },
      { id: 's_23', label: 'Ear Pain & Hearing Muffled', category: 'ENT' },
      { id: 's_24', label: 'Ankle Sprain & Inability to Bear Weight', category: 'Orthopedics' },
    ];

    const matched = clinicalTerms.filter(item =>
      item.label.toLowerCase().includes(searchPhrase) || item.category.toLowerCase().includes(searchPhrase)
    );

    return res.json(matched);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// POST /api/diagnosis - Clinical Triage & Differential Diagnosis
app.post('/api/diagnosis', async (req: Request, res: Response) => {
  try {
    const { sex, age, evidence, chiefComplaint, vitals } = req.body;

    // Optional Gemini AI Clinical Reasoning if key is configured
    if (ai && (chiefComplaint || (evidence && evidence.length > 0))) {
      try {
        const symptomsSummary = (evidence || [])
          .map((e: { id: string; choice_id: string; name?: string }) => `${e.name || e.id}: ${e.choice_id}`)
          .join(', ');

        const prompt = `You are an expert emergency and hospital outpatient triage physician. Evaluate this patient presentation:
Demographics: ${age} years old, ${sex}.
Chief Complaint: ${chiefComplaint || 'Not stated'}
Vitals: BP: ${vitals?.bpSystolic || 'N/A'}/${vitals?.bpDiastolic || 'N/A'} mmHg, HR: ${vitals?.heartRate || 'N/A'} bpm, Temp: ${vitals?.temp || 'N/A'} °C, SpO2: ${vitals?.spo2 || 'N/A'}%, RR: ${vitals?.respiratoryRate || 'N/A'}/min, Pain: ${vitals?.painScore || 0}/10.
Reported Symptoms / Evidence: ${symptomsSummary || 'None provided'}

Provide a structured clinical triage assessment in valid JSON format with:
- "esiLevel": number (1 to 5, where 1=Resuscitation, 2=Emergent, 3=Urgent, 4=Less urgent, 5=Non-urgent)
- "urgencyTitle": string
- "targetWaitMinutes": number
- "clinicalRationale": string (2-3 sentences explaining the triage priority and pathophysiology)
- "redFlags": array of strings (life threats, abnormal vitals or warning signs)
- "differentials": array of objects with { "name": string, "probability": number (0-100), "severity": "critical"|"high"|"moderate"|"low", "category": string, "summary": string, "recommendedAction": string }
- "recommendedDepartment": string
- "suggestedInvestigations": array of strings`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn('Gemini clinical reasoning fallback:', geminiError);
      }
    }

    return res.json({
      status: 'fallback_ready',
      message: 'Client-side clinical engine will provide instantaneous, verified triage.',
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return res.status(500).json({ error: 'Diagnosis service error' });
  }
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospital OPD System running at http://localhost:${PORT}`);
  });
}

start();
