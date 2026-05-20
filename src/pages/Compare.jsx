import { useEffect, useMemo, useState } from 'react';
import { resumeAPI } from '../services/api';
import { showToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import '../styles/Compare.css';

const Compare = () => {
  const [resumes, setResumes] = useState([]);
  const [resume1, setResume1] = useState('');
  const [resume2, setResume2] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

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

  const selectedFirstResume = useMemo(
    () => resumes.find((item) => item._id === resume1),
    [resumes, resume1]
  );
  const selectedSecondResume = useMemo(
    () => resumes.find((item) => item._id === resume2),
    [resumes, resume2]
  );

  const getUploadAgeLabel = (dateValue) => {
    if (!dateValue) return 'Upload date unavailable';
    const now = new Date();
    const uploaded = new Date(dateValue);
    const diffMs = now - uploaded;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Uploaded just now';
    if (days === 1) return 'Uploaded 1 day ago';
    return `Uploaded ${days} days ago`;
  };

  const handleCompare = async () => {
    if (!resume1 || !resume2) {
      showToast('Please select both resumes', 'error');
      return;
    }

    if (resume1 === resume2) {
      showToast('Please select different resumes', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await resumeAPI.compare({
        resume1Id: resume1,
        resume2Id: resume2,
      });

      const data = response?.data?.data || response?.data || {};
      setComparison(data);
      showToast('Comparison completed!', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Comparison failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColorClass = (score = 0) => {
    if (score >= 80) return 'good';
    if (score >= 60) return 'mid';
    return 'low';
  };

  return (
    <div className="compare-shell">
      <Navbar />

      <main className="compare-main">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />

        <section className="compare-hero">
          <h1>Compare Resumes</h1>
          <p>
            Analyze differences between two resume versions side-by-side using our advanced AI to
            spot improvements instantly.
          </p>
        </section>

        <section className="compare-card">
          <div className="selectors-grid">
            <div className="selector-block">
              <label htmlFor="resume-first">First Resume Version</label>
              <div className="select-wrap">
                <span className="select-icon">CV</span>
                <select
                  id="resume-first"
                  value={resume1}
                  onChange={(e) => setResume1(e.target.value)}
                >
                  <option value="">Select first resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume?.fileName ||
                        `${resume?.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'N/A'} - Score: ${resume?.atsScore ?? 'N/A'}`}
                    </option>
                  ))}
                </select>
              </div>
              <p className="upload-note green-dot">{getUploadAgeLabel(selectedFirstResume?.createdAt)}</p>
            </div>

            <div className="vs-badge">VS</div>

            <div className="selector-block">
              <label htmlFor="resume-second">Second Resume Version</label>
              <div className="select-wrap">
                <span className="select-icon">R2</span>
                <select
                  id="resume-second"
                  value={resume2}
                  onChange={(e) => setResume2(e.target.value)}
                >
                  <option value="">Select second resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume?.fileName ||
                        `${resume?.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'N/A'} - Score: ${resume?.atsScore ?? 'N/A'}`}
                    </option>
                  ))}
                </select>
              </div>
              <p className="upload-note blue-dot">{getUploadAgeLabel(selectedSecondResume?.createdAt)}</p>
            </div>
          </div>

          <button className="compare-btn" onClick={handleCompare} disabled={loading}>
            {loading ? 'Comparing...' : 'Analyze & Compare Resumes'}
          </button>
          <p className="processing-note">
            Estimated processing time: <span>~15 seconds</span>
          </p>
        </section>

        {comparison && (
          <section className="compare-results">
            <div className="result-top">
              <article className="score-card">
                <h3>First Resume Score</h3>
                <strong className={getScoreColorClass(comparison?.resume1Score)}>
                  {comparison?.resume1Score ?? 0}%
                </strong>
              </article>
              <article className="score-card">
                <h3>Second Resume Score</h3>
                <strong className={getScoreColorClass(comparison?.resume2Score)}>
                  {comparison?.resume2Score ?? 0}%
                </strong>
              </article>
              <article className="score-card">
                <h3>Improvement</h3>
                <strong className={(comparison?.improvement ?? 0) >= 0 ? 'good' : 'low'}>
                  {(comparison?.improvement ?? 0) > 0 ? '+' : ''}
                  {comparison?.improvement ?? 0}%
                </strong>
              </article>
            </div>

            {comparison?.sectionComparison && (
              <div className="section-results">
                <h2>Section-wise Comparison</h2>
                <div className="section-list">
                  {Object.entries(comparison.sectionComparison).map(([section, data]) => {
                    const r1 = data?.resume1 ?? 0;
                    const r2 = data?.resume2 ?? 0;
                    const diff = data?.difference ?? 0;
                    return (
                      <article key={section} className="section-item">
                        <h4>{section}</h4>
                        <div className="bar-row">
                          <span>Resume 1</span>
                          <div className="bar-track">
                            <div className="bar-fill indigo" style={{ width: `${r1}%` }} />
                          </div>
                          <b>{r1}%</b>
                        </div>
                        <div className="bar-row">
                          <span>Resume 2</span>
                          <div className="bar-track">
                            <div className="bar-fill violet" style={{ width: `${r2}%` }} />
                          </div>
                          <b>{r2}%</b>
                        </div>
                        <p className="diff-text">
                          Difference: {diff > 0 ? '+' : ''}
                          {diff}%
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {Array.isArray(comparison?.insights) && comparison.insights.length > 0 && (
              <div className="insights-box">
                <h2>Key Insights</h2>
                <ul>
                  {comparison.insights.map((insight, index) => (
                    <li key={`${index}-${insight}`}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <div className="designer-block">
          {/* <p>PROJECT DESIGNED BY</p> */}
          {/* <span>Ankit Verma</span> */}
        </div>
      </main>
    </div>
  );
};

export default Compare;
