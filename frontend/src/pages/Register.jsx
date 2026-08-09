import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';

function Register() {
  const [formState, setFormState] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!formState.email || !formState.password || !formState.confirmPassword) {
      setError('Please complete all fields.');
      setSubmitting(false);
      return;
    }
    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match.');
      setSubmitting(false);
      return;
    }
    if (formState.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setSubmitting(false);
      return;
    }

    const response = await apiRequest('/api/register', {
      method: 'POST',
      body: {
        email: formState.email,
        password: formState.password,
        confirmPassword: formState.confirmPassword,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.message || 'Unable to register.');
      setSubmitting(false);
      return;
    }

    setSuccess('Registration successful. Please log in.');
    setFormState({ email: '', password: '', confirmPassword: '' });
    setSubmitting(false);
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-branding">
          <p className="eyebrow">Career Growth Suite</p>
          <h1>Create your account</h1>
          <p>Register securely and start tracking your job applications.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="validation-error">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <label>
            Email
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState({ ...formState, email: event.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={formState.password}
              onChange={(event) => setFormState({ ...formState, password: event.target.value })}
              placeholder="Create a password"
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={formState.confirmPassword}
              onChange={(event) => setFormState({ ...formState, confirmPassword: event.target.value })}
              placeholder="Repeat your password"
              required
            />
          </label>
          <button type="submit" className="primary-btn full-width" disabled={submitting}>
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
