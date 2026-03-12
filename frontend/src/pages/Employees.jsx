import { useState, useEffect } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { employeeAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import './Employees.css';

const initialForm = { employee_id: '', full_name: '', email: '', department: '' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!form.employee_id.trim()) errors.employee_id = 'Employee ID is required';
    if (!form.full_name.trim()) errors.full_name = 'Full Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Invalid email format';
    if (!form.department.trim()) errors.department = 'Department is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await employeeAPI.create(form);
      setShowModal(false);
      setForm(initialForm);
      setFormErrors({});
      fetchEmployees();
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const serverErrors = {};
        Object.entries(data).forEach(([key, val]) => {
          serverErrors[key] = Array.isArray(val) ? val[0] : val;
        });
        setFormErrors(serverErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await employeeAPI.delete(id);
      setDeleteConfirm(null);
      fetchEmployees();
    } catch {
      setError('Failed to delete employee.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'employee_id' ? value.toUpperCase() : value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p className="page-subtitle">Manage your employee records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      {loading && <LoadingSpinner message="Loading employees..." />}
      {error && <ErrorMessage message={error} onRetry={fetchEmployees} />}

      {!loading && !error && employees.length === 0 && (
        <EmptyState message="No employees found. Add your first employee to get started." icon={Users} />
      )}

      {!loading && !error && employees.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Present Days</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td><span className="emp-id">{emp.employee_id}</span></td>
                  <td className="emp-name">{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td><span className="dept-badge">{emp.department}</span></td>
                  <td><span className="badge">{emp.total_present ?? 0}</span></td>
                  <td>
                    {deleteConfirm === emp.id ? (
                      <div className="delete-confirm">
                        <span>Delete?</span>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>Yes</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                      </div>
                    ) : (
                      <button className="btn-icon danger" onClick={() => setDeleteConfirm(emp.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Add New Employee" onClose={() => { setShowModal(false); setFormErrors({}); }}>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="employee_id">Employee ID</label>
              <input
                id="employee_id"
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                placeholder="e.g. EMP001"
                className={formErrors.employee_id ? 'input-error' : ''}
              />
              {formErrors.employee_id && <span className="field-error">{formErrors.employee_id}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={formErrors.full_name ? 'input-error' : ''}
              />
              {formErrors.full_name && <span className="field-error">{formErrors.full_name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. john@company.com"
                className={formErrors.email ? 'input-error' : ''}
              />
              {formErrors.email && <span className="field-error">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
                className={formErrors.department ? 'input-error' : ''}
              />
              {formErrors.department && <span className="field-error">{formErrors.department}</span>}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setFormErrors({}); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Employee'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
