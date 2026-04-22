import { useState } from "react";
import { FaCalendarAlt, FaClock, FaTimes } from "react-icons/fa";
import { createVisit } from "../api/visits";
import { toast } from "../utils/toast";

const TIME_SLOTS = [
  "Morning (9:00–12:00)",
  "Afternoon (12:00–16:00)",
  "Evening (16:00–19:00)",
];

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function maxDateISO() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
}

export default function ScheduleVisitModal({ petId, petName, onClose, onSuccess }) {
  const [date, setDate]         = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !timeSlot) return;
    setLoading(true);
    try {
      await createVisit({ petId, date, timeSlot, notes });
      toast.success(`Visit scheduled for ${date}! 🐾`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to schedule visit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="visit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="visit-modal__close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="visit-modal__header">
          <FaCalendarAlt className="visit-modal__icon" />
          <h2>Schedule a Visit</h2>
          <p>Come meet <strong>{petName}</strong> in person!</p>
        </div>

        <form className="visit-modal__form" onSubmit={handleSubmit}>
          <label className="visit-modal__label">
            <FaCalendarAlt size="0.85em" /> Pick a date
            <input
              type="date"
              className="visit-modal__input"
              value={date}
              min={todayISO()}
              max={maxDateISO()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="visit-modal__label">
            <FaClock size="0.85em" /> Choose a time slot
            <div className="visit-modal__slots">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`visit-slot-btn${timeSlot === slot ? " visit-slot-btn--active" : ""}`}
                  onClick={() => setTimeSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </label>

          <label className="visit-modal__label">
            Notes (optional)
            <textarea
              className="visit-modal__textarea"
              placeholder={`e.g. I have a dog at home, allergies, questions about ${petName}…`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </label>

          <button
            type="submit"
            className="visit-modal__submit"
            disabled={!date || !timeSlot || loading}
          >
            {loading ? "Booking…" : "Confirm Visit 🐾"}
          </button>
        </form>
      </div>
    </div>
  );
}
