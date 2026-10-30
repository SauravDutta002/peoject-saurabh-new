import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  School,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const {
    currentRole,
    setCurrentRole,
    currentFacultyId,
    facultyList,
    absences,
    resetToDemoData
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pendingCount = absences.filter(a => a.status === 'Pending').length;
  const currentFaculty = facultyList.find(f => f.id === currentFacultyId);

  return (
    <header className="navbar-container">
      <div className="navbar-top">
        {/* Left: Menu & Logo */}
        <div className="navbar-left">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="navbar-brand">
            <div className="brand-icon">
              <School size={22} />
            </div>
            <div className="brand-info">
              <div className="brand-title">CU LMS</div>
              <div className="brand-subtitle">Faculty Portal</div>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="navbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search faculty, courses, timetable..."
            className="search-input"
          />
        </div>

        {/* Right: Controls & User */}
        <div className="navbar-right">
          {/* Notifications */}
          <div className="notification-icon-wrapper">
            <button className="nav-icon-btn" title="Notifications">
              <Bell size={20} />
              {pendingCount > 0 && (
                <span className="notification-badge">{pendingCount}</span>
              )}
            </button>
          </div>

          {/* Settings */}
          <button className="nav-icon-btn" title="Settings">
            <Settings size={20} />
          </button>

          {/* User Profile Dropdown */}
          <div className="user-profile-section">
            <div className="user-avatar">
              {currentFaculty?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'US'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentFaculty?.name || 'User'}</div>
              <div className="user-role">
                {currentRole === 'hod' ? 'HOD / Admin' : 'Faculty'}
              </div>
            </div>
            <ChevronDown size={16} className="user-dropdown-arrow" />
          </div>
        </div>
      </div>

      {/* Role & Faculty Controls (below header on desktop, in sidebar on mobile) */}
      <div className="navbar-controls-bar">
        <div className="controls-content">
          <div className="control-group">
            <label className="control-label">View As</label>
            <div className="role-switcher">
              <button
                onClick={() => setCurrentRole('hod')}
                className={`role-btn${currentRole === 'hod' ? ' active' : ''}`}
                title="HOD/Admin View"
              >
                <span>HOD / Admin</span>
                {pendingCount > 0 && (
                  <span className="role-badge">{pendingCount}</span>
                )}
              </button>
              <button
                onClick={() => setCurrentRole('faculty')}
                className={`role-btn${currentRole === 'faculty' ? ' active' : ''}`}
                title="Faculty View"
              >
                <span>Faculty Portal</span>
              </button>
            </div>
          </div>

          {currentRole === 'faculty' && (
            <div className="control-group">
              <label className="control-label">Simulating As</label>
              <div className="select-wrapper">
                <select className="faculty-select">
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="select-arrow" />
              </div>
            </div>
          )}

          <div className="control-group">
            <button
              onClick={resetToDemoData}
              className="reset-btn"
              title="Reset to demo data"
            >
              Reset Demo
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
