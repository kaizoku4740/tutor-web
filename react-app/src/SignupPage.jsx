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
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    goal: '',
  });
  const [showSignupForm, setShowSignupForm] = useState(false);

  const handleDayClick = (date) => {
    const dateString = date.toISOString().split('T')[0];
    if (SLOTS.some((slot) => slot.date === dateString)) {
      setSelectedDate(date);
      setShowSignupForm(true);
    }
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      return !SLOTS.some((slot) => slot.date === dateString);
    }
    return false;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const slots = SLOTS.filter((slot) => slot.date === dateString);
      if (slots.length > 0) {
        return (
          <ul className="slot-list">
            {slots.map((slot) => (
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { ...formData, date: selectedDate });
    setFormData({ name: '', emailOrPhone: '', goal: '' });
    setShowSignupForm(false);
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
            <h2>Sign Up for {selectedDate.toDateString()}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <br />
              <label>
                Email/Phone:
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <br />
              <label>
                Goal for the day:
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                />
              </label>
              <br />
              <button type="submit">Submit</button>
            </form>
          </div>
        </CSSTransition>
      )}
    </div>
  );
}
