import { useState, useEffect } from 'react';
import { Plus, CalendarCheck, Filter, Trash2, Pencil } from 'lucide-react';
import { attendanceAPI, employeeAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import './Attendance.css';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filters
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Form
  const [form, setForm] = useState({ employee: '', date: '', status: 'Present' });

  const today = new Date().toISOString().split('T')[0];

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterEmployee) params.employee = filterEmployee;
      if (filterDate) params.date = filterDate;
      const res = await attendanceAPI.getAll(params);
      setRecords(res.data);
    } catch {
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [filterEmployee, filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.employee) errors.employee = 'Please select an employee';
    if (!form.date) errors.date = 'Please select a date';
    if (!form.status) errors.status = 'Please select a status';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      if (form.id) {
        await attendanceAPI.update(form.id, { employee: form.employee, date: form.date, status: form.status });
      } else {
        await attendanceAPI.create(form);
      }
      setShowModal(false);
      setForm({ employee: '', date: '', status: 'Present' });
      setFormErrors({});
      fetchRecords();
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'object' && data.non_field_errors) {
          setFormErrors({ general: data.non_field_errors[0] });
        } else if (Array.isArray(data)) {
          setFormErrors({ general: data[0] });
        } else {
          const serverErrors = {};
          Object.entries(data).forEach(([key, val]) => {
            serverErrors[key] = Array.isArray(val) ? val[0] : val;
          });
          setFormErrors(serverErrors);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (rec) => {
    setForm({ id: rec.id, employee: rec.employee, date: rec.date, status: rec.status });
    setFormErrors({});
    setShowModal(true);
  };

  const clearFilters = () => {
    setFilterEmployee('');
    setFilterDate('');
  };

  const handleDelete = async (id) => {
    try {
      await attendanceAPI.delete(id);
      setDeleteConfirm(null);
      fetchRecords();
    } catch {
      setError('Failed to delete attendance record.');
    }
  };

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p className="page-subtitle">Track and manage daily attendance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <Filter size={16} />
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_id} - {emp.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            max={today}
            title={`Cannot select dates after today (${today})`}
          />
        </div>
        {(filterEmployee || filterDate) && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
            Clear
          </button>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading attendance records..." />}
      {error && <ErrorMessage message={error} onRetry={fetchRecords} />}

      {!loading && !error && records.length === 0 && (
        <EmptyState
          message="No attendance records found. Mark attendance to get started."
          icon={CalendarCheck}
        />
      )}

      {!loading && !error && records.length > 0 && (
        <div className="card">
          <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td><span className="emp-id">{rec.employee_id_display}</span></td>
                  <td className="emp-name">{rec.employee_name}</td>
                  <td>{rec.date}</td>
                  <td>
                    <span className={`status-badge ${rec.status.toLowerCase()}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>
                    {deleteConfirm === rec.id ? (
                      <div className="delete-confirm">
                        <span>Delete?</span>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rec.id)}>Yes</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="btn-icon edit" onClick={() => handleEdit(rec)} title="Edit status">
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon danger" onClick={() => setDeleteConfirm(rec.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title={form.id ? 'Edit Attendance' : 'Mark Attendance'} onClose={() => { setShowModal(false); setFormErrors({}); setForm({ employee: '', date: '', status: 'Present' }); }}>
          <form onSubmit={handleSubmit} className="form">
            {formErrors.general && (
              <div className="form-error-banner">{formErrors.general}</div>
            )}
            <div className="form-group">
              <label htmlFor="att-employee">Employee</label>
              <select
                id="att-employee"
                value={form.employee}
                onChange={(e) => setForm({ ...form, employee: e.target.value })}
                className={formErrors.employee ? 'input-error' : ''}
                disabled={!!form.id}
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} - {emp.full_name}
                  </option>
                ))}
              </select>
              {formErrors.employee && <span className="field-error">{formErrors.employee}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="att-date">Date</label>
              <input
                id="att-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                max={today}
                title={`Cannot select dates after today (${today})`}
                className={formErrors.date ? 'input-error' : ''}
                disabled={!!form.id}
              />
              {formErrors.date && <span className="field-error">{formErrors.date}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="att-status">Status</label>
              <select
                id="att-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={formErrors.status ? 'input-error' : ''}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              {formErrors.status && <span className="field-error">{formErrors.status}</span>}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setFormErrors({}); setForm({ employee: '', date: '', status: 'Present' }); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : form.id ? 'Update Attendance' : 'Mark Attendance'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
