import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Heart, Utensils, Package, Users, Award, TrendingUp, Calendar } from 'lucide-react';

const NgoImpact = () => {
  const { token } = useAuth();
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpact();
  }, []);

  const fetchImpact = async () => {
    try {
      const res = await fetch('/api/ngo/impact', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setImpactData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const summary = impactData?.summary || {};
  const monthly = impactData?.monthly_activity || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.35rem 0' }}>
          NGO Operational Impact & Reports
        </h1>
        <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
          Real metrics tracking food waste prevented, community meals distributed, and lives impacted.
        </p>
      </div>

      {/* Hero Highlight Metric Box */}
      <div style={{ background: 'linear-gradient(135deg, #10b981, #047857)', borderRadius: '20px', padding: '2rem 2.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 10px 25px rgba(16,185,129,0.25)' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, marginBottom: '0.35rem' }}>
            Total Community Food Recovery
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1 }}>
            {(summary.total_meals_distributed || 0).toLocaleString()} <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>Meals Served</span>
          </div>
          <p style={{ fontSize: '0.94rem', opacity: 0.9, margin: '0.5rem 0 0 0' }}>
            Empowering {(summary.active_beneficiaries || 0)} local beneficiary communities with sustainable food access.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '1rem 1.4rem', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{summary.food_saved_kg || 0} kg</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.9 }}>Food Saved</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '1rem 1.4rem', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{(summary.total_people_served || 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: 0.9 }}>People Nourished</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        {[
          { label: 'Donations Collected', value: summary.total_donations_collected || 0, icon: <Package size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Meals Distributed', value: (summary.total_meals_distributed || 0).toLocaleString(), icon: <Utensils size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'People Served', value: (summary.total_people_served || 0).toLocaleString(), icon: <Heart size={22} />, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
          { label: 'Food Saved (kg)', value: `${summary.food_saved_kg || 0} kg`, icon: <TrendingUp size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Successful Pickups', value: summary.successful_pickups || 0, icon: <Award size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Active Beneficiaries', value: summary.active_beneficiaries || 0, icon: <Users size={22} />, color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
        ].map((kpi, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '16px', padding: '1.4rem', border: '1px solid var(--border-color, #e5e7eb)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '0.85rem', backgroundColor: kpi.bg, color: kpi.color, borderRadius: '12px' }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary, #111827)' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary, #6b7280)', marginTop: '0.15rem' }}>
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Activity Analytics Card */}
      <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary, #111827)', margin: '0 0 0.2rem 0' }}>
              Monthly Food Recovery Timeline
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#6b7280', margin: 0 }}>
              Historical volume of meals distributed and people supported by month.
            </p>
          </div>
          <span style={{ padding: '0.3rem 0.75rem', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: '#4b5563' }}>
            Verified Real Data
          </span>
        </div>

        {monthly.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
            <Calendar size={36} color="#9ca3af" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              Monthly analytics will appear as you record completed distributions.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {monthly.map((m, idx) => {
              const maxMeals = Math.max(...monthly.map(x => x.meals), 50);
              const percentage = Math.min(100, Math.round((m.meals / maxMeals) * 100));
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 700 }}>
                    <span style={{ color: '#111827' }}>{m.month}</span>
                    <span style={{ color: '#10b981' }}>{m.meals} meals ({m.people} people)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '5px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default NgoImpact;
