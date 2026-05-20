import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { showToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import '../styles/Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      showToast('Please upload a PDF or DOCX file', 'error');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      showToast('File size should be less than 5MB', 'error');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a file first', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    try {
      await resumeAPI.upload(formData);
      showToast('Resume uploaded successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-shell">
      <Navbar />

      <main className="upload-main">
        <div className="mesh-layer mesh-a" />
        <div className="mesh-layer mesh-b" />
        <div className="mesh-layer mesh-c" />

        <section className="upload-hero">
          <div className="hero-chip">AI-Powered Analysis V2.0</div>
          <h1>Upload Your Resume</h1>
          <p>
            Unlock your career potential. Our advanced AI analyzes your resume against millions of
            job descriptions to give you the competitive edge.
          </p>
        </section>

        <section className="upload-drop-wrap">
          <div className="drop-glow" />
          <div
            className={`drop-card ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx"
              onChange={handleChange}
              className="hidden-input"
            />

            <div className="drop-icon-stack">
              <div className="icon-main">UP</div>
              <span className="icon-note icon-a">CV</span>
              <span className="icon-note icon-b">OK</span>
            </div>

            {file ? (
              <div className="file-state">
                <h3>{file.name}</h3>
                <p>{(file.size / 1024).toFixed(1)} KB</p>
                <div className="file-actions">
                  <button
                    type="button"
                    className="browse-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change File
                  </button>
                  <button type="button" className="upload-btn" onClick={handleUpload} disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload and Analyze'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>Drag & Drop your resume</h3>
                <p>Supported formats: PDF, DOCX</p>
                <button
                  type="button"
                  className="browse-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </button>
              </>
            )}
          </div>
        </section>

        <section className="upload-features">
          <article className="u-feature red">
            <div className="u-icon">AT</div>
            <h4>ATS Scoring</h4>
            <p>Get detailed ATS compatibility score with section-wise analysis to improve reach.</p>
          </article>
          <article className="u-feature violet">
            <div className="u-icon">AI</div>
            <h4>AI Insights</h4>
            <p>Receive AI-powered feedback and personalized suggestions to highlight strengths.</p>
          </article>
          <article className="u-feature blue">
            <div className="u-icon">HM</div>
            <h4>Heatmap Analysis</h4>
            <p>Visual heatmap showing which sections recruiters focus on most and what to improve.</p>
          </article>
          <article className="u-feature amber">
            <div className="u-icon">JM</div>
            <h4>Job Matching</h4>
            <p>Compare your resume against job descriptions to tailor your application for success.</p>
          </article>
        </section>
      </main>

      <footer className="upload-footer">
        <p>(c) 2023 ATS Analyzer. All rights reserved.</p>
        <div>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Upload;
