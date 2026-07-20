import { useState } from 'react';
import { Star, Award, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import BlurReveal from '../components/BlurReveal';
import { soundEngine } from '../utils/audio';

export default function PerformanceView({ performanceData, vendors, onAddReview }) {
  const [selectedVendorId, setSelectedVendorId] = useState('');
  
  // KPI Sliders (Range 1-5)
  const [scores, setScores] = useState({
    quality: 5,
    delivery: 5,
    communication: 5,
    cost: 5,
    compliance: 5
  });

  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSliderChange = (kpi, val) => {
    soundEngine.playHover();
    setScores(prev => ({ ...prev, [kpi]: Number(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVendorId) {
      setFormError('Please select a vendor to rate.');
      soundEngine.playError();
      return;
    }

    setFormError('');
    const res = await onAddReview({
      vendorId: selectedVendorId,
      ...scores,
      notes
    });

    if (res) {
      soundEngine.playSuccess();
      setSuccessMsg('Performance scorecard saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      
      // Reset
      setScores({
        quality: 5,
        delivery: 5,
        communication: 5,
        cost: 5,
        compliance: 5
      });
      setNotes('');
    } else {
      setFormError('Error recording performance review.');
      soundEngine.playError();
    }
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            fill={i < Math.round(rating) ? '#fbbf24' : 'none'}
            color="#fbbf24"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="tab-transition" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
      
      {/* KPI Evaluation Form Card */}
      <BlurReveal delay={0}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={22} color="#06b6d4" />
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Vendor Evaluation Panel</h4>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Vendor Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Select Vendor *</label>
              <select
                className="form-select interactive"
                value={selectedVendorId}
                onChange={(e) => {
                  soundEngine.playClick();
                  setSelectedVendorId(e.target.value);
                }}
              >
                <option value="">Choose active vendor...</option>
                {vendors.filter(v => v.status === 'Active').map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Sliders Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              {Object.keys(scores).map((kpi) => (
                <div key={kpi} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: '600', color: '#e2e8f0' }}>{kpi} Score</span>
                    <span style={{ color: '#06b6d4', fontWeight: '700', fontSize: '14px' }}>{scores[kpi]} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    className="interactive"
                    style={{
                      width: '100%',
                      accentColor: '#06b6d4',
                      background: 'rgba(255,255,255,0.1)',
                      height: '6px',
                      borderRadius: '3px',
                      outline: 'none',
                      cursor: 'none'
                    }}
                    value={scores[kpi]}
                    onChange={(e) => handleSliderChange(kpi, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Review Notes</label>
              <textarea
                rows="3"
                placeholder="Log performance observations, achievements, or remediation steps..."
                className="form-textarea interactive"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Message Prompts */}
            {formError && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', color: '#f87171', fontSize: '12px' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '8px', color: '#34d399', fontSize: '12px' }}>
                <Sparkles size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary interactive" style={{ marginTop: '6px' }}>
              Save Scorecard
            </button>
          </form>
        </div>
      </BlurReveal>

      {/* Scorecard History Card */}
      <BlurReveal delay={150}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={22} color="#ec4899" />
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Evaluation History</h4>
          </div>

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, maxHeight: '490px' }} className="history-scroll">
            {performanceData.map((review) => {
              const avgScore = ((review.quality + review.delivery + review.communication + review.cost + review.compliance) / 5).toFixed(1);
              return (
                <div
                  key={review.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '16px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{getVendorName(review.vendorId)}</h5>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Scored on {review.date}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#06b6d4' }}>{avgScore} / 5.0</span>
                      {renderStars(avgScore)}
                    </div>
                  </div>
                  
                  {/* Detailed Scores Pill */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '10.5px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>QLY: {review.quality}</span>
                    <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>DLV: {review.delivery}</span>
                    <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>COM: {review.communication}</span>
                    <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>CST: {review.cost}</span>
                    <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>CMP: {review.compliance}</span>
                  </div>

                  {review.notes && (
                    <p style={{ fontSize: '12.5px', color: '#94a3b8', background: 'rgba(15,23,42,0.4)', padding: '8px 12px', borderRadius: '6px', fontStyle: 'italic', borderLeft: '2px solid #ec4899', lineHeight: 1.4 }}>
                      "{review.notes}"
                    </p>
                  )}
                </div>
              );
            })}
            {performanceData.length === 0 && (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No scorecard evaluations created yet.</div>
            )}
          </div>
        </div>
        <style>{`
          .history-scroll::-webkit-scrollbar { width: 4px; }
          .history-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border: none; }
        `}</style>
      </BlurReveal>

    </div>
  );
}
