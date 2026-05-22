// src/components/resident/JobRequestForm.jsx
// ---------------------------------------------------------------------------
// Skill-Link CDO Web App — Job Request Submission Form
// ---------------------------------------------------------------------------
// Resident fills out this form to submit a job request.
// On submission:
//   1. The form data is POST-ed to Django.
//   2. Django calls the FastAPI ML service internally.
//   3. The ranked worker list comes back in the same response.
//   4. This component passes matched_workers to the parent,
//      which renders the MatchedWorkersList component.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { jobService } from '../../services/apiService';

const SKILL_CATEGORIES = [
  'Plumber', 'Electrician', 'Carpenter', 'Mason',
  'Welder',
];

export default function JobRequestForm({ onMatchResult }) {
  const [form, setForm] = useState({
    title:              '',
    description:        '',
    category:           '',
    budget_min:         '',
    budget_max:         '',
    location_address:   '',
    location_lat:       '',
    location_lng:       '',
    preferred_start_date: '',
  });

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -------------------------------------------------------------------------
  // Use the browser Geolocation API to fill in the job location.
  // This asks the user's device for its CURRENT position and uses it
  // as the job site location. The resident can also type an address manually.
  //
  // Note: This is the job location — where the work will be done.
  // It is NOT used for continuous tracking. It is a one-time read
  // to fill the location_lat and location_lng fields in the form.
  // -------------------------------------------------------------------------
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          location_lat: position.coords.latitude.toFixed(7),
          location_lng: position.coords.longitude.toFixed(7),
        }));
      },
      () => {
        setError('Could not retrieve your location. Please enter it manually.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (parseFloat(form.budget_min) > parseFloat(form.budget_max)) {
      setError('Minimum budget cannot be greater than maximum budget.');
      return;
    }
    if (!form.location_lat || !form.location_lng) {
      setError('Please provide a job location.');
      return;
    }

    setLoading(true);

    const { ok, data } = await jobService.submitJobRequest({
      title:               form.title,
      description:         form.description,
      category:            form.category,
      budget_min:          parseFloat(form.budget_min),
      budget_max:          parseFloat(form.budget_max),
      location_address:    form.location_address,
      location_lat:        parseFloat(form.location_lat),
      location_lng:        parseFloat(form.location_lng),
      preferred_start_date: form.preferred_start_date || null,
    });

    setLoading(false);

    if (!ok) {
      setError(data?.detail || 'Failed to submit job request. Please try again.');
      return;
    }

    // Pass the ML match results up to the parent component.
    // data.matched_workers is the ranked list from the FastAPI ML service.
    onMatchResult({
      jobRequest:     data.job_request,
      matchedWorkers: data.matched_workers,
      totalMatches:   data.total_matches,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="job-request-form">
      <h2>Submit a Job Request</h2>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {/* Job Title */}
      <div className="form-group">
        <label htmlFor="title">Job Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Fix leaking kitchen pipe"
          required
        />
      </div>

      {/* Skill Category */}
      <div className="form-group">
        <label htmlFor="category">Skill Category Required</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          {SKILL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description">Work Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the work in detail. The more specific you are, the better your matches will be."
          rows={4}
          required
        />
        <small>
          This description is used by the matching engine to find the most
          relevant workers. Be specific about the problem and required skills.
        </small>
      </div>

      {/* Budget Range */}
      <div className="form-group form-row">
        <div>
          <label htmlFor="budget_min">Budget Min (PHP)</label>
          <input
            id="budget_min"
            name="budget_min"
            type="number"
            min="0"
            value={form.budget_min}
            onChange={handleChange}
            placeholder="e.g. 400"
            required
          />
        </div>
        <div>
          <label htmlFor="budget_max">Budget Max (PHP)</label>
          <input
            id="budget_max"
            name="budget_max"
            type="number"
            min="0"
            value={form.budget_max}
            onChange={handleChange}
            placeholder="e.g. 700"
            required
          />
        </div>
      </div>
      <small>
        Budget is a soft preference — workers slightly outside your range
        may still appear in results if they rank well on other signals.
      </small>

      {/* Job Location */}
      <div className="form-group">
        <label htmlFor="location_address">Job Location Address</label>
        <input
          id="location_address"
          name="location_address"
          type="text"
          value={form.location_address}
          onChange={handleChange}
          placeholder="e.g. Purok 3, Barangay Carmen, CDO"
          required
        />
      </div>

      <div className="form-group form-row">
        <div>
          <label htmlFor="location_lat">Latitude</label>
          <input
            id="location_lat"
            name="location_lat"
            type="number"
            step="0.0000001"
            value={form.location_lat}
            onChange={handleChange}
            placeholder="8.4542"
          />
        </div>
        <div>
          <label htmlFor="location_lng">Longitude</label>
          <input
            id="location_lng"
            name="location_lng"
            type="number"
            step="0.0000001"
            value={form.location_lng}
            onChange={handleChange}
            placeholder="124.6319"
          />
        </div>
      </div>

      <button type="button" onClick={useCurrentLocation} className="btn-secondary">
        📍 Use My Current Location
      </button>

      {/* Preferred Date */}
      <div className="form-group">
        <label htmlFor="preferred_start_date">Preferred Start Date</label>
        <input
          id="preferred_start_date"
          name="preferred_start_date"
          type="date"
          value={form.preferred_start_date}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Finding Matches...' : 'Submit & Find Workers'}
      </button>
    </form>
  );
}