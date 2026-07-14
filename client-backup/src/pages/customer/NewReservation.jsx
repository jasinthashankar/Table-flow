import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarDays, Clock, Users, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useReservationStore from '../../store/useReservationStore';
import FormField from '../../components/common/FormField';

const SEATING_PREFERENCES = [
  { type: 'any', label: 'Any Preference', desc: 'No seating preference' },
  { type: 'couple', label: 'Couple Corner', desc: 'Cozy table for two' },
  { type: 'window', label: 'Window View', desc: 'Table adjacent to window' },
  { type: 'garden', label: 'Garden Area', desc: 'Shaded terrace or garden view' },
  { type: 'family', label: 'Family Booth', desc: 'Comfortable booth with extra space' },
  { type: 'group', label: 'Feast Table', desc: 'Spacious banquet table for groups' }
];

const NewReservation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { availability, fetchAvailability, placeReservation, isLoading, error, clearError } = useReservationStore();

  const [date, setDate] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState('any');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Form details
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [occasion, setOccasion] = useState('none');
  const [specialRequest, setSpecialRequest] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default date to tomorrow on load
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
    clearError();
  }, [clearError]);

  // Load availability when check parameters change
  useEffect(() => {
    if (!date) return;
    fetchAvailability(date, guestCount, seatingPreference).catch(() => {});
    setSelectedSlot('');
  }, [date, guestCount, seatingPreference, fetchAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedSlot) {
      setFormError('Please select a time slot from the available options.');
      return;
    }
    if (!guestName.trim()) {
      setFormError('Guest name is required.');
      return;
    }
    if (!guestPhone.trim() || !/^(?:\+91|0)?[6-9]\d{9}$/.test(guestPhone.trim())) {
      setFormError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        date,
        timeSlot: selectedSlot,
        guestCount,
        guestName,
        guestEmail,
        guestPhone,
        seatingPreference,
        occasion,
        specialRequest
      };
      const result = await placeReservation(payload);
      navigate(`/reservation-success/${result.reservationNumber}`);
    } catch (err) {
      setFormError(err.message || 'Failed to place reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 page-enter">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Request a Table Reservation</h1>
          <p className="text-sm text-slate-500">Provide dining parameters to check operational table availability.</p>
        </div>
      </div>

      {(error || formError) && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-semibold">Booking Error:</span> {formError || error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Parameters & Slots */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>Step 1: Dining Parameters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="tf-label">Select Date</label>
                <input
                  type="date"
                  className="tf-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="tf-label">Guest Count</label>
                <input
                  type="number"
                  className="tf-input"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                  min="1"
                  max="20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="tf-label">Seating Location Preference</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SEATING_PREFERENCES.map((pref) => (
                  <button
                    key={pref.type}
                    type="button"
                    onClick={() => setSeatingPreference(pref.type)}
                    className={`p-3 text-left border rounded-lg transition-all cursor-pointer ${
                      seatingPreference === pref.type
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-semibold text-xs text-slate-900 block capitalize">{pref.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">{pref.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Step 2: Time Slots Availability</span>
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 w-full" />
                ))}
              </div>
            ) : availability && availability.slots && availability.slots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availability.slots.map((slot) => {
                  const isAvailable = slot.availableTablesCount > 0;
                  return (
                    <button
                      key={slot.timeSlot}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot.timeSlot)}
                      className={`p-2.5 border rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                        selectedSlot === slot.timeSlot
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : isAvailable
                          ? 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                      }`}
                    >
                      <div>{slot.timeSlot}</div>
                      <div className={`text-[9px] mt-0.5 ${selectedSlot === slot.timeSlot ? 'text-blue-100' : 'text-slate-400'}`}>
                        {isAvailable ? `${slot.availableTablesCount} tables` : 'Fully Booked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">No operational slots available for this selection.</p>
            )}
          </div>
        </div>

        {/* Right Column: Contact Details & Submit */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 h-fit">
          <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Step 3: Contact & Request Info</span>
          </h2>

          <FormField
            label="Guest Name"
            name="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Name for the reservation"
            required
          />

          <FormField
            label="Guest Email"
            name="guestEmail"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="e.g. email@tableflow.com"
            required
            disabled
          />

          <FormField
            label="Contact Phone"
            name="guestPhone"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="10-digit Indian phone number"
            required
          />

          <div>
            <label className="tf-label">Occasion (Optional)</label>
            <select
              className="tf-select"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            >
              <option value="none">Just Dining Out</option>
              <option value="birthday">Birthday Celebration 🎂</option>
              <option value="anniversary">Anniversary Dinner 💖</option>
              <option value="date">Special Date Night 🕯️</option>
              <option value="family_dinner">Family Feast 👨‍👩‍👧‍👦</option>
              <option value="business">Business Dining 💼</option>
              <option value="other">Other Special Occasion 🎉</option>
            </select>
          </div>

          <div>
            <label className="tf-label">Special Requests (Optional)</label>
            <textarea
              className="tf-input h-20 resize-none text-xs"
              placeholder="e.g. High chair needed, dietary allergies, etc."
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              maxLength={500}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full btn-primary text-sm py-2.5 mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Submit Reservation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewReservation;
