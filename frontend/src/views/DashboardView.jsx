import { useState, useEffect } from 'react';
import { Users, FileText, ArrowUpRight, TrendingUp, DollarSign, Activity, Star } from 'lucide-react';
import BlurReveal from '../components/BlurReveal';

export default function DashboardView({ stats, activities, loading, onRefresh }) {
  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(6, 182, 212, 0.2)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { kpis, categoryStats } = stats;

  // Find max spend to scale the chart bars
  const maxSpend = categoryStats ? Math.max(...categoryStats.map(c => c.spend), 1000) : 1000;

  return (
    <div className="tab-transition" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Upper Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Metric 1 */}
        <BlurReveal delay={0}>
          <div className="glass-panel glass-panel-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Total Vendors</p>
                <h3 style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: '#fff' }}>
                  {kpis.totalVendors}
                </h3>
              </div>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '13px', color: '#10b981' }}>
              <TrendingUp size={16} />
              <span>{kpis.activeVendors} Active Vendors</span>
            </div>
          </div>
        </BlurReveal>

        {/* Metric 2 */}
        <BlurReveal delay={100}>
          <div className="glass-panel glass-panel-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Active Contract Value</p>
                <h3 style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: '#fff' }}>
                  ${(kpis.totalContractValue / 1000).toFixed(0)}k
                </h3>
              </div>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '13px', color: '#e2e8f0' }}>
              <FileText size={16} style={{ color: '#8b5cf6' }} />
              <span>{kpis.activeContractsCount} Active Contracts</span>
            </div>
          </div>
        </BlurReveal>

        {/* Metric 3 */}
        <BlurReveal delay={200}>
          <div className="glass-panel glass-panel-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Pending Payables</p>
                <h3 style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: '#fff' }}>
                  ${kpis.pendingInvoiceAmount.toLocaleString()}
                </h3>
              </div>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '13px', color: kpis.overdueInvoiceAmount > 0 ? '#ef4444' : '#fbbf24' }}>
              <span>{kpis.pendingInvoicesCount} Pending Invoices</span>
              {kpis.overdueInvoiceAmount > 0 && (
                <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  Overdue
                </span>
              )}
            </div>
          </div>
        </BlurReveal>

        {/* Metric 4 */}
        <BlurReveal delay={300}>
          <div className="glass-panel glass-panel-hover" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Avg. Performance</p>
                <h3 style={{ fontSize: '32px', fontWeight: '700', marginTop: '8px', color: '#fff' }}>
                  {kpis.avgPerformanceRating > 0 ? `${kpis.avgPerformanceRating} / 5` : 'N/A'}
                </h3>
              </div>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Star size={20} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '16px', fontSize: '13px', color: '#fbbf24' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.round(kpis.avgPerformanceRating) ? '#fbbf24' : 'none'}
                  color="#fbbf24"
                />
              ))}
              <span style={{ marginLeft: '6px', color: '#94a3b8' }}>Overall rating</span>
            </div>
          </div>
        </BlurReveal>
      </div>

      {/* Main Grid: Custom Visual Analytics & Activity Log */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px'
        }}
      >
        {/* Category Spend Analytics Card */}
        <BlurReveal delay={400}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="#06b6d4" /> Spend Analysis by Category
            </h4>
            
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '18px', justifyContent: 'center' }}>
              {categoryStats && categoryStats.map((item, idx) => {
                const percent = maxSpend > 0 ? (item.spend / maxSpend) * 100 : 0;
                return (
                  <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{item.category}</span>
                      <span style={{ color: '#94a3b8' }}>
                        ${item.spend.toLocaleString()} <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>({item.count} vendors)</span>
                      </span>
                    </div>
                    {/* Progress Track */}
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, #06b6d4 0%, ${idx % 2 === 0 ? '#8b5cf6' : '#ec4899'} 100%)`,
                          borderRadius: '4px',
                          boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)',
                          transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!categoryStats || categoryStats.length === 0) && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>No spend data tracked yet.</div>
              )}
            </div>
          </div>
        </BlurReveal>

        {/* Real-time Activity Timeline */}
        <BlurReveal delay={500}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '420px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="#ec4899" /> System Audit Timeline
            </h4>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '6px' }} className="custom-timeline-scroll">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                {activities && activities.map((act) => {
                  let badgeColor = '#06b6d4';
                  if (act.type === 'invoice_paid') badgeColor = '#10b981';
                  if (act.type === 'performance_rated') badgeColor = '#fbbf24';
                  if (act.type === 'status_changed') badgeColor = '#ef4444';
                  if (act.type === 'contract_added') badgeColor = '#8b5cf6';

                  return (
                    <div key={act.id} style={{ position: 'relative', fontSize: '13.5px' }}>
                      {/* Timeline dot */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '-26px',
                          top: '5px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: badgeColor,
                          boxShadow: `0 0 8px ${badgeColor}`,
                          zIndex: 2
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: '#e2e8f0', lineHeight: 1.4 }}>{act.description}</span>
                        <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {(!activities || activities.length === 0) && (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>No activities logged yet.</div>
                )}
              </div>
            </div>
            
            <style>{`
              .custom-timeline-scroll::-webkit-scrollbar { width: 4px; }
              .custom-timeline-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border: none; }
            `}</style>
          </div>
        </BlurReveal>
      </div>

    </div>
  );
}
