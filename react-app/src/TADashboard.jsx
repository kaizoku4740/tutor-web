import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [selectedTutor]);

  async function loadDashboard() {
    setLoading(true);
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
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
      </div>

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
