import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Utensils, PlusCircle, CheckCircle, Clock, Users, Package, X, Calendar } from 'lucide-react';

const NgoDistribution = () => {
  const { token } = useAuth();

  const [distributions, setDistributions] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    food_name: '',
    claim_id: '',
    collected_quantity: 50,
    distributed_meals: 45,
    people_served: 45,
    beneficiary_group_id: '',
    beneficiary_name: '',
    distribution_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDist, resBen, resClaims] = await Promise.all([
        fetch('/api/ngo/distributions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/ngo/beneficiaries', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/ngo/claims', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (resDist.ok) setDistributions(await resDist.json());
      if (resBen.ok) setBeneficiaries(await resBen.json());
      if (resClaims.ok) {
        const cData = await resClaims.json();
        setClaims(cData.filter(c => ['FOOD_COLLECTED', 'CLAIMED', 'COMPLETED'].includes(c.status)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSelect = (claimId) => {
    const selected = claims.find(c => String(c.id) === String(claimId));
    if (selected) {
      setFormData(prev => ({
        ...prev,
        claim_id: selected.id,
        food_name: selected.donation_title
      }));
    }
  };

  const handleBeneficiarySelect = (bId) => {
    const selected = beneficiaries.find(b => String(b.id) === String(bId));
    if (selected) {
      setFormData(prev => ({
        ...prev,
        beneficiary_group_id: selected.id,
        beneficiary_name: selected.name,
        people_served: selected.number_of_people || prev.people_served,
        distributed_meals: selected.number_of_people || prev.distributed_meals
      }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.food_name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/ngo/distributions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          food_name: '',
          claim_id: '',
          collected_quantity: 50,
          distributed_meals: 45,
          people_served: 45,
          beneficiary_group_id: '',
          beneficiary_name: '',
          distribution_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        fetchData();
      } else {
        alert('Failed to log distribution.');
      }
    } catch {
      alert('Error submitting distribution log.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalMeals = distributions.reduce((sum, d) => sum + (d.distributed_meals || 0), 0);
  const totalPeople = distributions.reduce((sum, d) => sum + (d.people_served || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.35rem 0' }}>
            Food Distribution Operations
          </h1>
          <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
            Log food distributed to your communities and track meal delivery milestones.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '0.75rem 1.4rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
        >
          <PlusCircle size={18} /> Record New Distribution
        </button>
      </div>

      {/* Summary KPI banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color, #e5e7eb)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{totalMeals.toLocaleString()}</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6b7280' }}>Total Meals Distributed</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color, #e5e7eb)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6' }}>{totalPeople.toLocaleString()}</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6b7280' }}>People Nourished</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color, #e5e7eb)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6' }}>{distributions.length}</div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#6b7280' }}>Completed Distributions</div>
        </div>
      </div>

      {/* Distribution History Table */}
      <section style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', borderRadius: '18px', border: '1px solid var(--border-color, #e5e7eb)', padding: '1.5rem', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #111827)', marginBottom: '1.25rem' }}>
          Distribution Log History
        </h2>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading distribution logs...</p>
        ) : distributions.length === 0 ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center', border: '1px dashed #e5e7eb', borderRadius: '14px' }}>
            <Utensils size={42} color="#9ca3af" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
              No distribution records yet
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              After collecting food from a donor, click below to record the distribution.
            </p>
            <button onClick={() => setShowModal(true)} style={{ padding: '0.6rem 1.3rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Record Distribution
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Food Item</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Beneficiary Group</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Meals Distributed</th>
                  <th style={{ padding: '0.75rem 1rem' }}>People Served</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Remaining</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>
                      {d.distribution_date || new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#111827' }}>
                      {d.food_name}
                    </td>
                    <td style={{ padding: '1rem', color: '#4b5563' }}>
                      {d.beneficiary_name || 'Community Group'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#10b981' }}>
                      {d.distributed_meals} meals
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#3b82f6' }}>
                      {d.people_served} people
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                      {d.remaining_meals || 0}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', backgroundColor: 'rgba(16,185,129,0.12)', color: '#047857', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Record Distribution Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '540px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111827', margin: 0 }}>
                Record Food Distribution
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Pick from collected claim */}
              {claims.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Select from Collected Claim (Optional)
                  </label>
                  <select
                    value={formData.claim_id}
                    onChange={(e) => handleClaimSelect(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  >
                    <option value="">-- Choose collected food --</option>
                    {claims.map((c) => (
                      <option key={c.id} value={c.id}>
                        Claim #{c.id} - {c.donation_title} ({c.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  Food Item Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vegetable Biryani, Cooked Meals"
                  required
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  Beneficiary Community / Group
                </label>
                <select
                  value={formData.beneficiary_group_id}
                  onChange={(e) => handleBeneficiarySelect(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select Beneficiary Group --</option>
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.group_type} - {b.number_of_people} people)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Collected Meals
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.collected_quantity}
                    onChange={(e) => setFormData({ ...formData, collected_quantity: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Distributed Meals
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.distributed_meals}
                    onChange={(e) => setFormData({ ...formData, distributed_meals: parseInt(e.target.value) || 0, people_served: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    People Served
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.people_served}
                    onChange={(e) => setFormData({ ...formData, people_served: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Distribution Date
                  </label>
                  <input
                    type="date"
                    value={formData.distribution_date}
                    onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  Distribution Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Distributed during dinner service, all food fresh..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '0.8rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submitting ? 'Recording...' : 'Record Distribution'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default NgoDistribution;
