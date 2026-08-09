
import { useMemo, useState } from 'react';
import { apiRequest } from './api';
import Analytics from './Analytics';
import SmartJobMatch from './SmartJobMatch';
import InterviewPrep from './InterviewPrep';
import ResumeAnalyzer from './ResumeAnalyzer';

const statusOptions = ['Applied', 'Interview', 'Offer', 'Rejected'];

function Dashboard({ user, applications, setApplications, onLogout }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    location: '',
    appliedDate: '',
    salary: '',
  });

  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const stats = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter(
      (app) => app.status === 'Interview'
    ).length;
    const offers = applications.filter(
      (app) => app.status === 'Offer'
    ).length;
    const pending = applications.filter(
      (app) => app.status === 'Applied'
    ).length;

    return [
      {
        label: 'Total Applications',
        value: total,
        tone: 'accent',
      },
      {
        label: 'Interviews',
        value: interviews,
        tone: 'info',
      },
      {
        label: 'Offers',
        value: offers,
        tone: 'success',
      },
      {
        label: 'Pending',
        value: pending,
        tone: 'warning',
      },
    ];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch = [
        app.company,
        app.role,
        app.location,
        app.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const resetForm = () => {
    setFormData({
      company: '',
      role: '',
      status: 'Applied',
      location: '',
      appliedDate: '',
      salary: '',
    });

    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formData.company || !formData.role) {
      setFormError('Company and role are required.');
      return;
    }

    setActionLoading(true);

    try {
      if (editingId) {
        // UPDATE EXISTING APPLICATION
        const response = await apiRequest(
          `/api/applications/${editingId}`,
          {
            method: 'PUT',
            body: {
              company: formData.company,
              role: formData.role,
              status: formData.status,
              location: formData.location,
              appliedDate: formData.appliedDate,
              salary: formData.salary,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setFormError(
            result.message || 'Unable to update application.'
          );
          return;
        }

        setApplications(
          applications.map((app) =>
            app.id === editingId
              ? {
                  ...app,
                  company: formData.company,
                  role: formData.role,
                  status: formData.status,
                  location: formData.location,
                  appliedDate: formData.appliedDate,
                  salary: formData.salary,
                }
              : app
          )
        );

        resetForm();
        return;
      }

      // ADD NEW APPLICATION
      const response = await apiRequest('/api/applications', {
        method: 'POST',
        body: {
          company: formData.company,
          role: formData.role,
          status: formData.status,
          location: formData.location,
          appliedDate: formData.appliedDate,
          salary: formData.salary,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(
          result.message || 'Unable to add application.'
        );
        return;
      }

      setApplications([
        result.application,
        ...applications,
      ]);

      resetForm();
    } catch (error) {
      console.error(error);
      setFormError('Unable to connect to the server.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (application) => {
    setEditingId(application.id);

    setFormData({
      company: application.company || '',
      role: application.role || '',
      status: application.status || 'Applied',
      location: application.location || '',
      appliedDate: application.appliedDate || '',
      salary: application.salary || '',
    });

    setFormError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (applicationId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this application?'
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setFormError('');

    try {
      const response = await apiRequest(
        `/api/applications/${applicationId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setFormError(
          result.message || 'Unable to delete application.'
        );
        return;
      }

      setApplications(
        applications.filter(
          (app) => app.id !== applicationId
        )
      );

      if (editingId === applicationId) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      setFormError('Unable to connect to the server.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Career Growth Suite</h1>
          <p>Job Application Tracker</p>
        </div>

        <div className="topbar-actions">
          <span className="user-email">
            {user.email}
          </span>

          <button
            type="button"
            onClick={onLogout}
            className="secondary-btn"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="content-grid">
        <section className="hero-card">
          <div>
            <p className="eyebrow">
              Dashboard Overview
            </p>

            <h2>
              Keep every opportunity organized in one place.
            </h2>

            <p>
              Track applications, monitor interview progress,
              and stay focused on the roles that matter most.
            </p>
          </div>

          <div className="hero-badge">
            14 days to interview goal
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className={`stat-card ${stat.tone}`}
            >
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </article>
          ))}
        </section>

        <section className="main-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">
                  Applications
                </p>

                <h3>Recent activity</h3>
              </div>

              <div className="panel-controls">
                <input
                  type="text"
                  placeholder="Search company or role"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  {['All', ...statusOptions].map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {formError && (
              <p className="validation-error">
                {formError}
              </p>
            )}

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: 'center',
                          padding: '30px',
                        }}
                      >
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map(
                      (app) => (
                        <tr key={app.id}>
                          <td>{app.company}</td>

                          <td>{app.role}</td>

                          <td>
                            <span
                              className={`status-pill ${(
                                app.status || ''
                              ).toLowerCase()}`}
                            >
                              {app.status}
                            </span>
                          </td>

                          <td>
                            {app.location || '-'}
                          </td>

                          <td>
                            {app.appliedDate || '-'}
                          </td>

                          <td>
                            {app.salary || '-'}
                          </td>

                          <td>
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <button
                                type="button"
                                className="secondary-btn"
                                onClick={() =>
                                  handleEdit(app)
                                }
                                disabled={actionLoading}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="danger-btn"
                                onClick={() =>
                                  handleDelete(app.id)
                                }
                                disabled={actionLoading}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">
                  {editingId
                    ? 'Edit Application'
                    : 'Add Application'}
                </p>

                <h3>
                  {editingId
                    ? 'Update opportunity'
                    : 'Track a new opportunity'}
                </h3>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="application-form"
            >
              <label>
                Company

                <input
                  required
                  value={formData.company}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      company: event.target.value,
                    })
                  }
                  placeholder="Acme Corp"
                />
              </label>

              <label>
                Role

                <input
                  required
                  value={formData.role}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      role: event.target.value,
                    })
                  }
                  placeholder="Product Manager"
                />
              </label>

              <label>
                Status

                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      status: event.target.value,
                    })
                  }
                >
                  {statusOptions.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Location

                <input
                  value={formData.location}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      location: event.target.value,
                    })
                  }
                  placeholder="Remote"
                />
              </label>

              <label>
                Applied Date

                <input
                  type="date"
                  value={formData.appliedDate}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      appliedDate: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Salary

                <input
                  value={formData.salary}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      salary: event.target.value,
                    })
                  }
                  placeholder="₹6,00,000"
                />
              </label>

              <button
                type="submit"
                className="primary-btn full-width"
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'Saving...'
                  : editingId
                  ? 'Update Application'
                  : 'Save Application'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn full-width"
                  onClick={resetForm}
                  disabled={actionLoading}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </aside>
        </section>
        <Analytics applications={applications} />
        <SmartJobMatch />
        <InterviewPrep />
        <ResumeAnalyzer />

      </main>
    </div>
  );
}

export default Dashboard;

