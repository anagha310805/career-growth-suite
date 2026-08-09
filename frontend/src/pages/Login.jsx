
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';

function Login({ onLogin }) {
  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      if (!formState.email || !formState.password) {
        setError('Email and password are required.');
        setSubmitting(false);
        return;
      }

      const response = await apiRequest('/api/login', {
        method: 'POST',
        body: {
          email: formState.email,
          password: formState.password,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Invalid email or password.');
        setSubmitting(false);
        return;
      }

      onLogin(result.user);
      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Unable to connect to the server.');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Career Growth Suite</h1>

        <h2>Sign in to continue</h2>

        <p className="auth-description">
          Access your job tracker and manage applications securely.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <p className="validation-error">
              {error}
            </p>
          )}

          <label>
            Email

            <input
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState({
                  ...formState,
                  email: event.target.value,
                })
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={formState.password}
              onChange={(event) =>
                setFormState({
                  ...formState,
                  password: event.target.value,
                })
              }
              placeholder="Enter your password"
              required
            />
          </label>

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          New user?{' '}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

