import React, { useState } from 'react';
import { Star, X, Send, CheckCircle2, Award, MessageSquare, Sparkles } from 'lucide-react';

// ── Quick feedback tag options ──
const QUICK_TAGS = [
  'Professional', 'On Time', 'Clean Work',
  'Great Communication', 'Highly Skilled', 'Friendly',
  'Thorough', 'Fair Pricing',
];

const RATING_CONFIG = {
  1: { label: 'Poor',      color: 'text-red-500',          fill: '#ef4444' },
  2: { label: 'Fair',      color: 'text-orange-500',       fill: '#f97316' },
  3: { label: 'Good',      color: 'text-amber-500',        fill: '#f59e0b' },
  4: { label: 'Great',     color: 'text-emerald-500',      fill: '#10b981' },
  5: { label: 'Excellent', color: 'text-skill-primary',    fill: '#10b981' },
};

/**
 * RatingModal
 * Props:
 *   job      — { id, title, service, location, date }
 *   worker   — { id, full_name, service }
 *   onSubmit — ({ rating, review, tags, jobId, workerId }) => void
 *   onSkip   — () => void
 */
export default function RatingModal({ job, worker, onSubmit, onSkip }) {
  const [rating,     setRating]     = useState(0);
  const [hovered,    setHovered]    = useState(0);
  const [review,     setReview]     = useState('');
  const [tags,       setTags]       = useState([]);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const active = hovered || rating;
  const cfg    = RATING_CONFIG[active] || {};

  const toggleTag = (tag) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    // Simulate async submit — swap with api.submitRating() in future
    await new Promise((r) => setTimeout(r, 900));
    onSubmit?.({ rating, review, tags, jobId: job?.id, workerId: worker?.id });
    setSubmitting(false);
    setSubmitted(true);
  };

  // ── Success / Thank-you screen ──
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-dark-card rounded-xl p-10 w-full max-w-sm shadow-2xl text-center animate-fade-in">
          {/* Animated check */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-skill-primary/20 rounded-full animate-ping opacity-60" />
            <div className="relative w-20 h-20 bg-skill-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} className="text-skill-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-skill-dark dark:text-white mb-2">Thank You!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
            Your review for{' '}
            <span className="font-bold text-skill-dark dark:text-white">
              {worker?.full_name}
            </span>{' '}
            has been submitted.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            Your feedback helps the barangay community find great workers.
          </p>

          {/* Stars display */}
          <div className="flex justify-center gap-1.5 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={22}
                className={
                  i < rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 dark:text-gray-700'
                }
              />
            ))}
          </div>

          {/* Tags submitted */}
          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-6">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-skill-primary/10 text-skill-primary rounded-xl text-[10px] font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={onSkip}
            className="w-full py-3 bg-skill-light dark:bg-dark-bg text-skill-dark dark:text-white rounded-lg font-bold text-sm hover:bg-skill-primary hover:text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ── Main Rating Modal ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-skill-dark/60 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-dark-card rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Gradient Header ── */}
        <div className="bg-gradient-to-br from-skill-dark to-[#064e3b] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-skill-primary/20 rounded-lg">
                  <Award size={16} className="text-skill-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-skill-primary">
                  Job Complete
                </span>
              </div>
              <button
                onClick={onSkip}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-all"
                title="Skip rating"
              >
                <X size={16} className="text-white/50 hover:text-white" />
              </button>
            </div>

            <h2 className="text-xl font-black mb-1">Rate Your Experience</h2>
            <p className="text-skill-light/60 text-xs leading-relaxed">
              How was{' '}
              <span className="text-white font-bold">{worker?.full_name || 'the worker'}</span>
              {' '}for your{' '}
              <span className="text-skill-primary font-bold">
                {job?.service || 'service request'}
              </span>
              ?
            </p>

            {/* Job meta */}
            {job?.title && (
              <div className="mt-4 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-xs text-skill-light/50">
                📌 {job.title}{job.location ? ` · ${job.location}` : ''}
              </div>
            )}
          </div>

          {/* Decorative blobs */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-skill-primary/10 rounded-full blur-2xl" />
          <div className="absolute right-16 -top-6 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        </div>

        {/* ── Scrollable Body ── */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">

          {/* ── Star Rating ── */}
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Your Rating
            </p>
            <div className="flex justify-center gap-2 mb-3">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                return (
                  <button
                    key={val}
                    onMouseEnter={() => setHovered(val)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(val)}
                    className="transition-all duration-150 hover:scale-125 active:scale-110 focus:outline-none"
                    aria-label={`Rate ${val} star${val > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={40}
                      style={val <= active ? { color: '#f59e0b', fill: '#f59e0b' } : {}}
                      className={`transition-all duration-150 ${
                        val <= active
                          ? 'drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                          : 'text-gray-200 dark:text-gray-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Rating label */}
            <div className="h-6 flex items-center justify-center">
              {active > 0 ? (
                <span className={`text-sm font-black tracking-wide ${cfg.color}`}>
                  {cfg.label}
                </span>
              ) : (
                <span className="text-xs text-gray-300 dark:text-gray-600 italic">
                  Tap a star to rate
                </span>
              )}
            </div>
          </div>

          {/* ── Quick Feedback Tags ── */}
          {rating > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles size={10} className="text-skill-primary" />
                Quick Feedback
                <span className="font-normal normal-case text-gray-300">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      tags.includes(tag)
                        ? 'bg-skill-primary text-white border-skill-primary shadow-md shadow-skill-primary/20'
                        : 'bg-skill-light dark:bg-dark-bg text-gray-500 dark:text-gray-400 border-transparent hover:border-skill-primary/30'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Written Review ── */}
          {rating > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <MessageSquare size={10} className="text-skill-primary" />
                Write a Review
                <span className="font-normal normal-case text-gray-300">(optional)</span>
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value.slice(0, 300))}
                  placeholder={`Share your experience with ${worker?.full_name || 'this worker'}...`}
                  className="w-full px-4 py-3 bg-skill-light dark:bg-dark-bg border-2 border-transparent focus:border-skill-primary rounded-lg outline-none transition-all text-sm dark:text-white resize-none"
                />
                <span
                  className={`absolute bottom-3 right-4 text-[10px] font-bold transition-colors ${
                    review.length > 250
                      ? 'text-amber-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                >
                  {review.length}/300
                </span>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer Buttons ── */}
        <div className="flex items-center gap-3 px-8 pb-8 pt-2 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={onSkip}
            className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-all whitespace-nowrap"
          >
            Skip
          </button>

          <button
            disabled={rating === 0 || submitting}
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-skill-primary hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-black transition-all shadow-lg shadow-skill-primary/20 active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={15} />
                Submit Review
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
