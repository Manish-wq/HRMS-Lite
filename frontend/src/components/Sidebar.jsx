import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>HRMS <span>Lite</span></h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Users size={20} />
          <span>Employees</span>
        </NavLink>
        <NavLink to="/attendance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <CalendarCheck size={20} />
          <span>Attendance</span>
        </NavLink>
      </nav>
    </aside>
  );
}
