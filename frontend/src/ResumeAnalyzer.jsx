
import { useState } from 'react';

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [message, setMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setMessage('');
    setSkills([]);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

    if (
      !fileName.endsWith('.pdf') &&
      !fileName.endsWith('.docx')
    ) {
      setFile(null);
      setMessage('Please upload a PDF or DOCX resume.');
      return;
    }

    setFile(selectedFile);
  };

  const analyzeResume = async () => {
    if (!file) {
      setMessage('Please upload your resume first.');
      return;
    }

    setAnalyzing(true);
    setMessage('');
    setSkills([]);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(
        'http://localhost:5000/api/resume/extract',
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.message || 'Unable to analyze resume.'
        );
        setAnalyzing(false);
        return;
      }

      setSkills(result.skills || []);

      if (!result.skills || result.skills.length === 0) {
        setMessage(
          'Resume processed, but no matching skills were detected.'
        );
      } else {
        setMessage(
          `Resume analyzed successfully. ${result.skills.length} skills detected.`
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(
        'Unable to connect to the resume analyzer.'
      );
    }

    setAnalyzing(false);
  };

  return (
    <section className="resume-analyzer-section">
      <div className="analytics-header">
        <div>
          <p className="eyebrow">Career Intelligence</p>

          <h2>Resume Analyzer</h2>

          <p>
            Upload your resume to automatically identify
            technical skills and improve your job matching.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Resume</p>
            <h3>Upload Your Resume</h3>
          </div>
        </div>

        <div className="application-form">
          <label>
            Resume File

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
          </label>

          {file && (
            <p className="resume-file-name">
              Selected: {file.name}
            </p>
          )}

          {message && (
            <p className="validation-error">
              {message}
            </p>
          )}

          <button
            type="button"
            className="primary-btn full-width"
            onClick={analyzeResume}
            disabled={analyzing}
          >
            {analyzing
              ? 'Analyzing Resume...'
              : 'Analyze Resume'}
          </button>
        </div>
      </div>

            {skills.length > 0 && (
        <div className="panel resume-skills-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Skills Detected</p>
              <h3>Your Resume Skills</h3>
            </div>

            <div className="hero-badge">
              {skills.length} Skills
            </div>
          </div>

          <div className="skills-container">
            {skills.map((skill) => (
              <span className="skill-badge" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ResumeAnalyzer;
