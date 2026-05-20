import { useEffect, useState } from 'react';
import { resumeAPI } from '../services/api';
import { showToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import '../styles/Analyze.css';

const Analyze = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await resumeAPI.getAll();
        const resumeArray =
          response?.data?.resumes ||
          response?.data?.data ||
          (Array.isArray(response?.data) ? response.data : []);

        setResumes(resumeArray);
      } catch (error) {
        console.error(error);
        showToast('Failed to fetch resumes', 'error');
      }
    };

    fetchResumes();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResume) {
      showToast('Please select a resume', 'error');
      return;
    }

    if (!jobDescription.trim()) {
      showToast('Please enter a job description', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await resumeAPI.analyze({
        resumeId: selectedResume,
        jobDescription,
      });

      const data = response?.data?.data || {};
      setResult(data);
      showToast('Analysis completed!', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const splitKeywords = (keywordsArray) => {
    if (!Array.isArray(keywordsArray)) return [];
    return keywordsArray
      .flatMap((item) => item.split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  };

  return (
    <div className="analyze-shell">
      <Navbar />

      <main className="analyze-main">
        <section className="analyze-hero">
          <h1>Analyze Resume Against Job Description</h1>
          <p>
            Get detailed insights on how well your resume matches the job requirements using our
            advanced AI engine.
          </p>
        </section>

        <section className="analyze-form-card">
          <div className="field-group">
            <label htmlFor="resume-select">Select Resume</label>
            <div className="input-wrap">
              <span className="input-icon">CV</span>
              <select
                id="resume-select"
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
              >
                <option value="">Choose a resume...</option>
                {Array.isArray(resumes) &&
                  resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume?.fileName ||
                        `Uploaded on ${resume?.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'N/A'}`}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="job-description">Job Description</label>
            <div className="textarea-wrap">
              <span className="input-icon text-icon">JD</span>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here... (e.g. Responsibilities, Requirements, Tech Stack)"
                rows={10}
              />
              <span className="helper-text">AI Analysis Ready</span>
            </div>
          </div>

          <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Match'}
          </button>
          <p className="tos-note">
            By analyzing, you agree to our Terms of Service regarding data processing.
          </p>
        </section>

        {result && (
          <section className="result-card">
            <h2>Analysis Results</h2>

            <div className="stats-grid">
              <article>
                <h3>Match Score</h3>
                <strong>{result.matchScore ?? 0}%</strong>
              </article>
              <article>
                <h3>Interview Probability</h3>
                <strong>{result.interviewProbability ?? 0}%</strong>
              </article>
            </div>

            {splitKeywords(result.matchedKeywords).length > 0 && (
              <div className="chip-section">
                <h4>Matched Keywords</h4>
                <div className="chips">
                  {splitKeywords(result.matchedKeywords).map((keyword, index) => (
                    <span key={`${keyword}-${index}`} className="chip match">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {splitKeywords(result.missingKeywords).length > 0 && (
              <div className="chip-section">
                <h4>Missing Keywords</h4>
                <div className="chips">
                  {splitKeywords(result.missingKeywords).map((keyword, index) => (
                    <span key={`${keyword}-${index}`} className="chip miss">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.recruiterFeedback && (
              <div className="text-block">
                <h4>AI Recruiter Feedback</h4>
                <p>{result.recruiterFeedback}</p>
              </div>
            )}

            {Array.isArray(result.suggestions) && result.suggestions.length > 0 && (
              <div className="text-block">
                <h4>Improvement Suggestions</h4>
                <ul>
                  {result.suggestions.map((suggestion, index) => (
                    <li key={`${index}-${suggestion}`}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <div className="designer-note">
          <p>PROJECT DESIGNED BY</p>
          <span>Ankit Verma</span>
        </div>
      </main>

      <footer className="analyze-footer">
        <p>(c) 2023 ResumeAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Analyze;
