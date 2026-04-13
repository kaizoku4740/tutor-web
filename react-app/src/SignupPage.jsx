import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CSSTransition } from 'react-transition-group';
import './SignupPage.css';

const TA_ASSIGNMENTS = {
  "TA 1": "Neha M.",
  "TA 2": "Nandita S.",
  "TA 3": "Samhithaa S.",
  "TA 4": "Abhiram M.",
};

const TA_SCHEDULE = {
  "Neha M.": [
    { day: "Thursday", time: "7:00pm - 8:00pm" },
    { day: "Sunday", time: "11:00am - 12:00pm" },
  ],
  "Nandita S.": [
    { day: "Monday", time: "7:00pm - 8:00pm" },
  ],
  "Samhithaa S.": [
    { day: "Tuesday", time: "7:30pm - 8:30pm" },
  ],
  "Abhiram M.": [
    { day: "Wednesday", time: "7:00pm - 8:00pm" },
    { day: "Saturday", time: "11:00am - 12:00pm" },
  ],
};

const generateSlots = (month, year) => {
  const slots = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  Object.entries(TA_SCHEDULE).forEach(([tutor, schedule]) => {
    schedule.forEach(({ day, time }) => {
      for (let date = 1; date <= daysInMonth; date++) {
        const currentDate = new Date(year, month, date);
        if (currentDate.toLocaleDateString('en-US', { weekday: 'long' }) === day) {
          slots.push({
            id: `${tutor}-${date}`,
            date: currentDate.toISOString().split('T')[0],
            time,
            day,
            tutor,
            filled: 0,
            capacity: 3, // Added a cap of 3 people per signup day
          });
        }
      }
    });
  });

  return slots;
};

const SLOTS = generateSlots(3, 2026); // April 2026 (month is 0-indexed)

export default function SignupPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState(SLOTS);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    goal: '',
  });
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch updated slot counts from the backend
  const fetchSlotCounts = async () => {
    try {
      // Get all signups to update slot counts
      const response = await fetch('/api/contact-messages', {
        headers: {
          'X-Admin-Key': 'admin-password-change-me'
        }
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const signups = data.signups || [];
      
      // Count signups per slot
      const slotCounts = {};
      signups.forEach(signup => {
        const slotKey = `${signup.tutor}-${signup.date}-${signup.time}`;
        slotCounts[slotKey] = (slotCounts[slotKey] || 0) + 1;
      });
      
      // Update slots with new counts
      const updatedSlots = slots.map(slot => {
        const slotKey = `${slot.tutor}-${slot.date}-${slot.time}`;
        return {
          ...slot,
          filled: slotCounts[slotKey] || 0
        };
      });
      
      setSlots(updatedSlots);
    } catch (err) {
      console.error('Failed to fetch slot counts:', err);
    }
  };

  // Fetch counts on component mount and set up polling
  React.useEffect(() => {
    fetchSlotCounts();
    const interval = setInterval(fetchSlotCounts, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDayClick = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const slotsForDate = slots.filter((slot) => slot.date === dateString);
    if (slotsForDate.length > 0) {
      setSelectedDate(date);
      setSelectedSlot(slotsForDate[0]); // Select the first available slot
      setShowSignupForm(true);
      setValidationErrors({});
      setError('');
    }
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      return !slots.some((slot) => slot.date === dateString);
    }
    return false;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const slotsForDate = slots.filter((slot) => slot.date === dateString);
      if (slotsForDate.length > 0) {
        return (
          <ul className="slot-list">
            {slotsForDate.map((slot) => (
              <li key={slot.id}>
                {slot.time} - {slot.tutor} ({slot.filled}/{slot.capacity} slots filled)
              </li>
            ))}
          </ul>
        );
      }
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.emailOrPhone.trim()) errors.emailOrPhone = 'Email or phone is required';
    if (!formData.goal.trim()) errors.goal = 'Goal is required';
    
    // Validate email or phone format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    const isValidEmail = emailRegex.test(formData.emailOrPhone.trim());
    const isValidPhone = phoneRegex.test(formData.emailOrPhone.trim());
    
    if (formData.emailOrPhone.trim() && !isValidEmail && !isValidPhone) {
      errors.emailOrPhone = 'Please enter a valid email or phone number';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Check if slot is full
    if (selectedSlot && selectedSlot.filled >= selectedSlot.capacity) {
      setError('This slot is now full. Please select another time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send data to backend
      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          emailOrPhone: formData.emailOrPhone,
          goal: formData.goal,
          tutor: selectedSlot.tutor,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedSlot.time,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.errors?.[0] || 'Failed to submit signup');
        return;
      }

      // Show success message
      setSuccess(true);
      setFormData({ name: '', emailOrPhone: '', goal: '' });
      
      // Refresh slot counts immediately
      await fetchSlotCounts();
      
      // Close form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setShowSignupForm(false);
        setSelectedDate(null);
        setSelectedSlot(null);
      }, 3000);
    } catch (err) {
      setError('Failed to submit signup. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowSignupForm(false);
    setSelectedDate(null);
    setSelectedSlot(null);
    setFormData({ name: '', emailOrPhone: '', goal: '' });
    setValidationErrors({});
    setError('');
  };

  const handleClearForm = () => {
    setFormData({ name: '', emailOrPhone: '', goal: '' });
    setValidationErrors({});
    setError('');
  };

  return (
    <div className="signup-page">
      <h1>Signup for Math Sessions</h1>
      <Calendar
        onClickDay={handleDayClick}
        tileDisabled={tileDisabled}
        tileContent={tileContent}
        className="custom-calendar"
      />

      {showSignupForm && selectedDate && (
        <CSSTransition
          in={showSignupForm}
          timeout={{ enter: 500, exit: 300 }}
          classNames={{
            enter: 'fade-enter',
            enterActive: 'fade-enter-active',
            exit: 'fade-exit',
            exitActive: 'fade-exit-active',
          }}
          unmountOnExit
        >
          <div className="signup-form">
            {success ? (
              <div className="success-message">
                <h2>✓ You're All Set!</h2>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Contact:</strong> {formData.emailOrPhone}</p>
                <p><strong>Topic:</strong> {formData.goal}</p>
                <p style={{ marginTop: '15px', fontSize: '0.95em', color: '#f0f0f0' }}>
                  See you on {selectedDate.toDateString()} at {selectedSlot?.time} with {selectedSlot?.tutor}!
                </p>
              </div>
            ) : (
              <>
                <div className="form-header">
                  <h2>Sign Up for {selectedDate.toDateString()}</h2>
                  {selectedSlot && (
                    <p className="slot-info">{selectedSlot.time} - {selectedSlot.tutor} ({selectedSlot.filled}/{selectedSlot.capacity} filled)</p>
                  )}
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <label>
                    Name: *
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={validationErrors.name ? 'input-error' : ''}
                      placeholder="Enter your name"
                    />
                    {validationErrors.name && <span className="field-error">{validationErrors.name}</span>}
                  </label>

                  <label>
                    Email/Phone: *
                    <input
                      type="text"
                      name="emailOrPhone"
                      value={formData.emailOrPhone}
                      onChange={handleInputChange}
                      className={validationErrors.emailOrPhone ? 'input-error' : ''}
                      placeholder="Enter your email or phone number"
                    />
                    {validationErrors.emailOrPhone && <span className="field-error">{validationErrors.emailOrPhone}</span>}
                  </label>

                  <label>
                    Goal for the session: *
                    <textarea
                      name="goal"
                      value={formData.goal}
                      onChange={handleInputChange}
                      className={validationErrors.goal ? 'input-error' : ''}
                      placeholder="What would you like to work on?"
                      rows="4"
                    />
                    {validationErrors.goal && <span className="field-error">{validationErrors.goal}</span>}
                  </label>

                  <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                      {loading ? 'Submitting...' : 'Confirm Signup'}
                    </button>
                    <button type="button" onClick={handleClearForm} className="btn-clear" disabled={loading}>
                      Clear Form
                    </button>
                    <button type="button" onClick={handleCancel} className="btn-cancel" disabled={loading}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </CSSTransition>
      )}
    </div>
  );
}
