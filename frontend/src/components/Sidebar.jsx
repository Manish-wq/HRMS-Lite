import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <h2>HRMS <span>Lite</span></h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={onClose}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={onClose}>
          <Users size={20} />
          <span>Employees</span>
        </NavLink>
        <NavLink to="/attendance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={onClose}>
          <CalendarCheck size={20} />
          <span>Attendance</span>
        </NavLink>
      </nav>
    </aside>
  );
}
