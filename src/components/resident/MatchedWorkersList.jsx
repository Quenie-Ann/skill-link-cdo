// src/components/resident/MatchedWorkersList.jsx
// ---------------------------------------------------------------------------
// Skill-Link CDO Web App — ML Match Results Display
// ---------------------------------------------------------------------------
// Displays the ranked worker list returned by the ML matching engine.
// Each worker card shows name, rate, rating, distance, and the
// breakdown of their individual match scores.
//
// The resident selects one worker and sends a formal job offer.
// Per FR-ENG-01, FR-ENG-02, FR-ENG-03.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { offerService } from '../../services/apiService';

export default function MatchedWorkersList({ jobRequest, matchedWorkers, onOfferSent }) {
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [sending,        setSending]        = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState('');

  if (!matchedWorkers || matchedWorkers.length === 0) {
    return (
      <div className="no-matches">
        <p>
          No verified workers are currently available for this job category.
          Please try again later or contact your Barangay Administrator.
        </p>
      </div>
    );
  }

  const handleSendOffer = async () => {
    if (!selectedWorker) return;
    setSending(true);
    setError('');

    const { ok, data } = await offerService.sendOffer(
      jobRequest.id,
      selectedWorker.worker_id,
      selectedWorker.composite_score,
    );

    setSending(false);

    if (!ok) {
      setError(data?.detail || 'Failed to send offer. Please try again.');
      return;
    }

    setSuccess(`Offer sent to ${selectedWorker.worker_name}. Waiting for their response.`);
    onOfferSent(data);
  };

  return (
    <div className="matched-workers">
      <div className="matched-workers-header">
        <h2>Matched Workers</h2>
        <p>
          {matchedWorkers.length} worker{matchedWorkers.length !== 1 ? 's' : ''} found
          for <strong>{jobRequest.title}</strong>, ranked by best match.
        </p>
      </div>

      {error   && <div className="form-error"   role="alert">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <div className="worker-cards">
        {matchedWorkers.map((worker, index) => (
          <WorkerCard
            key={worker.worker_id}
            worker={worker}
            rank={index + 1}
            isSelected={selectedWorker?.worker_id === worker.worker_id}
            onSelect={() => setSelectedWorker(worker)}
          />
        ))}
      </div>

      {selectedWorker && !success && (
        <div className="offer-action">
          <p>
            You are about to send a job offer to{' '}
            <strong>{selectedWorker.worker_name}</strong>.
          </p>
          <p className="offer-note">
            Note: You may only send one offer at a time. If this worker
            declines, you may select another.
          </p>
          <button
            className="btn-primary"
            onClick={handleSendOffer}
            disabled={sending}
          >
            {sending ? 'Sending Offer...' : `Send Offer to ${selectedWorker.worker_name}`}
          </button>
        </div>
      )}
    </div>
  );
}


// ---------------------------------------------------------------------------
// WorkerCard — individual worker result card
// ---------------------------------------------------------------------------

function WorkerCard({ worker, rank, isSelected, onSelect }) {
  const [showScores, setShowScores] = useState(false);

  const scorePercent = (score) => `${Math.round(score * 100)}%`;

  const getScoreColor = (score) => {
    if (score >= 0.75) return '#22c55e';  // green
    if (score >= 0.50) return '#f59e0b';  // amber
    return '#ef4444';                     // red
  };

  return (
    <div
      className={`worker-card ${isSelected ? 'worker-card--selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-pressed={isSelected}
    >
      {/* Rank Badge */}
      <div className="worker-rank">#{rank}</div>

      {/* Header */}
      <div className="worker-card-header">
        <div>
          <h3 className="worker-name">{worker.worker_name}</h3>
          <span className="worker-category">{worker.skill_category}</span>
        </div>
        <div className="worker-composite">
          <span
            className="composite-score"
            style={{ color: getScoreColor(worker.composite_score) }}
          >
            {scorePercent(worker.composite_score)}
          </span>
          <span className="composite-label">Match</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="worker-stats">
        <div className="stat">
          <span className="stat-label">Rate</span>
          <span className="stat-value">₱{worker.declared_rate.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Rating</span>
          <span className="stat-value">
            ⭐ {worker.avg_rating === 0 ? 'New' : worker.avg_rating.toFixed(1)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Distance</span>
          <span className="stat-value">
            {worker.distance_km !== null
              ? `${worker.distance_km} km`
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Score Breakdown Toggle */}
      <button
        className="scores-toggle"
        onClick={(e) => { e.stopPropagation(); setShowScores(!showScores); }}
        aria-expanded={showScores}
      >
        {showScores ? 'Hide score breakdown ▲' : 'Show score breakdown ▼'}
      </button>

      {/* Score Breakdown — visible when toggled */}
      {showScores && (
        <div className="score-breakdown" onClick={(e) => e.stopPropagation()}>
          <p className="breakdown-note">
            Each bar shows how well this worker scored on one matching signal.
            The overall match score is a weighted combination of all four.
          </p>

          {[
            { label: 'Skill Match',        key: 'text',      tip: 'How well their profile matches your job description.' },
            { label: 'Proximity',          key: 'proximity', tip: 'How close they are to your job location.' },
            { label: 'Price Match',        key: 'price',     tip: 'How well their rate fits your budget.' },
            { label: 'Rating',             key: 'rating',    tip: 'Their average score from past completed jobs.' },
          ].map(({ label, key, tip }) => (
            <div key={key} className="score-row">
              <div className="score-row-header">
                <span className="score-label">{label}</span>
                <span
                  className="score-value"
                  style={{ color: getScoreColor(worker.scores[key]) }}
                >
                  {scorePercent(worker.scores[key])}
                </span>
              </div>
              <div className="score-bar-track">
                <div
                  className="score-bar-fill"
                  style={{
                    width:           scorePercent(worker.scores[key]),
                    backgroundColor: getScoreColor(worker.scores[key]),
                  }}
                />
              </div>
              <small className="score-tip">{tip}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}