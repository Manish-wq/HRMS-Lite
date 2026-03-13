import { useState, useEffect } from 'react';
import { Users, CalendarCheck, Building2, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { employeeAPI, attendanceAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './Dashboard.css';

const DEPT_PAGE_SIZE = 3;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deptPage, setDeptPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, attRes] = await Promise.all([
        employeeAPI.getSummary(),
        attendanceAPI.getSummary(),
      ]);
      setData({
        employees: empRes.data,
        attendance: attRes.data,
      });
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const { employees, attendance } = data;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Overview of your HR management system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{employees.total_employees}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Departments</span>
            <span className="stat-value">{employees.total_departments}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Present</span>
            <span className="stat-value">{attendance.total_present}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Absent</span>
            <span className="stat-value">{attendance.total_absent}</span>
          </div>
        </div>
      </div>

      {employees.department_breakdown.length > 0 && (() => {
        const totalPages = Math.ceil(employees.department_breakdown.length / DEPT_PAGE_SIZE);
        const startIdx = (deptPage - 1) * DEPT_PAGE_SIZE;
        const paginated = employees.department_breakdown.slice(startIdx, startIdx + DEPT_PAGE_SIZE);

        return (
          <div className="card">
            <h2 className="card-title">Department Breakdown</h2>
            <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((dept) => (
                  <tr key={dept.department}>
                    <td>{dept.department}</td>
                    <td>
                      <span className="badge">{dept.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={deptPage === 1}
                  onClick={() => setDeptPage(deptPage - 1)}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="pagination-info">
                  Page {deptPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={deptPage === totalPages}
                  onClick={() => setDeptPage(deptPage + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
