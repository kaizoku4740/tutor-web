import { useState, useEffect, useRef } from 'react';
import './TADashboard.css';

const TUTORS = [
  'Neha M.',
  'Nandita S.',
  'Samhithaa S.',
  'Abhiram M.'
];

export default function TADashboard() {
  const [selectedTutor, setSelectedTutor] = useState(TUTORS[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mouseActive, setMouseActive] = useState(false);
  const mouseTimerRef = useRef(null);
  const intervalRef = useRef(null);

  // Track mouse activity to disable auto-refresh when user is actively viewing
  useEffect(() => {
    const handleMouseMove = () => {
      setMouseActive(true);
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
      mouseTimerRef.current = setTimeout(() => {
        setMouseActive(false);
      }, 5000); // Reset after 5 seconds of no mouse activity
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set up auto-refresh, but disable when user is actively looking
  useEffect(() => {
    loadDashboard();
    
    // Set up interval that checks mouseActive status
    const interval = setInterval(() => {
      // Only refresh if user is NOT actively using the dashboard
      if (!mouseActive) {
        loadDashboard();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [selectedTutor]); // Only depend on selectedTutor, not mouseActive

  async function loadDashboard() {
    setError('');
    try {
      const response = await fetch(
        `/api/ta-dashboard?tutor=${encodeURIComponent(selectedTutor)}`
      );

      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function deleteSignup(signupId) {
    if (!window.confirm('Are you sure you want to delete this signup?')) {
      return;
    }

    try {
      const response = await fetch(`/api/signups?id=${signupId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Key': 'admin-password-change-me'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete signup');
      }

      // Refresh the dashboard
      await loadDashboard();
    } catch (err) {
      console.error('Error deleting signup:', err);
      alert('Failed to delete signup: ' + err.message);
    }
  }

  if (loading && !data) {
    return <div className="ta-dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="ta-dashboard">
      <div className="ta-dashboard-header">
        <h1>📚 TA Dashboard</h1>
        <p>View student signups for your sessions</p>
        {mouseActive && <div className="refresh-disabled">✓ Auto-refresh paused while viewing</div>}
      </div>

      <div className="ta-controls">
        <div className="tutor-selector">
          {TUTORS.map(tutor => (
            <button
              key={tutor}
              className={`tutor-btn ${selectedTutor === tutor ? 'active' : ''}`}
              onClick={() => setSelectedTutor(tutor)}
            >
              {tutor}
            </button>
          ))}
        </div>
        <button className="refresh-btn" onClick={loadDashboard} disabled={loading}>
          {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      {error && <div className="ta-error">{error}</div>}

      {data && (
        <>
          <div className="ta-stats">
            <div className="stat-card">
              <h3>Total Students</h3>
              <div className="number">{data.totalStudents}</div>
            </div>
            <div className="stat-card">
              <h3>Sessions</h3>
              <div className="number">{data.totalSessions}</div>
            </div>
          </div>

          <div className="ta-sessions">
            {data.sessions.length === 0 ? (
              <div className="no-students">No signups yet</div>
            ) : (
              data.sessions.map((session, idx) => (
                <div key={idx} className="session-card">
                  <div className="session-header">
                    <div>
                      <h2>
                        {new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </h2>
                    </div>
                    <div>
                      <p><strong>Time:</strong> {session.time}</p>
                      <p><strong>Students:</strong> {session.students.length}/3</p>
                    </div>
                  </div>
                  <div className="students">
                    {session.students.length === 0 ? (
                      <div className="no-students">No students signed up yet</div>
                    ) : (
                      session.students.map((student, sidx) => (
                        <div key={sidx} className="student-item">
                          <div className="student-info">
                            <div>
                              <div className="student-name">{student.name}</div>
                            </div>
                            <div>
                              <div className="student-contact">
                                {student.isEmail ? '📧' : '📞'} {student.contact}
                              </div>
                            </div>
                            <div>
                              <div className="student-goal">{student.goal}</div>
                            </div>
                          </div>
                          <button
                            className="delete-btn"
                            onClick={() => deleteSignup(student.id)}
                            title="Delete this signup"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
