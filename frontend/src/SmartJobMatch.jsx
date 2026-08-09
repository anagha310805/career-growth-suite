
import { useState } from 'react';

const skillList = [
  'javascript',
  'typescript',
  'react',
  'node',
  'node.js',
  'python',
  'java',
  'c',
  'c++',
  'sql',
  'mysql',
  'mongodb',
  'flask',
  'django',
  'html',
  'css',
  'git',
  'github',
  'docker',
  'aws',
  'azure',
  'power bi',
  'excel',
  'tableau',
  'machine learning',
  'data analysis',
  'rest api',
  'api',
];

function SmartJobMatch() {
  const [skills, setSkills] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);

  const analyzeMatch = () => {
    if (!skills.trim() || !jobDescription.trim()) {
      setResult({
        error: 'Please enter your skills and the job description.',
      });
      return;
    }

    const candidateText = skills.toLowerCase();
    const jobText = jobDescription.toLowerCase();

    const requiredSkills = skillList.filter((skill) =>
      jobText.includes(skill)
    );

    const matchedSkills = requiredSkills.filter((skill) =>
      candidateText.includes(skill)
    );

    const missingSkills = requiredSkills.filter(
      (skill) => !candidateText.includes(skill)
    );

    const score =
      requiredSkills.length > 0
        ? Math.round(
            (matchedSkills.length / requiredSkills.length) * 100
          )
        : 0;

    let recommendation = 'Needs Improvement';

    if (score >= 80) {
      recommendation = 'Strong Match';
    } else if (score >= 60) {
      recommendation = 'Good Match';
    } else if (score >= 40) {
      recommendation = 'Moderate Match';
    }

    setResult({
      score,
      matchedSkills,
      missingSkills,
      recommendation,
    });
  };

  const resetAnalysis = () => {
    setResult(null);
    setSkills('');
    setJobDescription('');
  };

  return (
    <section
      className="smart-match-section"
      style={{
        marginTop: '30px',
      }}
    >
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Career Intelligence</p>
            <h2>Smart Job Match</h2>
            <p>
              Compare your skills with a job description and
              identify your strongest and missing skills.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          <label>
            Your Skills

            <textarea
              value={skills}
              onChange={(event) =>
                setSkills(event.target.value)
              }
              placeholder="Example: Python, React, SQL, Flask, Git, MySQL"
              rows={8}
              style={{
                width: '100%',
                resize: 'vertical',
              }}
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
              rows={8}
              style={{
                width: '100%',
                resize: 'vertical',
              }}
            />
          </label>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '20px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="primary-btn"
            onClick={analyzeMatch}
          >
            Analyze Match
          </button>

          {result && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetAnalysis}
            >
              Reset
            </button>
          )}
        </div>

        {result?.error && (
          <p
            className="validation-error"
            style={{ marginTop: '20px' }}
          >
            {result.error}
          </p>
        )}

        {result && !result.error && (
          <div
            style={{
              marginTop: '30px',
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(59, 130, 246, 0.08)',
            }}
          >
            <p className="eyebrow">Match Result</p>

            <h2>
              {result.score}% Match
            </h2>

            <h3>
              {result.recommendation}
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              <div>
                <h4>✓ Matching Skills</h4>

                {result.matchedSkills.length > 0 ? (
                  <ul>
                    {result.matchedSkills.map(
                      (skill) => (
                        <li key={skill}>
                          {skill}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>No matching skills found.</p>
                )}
              </div>

              <div>
                <h4>✗ Missing Skills</h4>

                {result.missingSkills.length > 0 ? (
                  <ul>
                    {result.missingSkills.map(
                      (skill) => (
                        <li key={skill}>
                          {skill}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>
                    Excellent! No major skill gaps
                    detected.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default SmartJobMatch;

