
import { useState } from 'react';

function InterviewPrep() {
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showResults, setShowResults] = useState(false);

  const generatePreparation = () => {
    if (!role.trim() || !jobDescription.trim()) {
      return;
    }

    setShowResults(true);
  };

  const technicalQuestions = [
    `What are the key skills required for a ${role}?`,
    `Explain a project where you used your technical skills.`,
    `How do you troubleshoot a technical problem?`,
    `How do you ensure the quality of your code?`,
    `How would you improve the performance of an application?`,
  ];

  const hrQuestions = [
    'Tell me about yourself.',
    'Why are you interested in this role?',
    'Why should we hire you?',
    'What are your strengths and weaknesses?',
    'Where do you see yourself in five years?',
  ];

  const preparationTopics = [
    'Review the technical skills mentioned in the job description.',
    'Prepare a clear explanation of your projects.',
    'Research the company and its products.',
    'Practice common HR interview questions.',
    'Prepare questions to ask the interviewer.',
  ];

  return (
    <section className="interview-prep-section">
      <div className="analytics-header">
        <div>
          <p className="eyebrow">Career Intelligence</p>
          <h2>Interview Preparation Assistant</h2>
          <p>
            Prepare for your next interview with role-specific questions
            and a practical preparation checklist.
          </p>
        </div>
      </div>

      <div className="panel interview-input-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Prepare</p>
            <h3>Enter Job Details</h3>
          </div>
        </div>

        <div className="application-form">
          <label>
            Job Role
            <input
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Software Developer"
            />
          </label>

          <label>
            Job Description
            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              placeholder="Paste the job description here..."
              rows="8"
            />
          </label>

          <button
            type="button"
            className="primary-btn full-width"
            onClick={generatePreparation}
          >
            Generate Interview Preparation
          </button>
        </div>
      </div>

      {showResults && (
        <div className="interview-results">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Technical Round</p>
                <h3>Technical Questions</h3>
              </div>
            </div>

            <div className="prep-list">
              {technicalQuestions.map((question, index) => (
                <div className="prep-item" key={index}>
                  <strong>{index + 1}.</strong>
                  <span>{question}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">HR Round</p>
                <h3>Common HR Questions</h3>
              </div>
            </div>

            <div className="prep-list">
              {hrQuestions.map((question, index) => (
                <div className="prep-item" key={index}>
                  <strong>{index + 1}.</strong>
                  <span>{question}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Preparation Plan</p>
                <h3>What to Prepare</h3>
              </div>
            </div>

            <div className="prep-list">
              {preparationTopics.map((topic, index) => (
                <div className="prep-item" key={index}>
                  <strong>✓</strong>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default InterviewPrep;

