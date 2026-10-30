import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import NavigationTabs from './components/NavigationTabs';
import Dashboard from './components/Dashboard';
import FacultyAbsenceReport from './components/FacultyAbsenceReport';
import HodAdjustmentManager from './components/HodAdjustmentManager';
import MasterTimetableView from './components/MasterTimetableView';
import MyAdjustmentsView from './components/MyAdjustmentsView';
import TimetableEditor from './components/TimetableEditor';
import PrintSlipModal from './components/PrintSlipModal';
import NotificationToast from './components/NotificationToast';
import ConfirmModal from './components/ConfirmModal';
import './App.css';

function MainApp() {
  const { activeTab, confirmState, handleConfirm, handleCancelConfirm } = useApp();
  const [showPrintModal, setShowPrintModal] = useState(false);

  return (
    <div className="app-layout">
      {/* Top Header Navbar */}
      <Navbar />

      {/* Navigation Tab Bar */}
      <NavigationTabs />

      {/* Main Tab Content */}
      <main className="main-content-container">
        {activeTab === 'dashboard' && (
          <Dashboard onOpenPrintModal={() => setShowPrintModal(true)} />
        )}
        {activeTab === 'report-absence' && (
          <FacultyAbsenceReport />
        )}
        {activeTab === 'hod-requests' && (
          <HodAdjustmentManager onOpenPrintModal={() => setShowPrintModal(true)} />
        )}
        {activeTab === 'master-timetable' && (
          <MasterTimetableView onOpenPrintModal={() => setShowPrintModal(true)} />
        )}
        {activeTab === 'my-schedule' && (
          <MyAdjustmentsView />
        )}
        {activeTab === 'timetable-editor' && (
          <TimetableEditor />
        )}
      </main>

      {/* Printable Notice Slip Modal */}
      {showPrintModal && (
        <PrintSlipModal onClose={() => setShowPrintModal(false)} />
      )}

      {/* Toast Notification Stack */}
      <NotificationToast />

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        variant={confirmState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />

      {/* Minimal App Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>Faculty Adjustment Management System • 8-Period Timetable Automation</span>
          <span className="footer-dot">•</span>
          <span>Automatic Conflict-Free Free Teacher Assignment</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
