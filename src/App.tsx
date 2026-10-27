/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Patient, PatientStatus } from './types.ts';
import { INITIAL_PATIENTS } from './clinicalEngine.ts';
import { Header } from './components/Header.tsx';
import { QueueView } from './components/QueueView.tsx';
import { RegistrationModal } from './components/RegistrationModal.tsx';
import { SymptomChecker } from './components/SymptomChecker.tsx';
import { ConsultationView } from './components/ConsultationView.tsx';
import { PrescriptionSlipModal } from './components/PrescriptionSlipModal.tsx';
import { TriageModal } from './components/TriageModal.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { playHospitalChime, announceToken } from './utils/audioAnnouncer.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'queue' | 'registration' | 'symptom_checker' | 'consultation' | 'analytics'>('queue');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(INITIAL_PATIENTS[0]);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [triageModalPatient, setTriageModalPatient] = useState<Patient | null>(null);
  const [prescriptionSlipPatient, setPrescriptionSlipPatient] = useState<Patient | null>(null);

  // Register New Patient
  const handleRegisterPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatient(newPatient);
    setActiveTab('queue');
    // Announce token
    announceToken(newPatient.tokenNumber, newPatient.consultationRoom, newPatient.name);
  };

  // Update Patient
  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    if (selectedPatient?.id === updated.id) {
      setSelectedPatient(updated);
    }
  };

  // Update Status
  const handleUpdateStatus = (patientId: string, newStatus: PatientStatus) => {
    setPatients(prev =>
      prev.map(p => (p.id === patientId ? { ...p, status: newStatus } : p))
    );
  };

  // Open Consultation for a specific patient
  const handleOpenConsultation = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('consultation');
  };

  const handleTestChime = () => {
    playHospitalChime();
  };

  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  const criticalCount = patients.filter(p => p.status !== 'completed' && p.triageLevel <= 2).length;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        waitingCount={waitingCount}
        criticalCount={criticalCount}
        onQuickRegister={() => setIsRegisterOpen(true)}
        onTestChime={handleTestChime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'queue' && (
          <QueueView
            patients={patients}
            onSelectPatient={handleOpenConsultation}
            onUpdateStatus={handleUpdateStatus}
            onOpenTriageModal={p => setTriageModalPatient(p)}
            onQuickIntake={() => setIsRegisterOpen(true)}
          />
        )}

        {activeTab === 'registration' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-4xl mx-auto">
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Patient Intake & Registration Desk</h3>
                <p className="text-xs text-slate-500">
                  Register walk-in outpatients, record initial triage vitals, and generate hospital queue tokens.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Open Full Registration Form
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                The Registration Desk automatically analyzes the patient's vitals (Blood Pressure, Heart Rate, SpO2, Temperature, Pain Scale) alongside their chief complaint to determine an immediate <strong>Emergency Severity Index (ESI)</strong> level.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-900 block mb-1">1. Fast Walk-In Intake</span>
                  <span className="text-xs text-slate-500">Record demographics, emergency contact, and drug allergy records.</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-900 block mb-1">2. Physiological Vitals</span>
                  <span className="text-xs text-slate-500">Automated shock, hypoxia, and hypertensive emergency warning flags.</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-900 block mb-1">3. Department Routing</span>
                  <span className="text-xs text-slate-500">Auto-routes to Cardiology, Pulmonology, Acute Care, or General OPD.</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  Start Intake Registration Now
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'symptom_checker' && (
          <SymptomChecker
            onEnrollPatient={newPatient => {
              handleRegisterPatient(newPatient);
            }}
          />
        )}

        {activeTab === 'consultation' && (
          <ConsultationView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={p => setSelectedPatient(p)}
            onUpdatePatient={handleUpdatePatient}
            onOpenPrescriptionSlip={p => setPrescriptionSlipPatient(p)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView patients={patients} />
        )}
      </main>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={handleRegisterPatient}
      />

      {/* Triage Details Modal */}
      <TriageModal
        patient={triageModalPatient}
        isOpen={!!triageModalPatient}
        onClose={() => setTriageModalPatient(null)}
        onOpenConsultation={p => {
          setTriageModalPatient(null);
          handleOpenConsultation(p);
        }}
      />

      {/* Official Prescription Print Slip Modal */}
      <PrescriptionSlipModal
        patient={prescriptionSlipPatient}
        isOpen={!!prescriptionSlipPatient}
        onClose={() => setPrescriptionSlipPatient(null)}
      />
    </div>
  );
}
