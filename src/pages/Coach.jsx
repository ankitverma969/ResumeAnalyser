import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { resumeAPI, aiAPI } from '../services/api';
import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Coach.css';

const getNowTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Coach = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I've analyzed your Senior Software Engineer resume. Your experience with distributed systems is impressive, but your bullet points could use more quantifiable achievements.\n\nHow can I help you optimize it today?",
      displayedContent:
        "Hello! I've analyzed your Senior Software Engineer resume. Your experience with distributed systems is impressive, but your bullet points could use more quantifiable achievements.\n\nHow can I help you optimize it today?",
      time: '10:24 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedResumeInfo = resumes.find((item) => item._id === selectedResume);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await resumeAPI.getAll();
        const resumeArray =
          response?.data?.resumes ||
          response?.data?.data ||
          (Array.isArray(response?.data) ? response.data : []);

        setResumes(resumeArray);
        if (resumeArray.length > 0) setSelectedResume(resumeArray[0]._id);
      } catch (error) {
        console.error(error);
        showToast('Failed to fetch resumes', 'error');
      }
    };

    fetchResumes();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!messages.length || messages[0].role !== 'assistant') return;
    const firstName = (user?.name || 'User').split(' ')[0];
    const resumeLabel = selectedResumeInfo?.fileName || 'your selected resume';
    const intro =
      `Hello ${firstName}! I've analyzed ${resumeLabel}. ` +
      'Your experience is strong, but some bullet points can use more quantifiable achievements.\n\n' +
      'How can I help you optimize it today?';

    setMessages((prev) => {
      if (!prev.length || prev[0].role !== 'assistant') return prev;
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        content: intro,
        displayedContent: intro,
      };
      return updated;
    });
  }, [selectedResumeInfo?.fileName, user?.name]);

  const typeMessage = (fullText, messageIndex) => {
    let i = 0;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const updated = [...prev];
        if (!updated[messageIndex]) return prev;
        updated[messageIndex].displayedContent = fullText.slice(0, i + 1);
        return updated;
      });
      i += 1;
      if (i >= fullText.length) clearInterval(interval);
    }, 14);
  };

  const personalizeAssistantText = (text) => {
    const firstName = (user?.name || 'User').split(' ')[0];
    return (text || '').replace(/\bMartina\b/gi, firstName);
  };

  const handleSend = async (prefilledQuestion) => {
    const question = (prefilledQuestion ?? input).trim();
    if (!question) return;

    if (!selectedResume) {
      showToast('Please select a resume first', 'error');
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question, time: getNowTime() },
      { role: 'assistant', content: '', displayedContent: '', isThinking: true, time: getNowTime() },
    ]);
    setInput('');
    setLoading(true);

    try {
      const firstName = (user?.name || 'User').split(' ')[0];
      const resumeLabel = selectedResumeInfo?.fileName || 'Selected resume';
      const contextualQuestion = [
        `User name: ${firstName}`,
        `Resume file: ${resumeLabel}`,
        'Instruction: Address the user by this name and do not assume any other name.',
        `Question: ${question}`,
      ].join('\n');

      const response = await aiAPI.chatCoach({
        resumeId: selectedResume,
        question: contextualQuestion,
      });

      const rawAnswer =
        response?.data?.answer ||
        response?.data?.data?.answer ||
        'No response received.';
      const answer = personalizeAssistantText(rawAnswer);

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop();
        updated.push({
          role: 'assistant',
          content: answer,
          displayedContent: '',
          time: getNowTime(),
        });
        const index = updated.length - 1;
        setTimeout(() => typeMessage(answer, index), 120);
        return updated;
      });

      showToast('Response generated', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Failed to get response', 'error');
      setMessages((prev) => {
        const updated = [...prev];
        updated.pop();
        updated.push({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          displayedContent: 'Sorry, I encountered an error. Please try again.',
          time: getNowTime(),
        });
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'How can I improve my resume?',
    'Common ATS mistakes?',
    'Interview prep for SWE',
    'Check bullet points impact',
  ];

  return (
    <div className="coach-shell">
      <Navbar />

      <main className="coach-main">
        <aside className="coach-sidebar">
          <div className="side-group">
            <label>RESUME CONTEXT</label>
            <div className="resume-card">
              <div>
                <p className="resume-name">
                  {selectedResumeInfo?.fileName || 'Select resume'}
                </p>
                <p className="resume-meta">Last updated 2 days ago</p>
              </div>
              <select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)}>
                <option value="">No resume selected</option>
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume?.fileName || new Date(resume.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="side-group">
            <label>QUICK QUESTIONS</label>
            <div className="quick-list">
              {quickQuestions.map((question, index) => (
                <button key={question} onClick={() => handleSend(question)} disabled={loading}>
                  <span className={`q-dot q-${index + 1}`} />
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="tip-card">
            <p>
              <strong>Pro Tip:</strong> Ask me to rewrite specific job descriptions to be more
              data-driven.
            </p>
          </div>
        </aside>

        <section className="coach-chat-panel">
          <header className="chat-top">
            <div className="bot-info">
              <div className="bot-avatar">AI</div>
              <div>
                <h3>AI Career Coach</h3>
                <p>Online | Powered by GPT-4o</p>
              </div>
            </div>
            <div className="chat-actions">
              <button>DL</button>
              <button>...</button>
            </div>
          </header>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`msg-row ${message.role}`}>
                <div className="msg-avatar">{message.role === 'assistant' ? 'AI' : 'U'}</div>
                <div className={`msg-bubble ${message.role}`}>
                  {message.role === 'assistant' ? (
                    message.isThinking ? (
                      <div className="thinking">
                        <span />
                        <span />
                        <span />
                      </div>
                    ) : (
                      <>
                        <ReactMarkdown>{message.displayedContent || message.content}</ReactMarkdown>
                        {index === messages.length - 1 &&
                          message.displayedContent !== message.content && (
                            <span className="typing-cursor">|</span>
                          )}
                      </>
                    )
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <small>{message.time || ''}</small>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <footer className="chat-input-wrap">
            <div className="input-row">
              <button className="attach-btn">+</button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question here..."
                rows={1}
                disabled={loading}
              />
              <button className="send-btn" onClick={() => handleSend()} disabled={loading || !input.trim()}>
                Send
              </button>
            </div>
            <div className="input-meta">
              <span>AI IS PROCESSING YOUR CONTEXT</span>
              <span>Press Cmd + Enter to send</span>
            </div>
          </footer>
        </section>
      </main>

      <footer className="coach-footer">
        <p>(c) 2024 ResumeAI. Empowering careers with intelligent insights.</p>
        <div>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#support">Support</a>
          <a href="#docs">Documentation</a>
        </div>
      </footer>
    </div>
  );
};

export default Coach;
