import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { resumeAPI } from '../services/api';
import { showToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const chartPresets = {
  skills: [10, 12, 15, 20, 35, 60, 85, 100],
  keywords: [20, 25, 40, 75, 60, 45, 30, 25],
  experience: [20, 50, 90, 50, 20, 15, 10, 10],
  formatting: [10, 10, 12, 15, 25, 50, 80, 100],
  education: [10, 30, 80, 95, 80, 30, 10, 5],
};

const sectionOrder = ['skills', 'keywords', 'experience', 'formatting', 'education'];

const normalizeSectionName = (name = '') => name.toLowerCase().replace(/\s+/g, '');

const sectionTitle = (key = '') => {
  if (key === 'skills') return 'Skills Match';
  if (key === 'keywords') return 'Keywords';
  if (key === 'experience') return 'Experience';
  if (key === 'formatting') return 'Formatting';
  if (key === 'education') return 'Education';
  return key.charAt(0).toUpperCase() + key.slice(1);
};

const getSectionColor = (sectionKey, score) => {
  if (sectionKey === 'keywords') return '#f59e0b';
  if (sectionKey === 'experience') return '#ef4444';
  if (sectionKey === 'education') return '#3b82f6';
  if ((score ?? 0) >= 80) return '#22c55e';
  if ((score ?? 0) >= 60) return '#f59e0b';
  return '#ef4444';
};

const scoreTagClass = (score = 0) => {
  if (score >= 80) return 'tag-green';
  if (score >= 60) return 'tag-amber';
  if (score >= 40) return 'tag-blue';
  return 'tag-red';
};

const getScoreLabel = (score = 0) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
};

const getCurveData = (sectionKey, score = 0) => {
  const preset = chartPresets[sectionKey];
  if (!preset) {
    return [5, 8, 12, 20, 40, 55, 70, score].map((value, index) => ({
      index,
      value,
    }));
  }

  const scale = Math.max(0.3, (score || 0) / 100);
  return preset.map((point, index) => ({
    index,
    value: Math.min(100, point * scale + (score > 70 ? 6 : 0)),
  }));
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await resumeAPI.getAll();
        const resumeArray =
          response?.data?.resumes ||
          response?.data?.data ||
          (Array.isArray(response?.data) ? response.data : []);

        setResumes(resumeArray);
        if (resumeArray.length > 0) {
          setSelectedResume(resumeArray[0]);
        }
      } catch (error) {
        console.error(error);
        showToast('Failed to fetch resumes', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const sections = useMemo(() => {
    if (!selectedResume?.sectionScores) return [];

    const mapped = Object.entries(selectedResume.sectionScores).map(([name, score]) => {
      const key = normalizeSectionName(name);
      const knownKey = sectionOrder.find((item) => key.includes(item)) || key;
      return {
        key: knownKey,
        title: sectionTitle(knownKey),
        score: Number(score) || 0,
      };
    });

    const sorted = mapped.sort((a, b) => {
      const ia = sectionOrder.indexOf(a.key);
      const ib = sectionOrder.indexOf(b.key);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    return sorted;
  }, [selectedResume]);

  const overallScore = selectedResume?.atsScore || 0;
  const ranking = selectedResume?.ranking || 0;
  const interviewProbability = selectedResume?.interviewProbability || 0;
  const scoreDashOffset = 440 - (440 * Math.max(0, Math.min(100, overallScore))) / 100;

  const heatmapItems = useMemo(() => {
    if (Array.isArray(selectedResume?.heatmapData) && selectedResume.heatmapData.length > 0) {
      return selectedResume.heatmapData.map((item) => ({
        section: item?.section || 'Section',
        score: Number(item?.importance) || 0,
      }));
    }

    return sections.map((section) => ({
      section: section.title,
      score: section.score,
    }));
  }, [selectedResume, sections]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Navbar />

      <main className="dashboard-content">
        <header className="hero-row">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p>Here is the performance overview of your latest resume scan.</p>
          </div>

          <div className="hero-actions">
            {resumes.length > 0 && (
              <div className="selector-wrap">
                <select
                  value={selectedResume?._id || ''}
                  onChange={(e) => {
                    const resume = resumes.find((item) => item._id === e.target.value);
                    setSelectedResume(resume || null);
                  }}
                >
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume?.createdAt ? new Date(resume.createdAt).toLocaleDateString('en-GB') : 'Resume'}
                      {' '} - Score: {resume?.atsScore ?? 'N/A'}
                      {resume?._id === selectedResume?._id ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className="upload-btn" onClick={() => navigate('/upload')}>Upload New Resume</button>
          </div>
        </header>

        {resumes.length === 0 ? (
          <section className="empty-panel">
            <h2>No resumes yet</h2>
            <p>Upload your first resume to generate ATS insights.</p>
            <button className="upload-btn" onClick={() => navigate('/upload')}>Upload Resume</button>
          </section>
        ) : (
          <>
            <section className="kpi-grid">
              <article className="kpi-card">
                <h3>Overall ATS Score</h3>
                <div className="score-ring">
                  <svg viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" />
                    <circle cx="80" cy="80" r="70" style={{ strokeDashoffset: scoreDashOffset }} />
                  </svg>
                  <div className="ring-content">
                    <strong>{overallScore}</strong>
                    <span>{getScoreLabel(overallScore)}</span>
                  </div>
                </div>
              </article>

              <article className="kpi-card">
                <h3>Global Ranking</h3>
                <div className="ranking-box">
                  <strong>Top {ranking}%</strong>
                  <p>Among {resumes.length.toLocaleString()} analyzed resumes</p>
                  <span className="pill">Top Tier Candidate</span>
                </div>
              </article>

              <article className="kpi-card">
                <h3>Interview Probability</h3>
                <div className="probability-box">
                  <div className="probability-top">
                    <strong>{interviewProbability}%</strong>
                    <span>Target: 80%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(interviewProbability, 100)}%` }} />
                  </div>
                  <p>Based on current market trends and keywords.</p>
                </div>
              </article>
            </section>

            <section className="section-block">
              <h2>Section-wise Analysis</h2>
              <div className="sections-grid">
                {sections.map((section) => {
                  const color = getSectionColor(section.key, section.score);
                  const data = getCurveData(section.key, section.score);
                  const isEducation = section.key === 'education';

                  return (
                    <article key={section.key} className={`section-card ${isEducation ? 'education-card' : ''}`}>
                      <div className="section-head">
                        <h4>{section.title}</h4>
                        <span className={scoreTagClass(section.score)}>{section.score}%</span>
                      </div>
                      <div className="mini-chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data}>
                            <defs>
                              <linearGradient id={`fill-${section.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.42} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.03} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="index" hide />
                            <YAxis hide domain={[0, 100]} />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={color}
                              strokeWidth={2}
                              fill={`url(#fill-${section.key})`}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="heatmap-card">
              <h2>Resume Heatmap Breakdown</h2>
              <div className="heatmap-grid">
                {heatmapItems.map((item) => {
                  const value = Math.max(0, Math.min(100, item.score));
                  const tone = value >= 80 ? 'tone-strong' : value >= 60 ? 'tone-mid' : value >= 40 ? 'tone-soft' : 'tone-muted';
                  return (
                    <div key={`${item.section}-${value}`} className={`heat-item ${tone}`}>
                      <p>{item.section}</p>
                      <strong>{value}%</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="dashboard-actions">
              <button className="outline-btn" onClick={() => navigate('/analyze')}>
                Analyze with Job Description
              </button>
              <button className="neutral-btn" onClick={() => navigate('/compare')}>
                Compare Resumes
              </button>
              <button className="gradient-btn" onClick={() => navigate('/coach')}>
                Ask AI Career Coach
              </button>
            </section>
          </>
        )}

        <footer className="dash-footer">
          <p>Project designed for superior ATS compliance.</p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
