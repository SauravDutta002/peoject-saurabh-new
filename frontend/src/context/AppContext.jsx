import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PERIODS,
  DAYS_OF_WEEK,
  INITIAL_FACULTY,
  INITIAL_TIMETABLES,
  INITIAL_ABSENCES,
  INITIAL_ADJUSTMENTS
} from '../data/defaultData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const loadState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`fams_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  // Core State
  const [facultyList, setFacultyList] = useState(() => loadState('faculty', INITIAL_FACULTY));
  const [timetables, setTimetables] = useState(() => loadState('timetables', INITIAL_TIMETABLES));
  const [absences, setAbsences] = useState(() => loadState('absences', INITIAL_ABSENCES));
  const [adjustments, setAdjustments] = useState(() => loadState('adjustments', INITIAL_ADJUSTMENTS));

  // UI State
  const [currentRole, setCurrentRole] = useState('hod');
  const [currentFacultyId, setCurrentFacultyId] = useState('f2');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Date
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[today.getDay()] === 'Sunday' ? 'Monday' : dayNames[today.getDay()];

  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedDay, setSelectedDay] = useState(currentDayName);

  // ─── Toast System ─────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, entering: true }]);

    // Mark as not-entering after mount animation
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, entering: false } : t));
    }, 50);

    // Auto-dismiss
    setTimeout(() => {
      dismissToast(id);
    }, duration);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  // ─── Confirm Dialog System ────────────────────────────────────
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'warning',
    resolve: null
  });

  const showConfirm = useCallback(({
    title = 'Are you sure?',
    message = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'warning'
  } = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmLabel,
        cancelLabel,
        variant,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) confirmState.resolve(true);
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState]);

  const handleCancelConfirm = useCallback(() => {
    if (confirmState.resolve) confirmState.resolve(false);
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState]);

  // ─── LocalStorage persistence ─────────────────────────────────
  useEffect(() => { localStorage.setItem('fams_faculty', JSON.stringify(facultyList)); }, [facultyList]);
  useEffect(() => { localStorage.setItem('fams_timetables', JSON.stringify(timetables)); }, [timetables]);
  useEffect(() => { localStorage.setItem('fams_absences', JSON.stringify(absences)); }, [absences]);
  useEffect(() => { localStorage.setItem('fams_adjustments', JSON.stringify(adjustments)); }, [adjustments]);

  // When date changes, auto-update day of week
  const handleDateChange = (newDateStr) => {
    setSelectedDate(newDateStr);
    try {
      const d = new Date(newDateStr + 'T00:00:00');
      const calculatedDay = dayNames[d.getDay()];
      setSelectedDay(calculatedDay !== 'Sunday' ? calculatedDay : 'Monday');
    } catch { /* keep current */ }
  };

  // ─── Actions ──────────────────────────────────────────────────

  const reportAbsence = (absenceData) => {
    const faculty = facultyList.find(f => f.id === absenceData.facultyId);
    const newAbsence = {
      id: `abs-${Date.now()}`,
      facultyId: absenceData.facultyId,
      facultyName: faculty ? faculty.name : 'Unknown Faculty',
      date: absenceData.date,
      dayOfWeek: absenceData.dayOfWeek,
      reason: absenceData.reason,
      leaveType: absenceData.leaveType || 'Casual Leave',
      status: 'Pending',
      reportedAt: new Date().toISOString(),
      periodsToAdjust: absenceData.periodsToAdjust
    };
    setAbsences(prev => [newAbsence, ...prev]);
    showToast(`Absence request submitted for ${faculty ? faculty.name : 'Faculty'}. Sent to HOD for review.`, 'success');
    return newAbsence;
  };

  const approveAdjustments = (absenceId, periodAssignments, notes = '') => {
    const targetAbsence = absences.find(a => a.id === absenceId);
    if (!targetAbsence) return;

    const newAdjustments = [];
    const timestamp = new Date().toISOString();

    Object.entries(periodAssignments).forEach(([periodId, assignment]) => {
      if (!assignment || !assignment.substituteFacultyId) return;
      const subFaculty = facultyList.find(f => f.id === assignment.substituteFacultyId);
      const originalFaculty = facultyList.find(f => f.id === targetAbsence.facultyId);
      const schedule = timetables[targetAbsence.facultyId]?.[targetAbsence.dayOfWeek] || {};
      const classDetails = schedule[periodId];

      newAdjustments.push({
        id: `adj-${Date.now()}-${periodId}`,
        absenceId: targetAbsence.id,
        date: targetAbsence.date,
        dayOfWeek: targetAbsence.dayOfWeek,
        periodId: Number(periodId),
        periodTime: PERIODS.find(p => p.id === Number(periodId))?.time || '',
        originalFacultyId: targetAbsence.facultyId,
        originalFacultyName: originalFaculty ? originalFaculty.name : targetAbsence.facultyName,
        substituteFacultyId: assignment.substituteFacultyId,
        substituteFacultyName: subFaculty ? subFaculty.name : 'Substitute Teacher',
        subject: classDetails?.subject || 'Class',
        classGroup: classDetails?.classGroup || '',
        room: classDetails?.room || '',
        approvedBy: 'HOD',
        notes: notes || '',
        status: 'Confirmed',
        createdAt: timestamp
      });
    });

    setAbsences(prev => prev.map(a => (a.id === absenceId ? { ...a, status: 'Approved', approvedAt: timestamp } : a)));
    setAdjustments(prev => [...newAdjustments, ...prev.filter(adj => adj.absenceId !== absenceId)]);
    showToast(`Adjustments approved & ${newAdjustments.length} substitute(s) assigned!`, 'success');
  };

  const rejectAbsence = (absenceId) => {
    setAbsences(prev => prev.map(a => (a.id === absenceId ? { ...a, status: 'Rejected' } : a)));
    setAdjustments(prev => prev.filter(adj => adj.absenceId !== absenceId));
    showToast('Absence request rejected.', 'info');
  };

  const removeAdjustment = (adjId) => {
    setAdjustments(prev => prev.filter(a => a.id !== adjId));
    showToast('Adjustment cancelled.', 'info');
  };

  const updateTimetableCell = (facultyId, day, periodId, classData) => {
    setTimetables(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (!copy[facultyId]) copy[facultyId] = {};
      if (!copy[facultyId][day]) copy[facultyId][day] = {};
      copy[facultyId][day][periodId] = classData;
      return copy;
    });
    showToast('Timetable updated.', 'success');
  };

  const resetToDemoData = async () => {
    const confirmed = await showConfirm({
      title: 'Reset to Demo Data?',
      message: 'This will erase all your changes and restore the default sample faculty, timetables, and adjustments.',
      confirmLabel: 'Yes, Reset Everything',
      cancelLabel: 'Keep My Data',
      variant: 'danger'
    });
    if (!confirmed) return;

    setFacultyList(INITIAL_FACULTY);
    setTimetables(INITIAL_TIMETABLES);
    setAbsences(INITIAL_ABSENCES);
    setAdjustments(INITIAL_ADJUSTMENTS);
    localStorage.removeItem('fams_faculty');
    localStorage.removeItem('fams_timetables');
    localStorage.removeItem('fams_absences');
    localStorage.removeItem('fams_adjustments');
    showToast('System reset to demo data!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        PERIODS, DAYS_OF_WEEK,
        facultyList, setFacultyList,
        timetables, absences, adjustments,
        currentRole, setCurrentRole,
        currentFacultyId, setCurrentFacultyId,
        activeTab, setActiveTab,
        selectedDate, setSelectedDate: handleDateChange,
        selectedDay, setSelectedDay,
        // Toast & Confirm
        toasts, showToast, dismissToast,
        confirmState, showConfirm, handleConfirm, handleCancelConfirm,
        // Actions
        reportAbsence, approveAdjustments, rejectAbsence,
        removeAdjustment, updateTimetableCell, resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
