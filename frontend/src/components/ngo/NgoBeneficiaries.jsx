import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, PlusCircle, Search, Edit3, Trash2, Phone, MapPin, Utensils, X, CheckCircle } from 'lucide-react';

const NgoBeneficiaries = () => {
  const { token } = useAuth();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    group_type: 'Community',
    number_of_people: 25,
    area: '',
    food_requirements: 'Cooked Meals',
    contact_person: '',
    contact_phone: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ngo/beneficiaries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBeneficiaries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupTypes = ['All', 'Community', 'Shelter', 'Orphanage', 'Relief Group', 'Support Group'];

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      const matchesSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (b.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (b.food_requirements || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || b.group_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [beneficiaries, searchTerm, typeFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      group_type: 'Community',
      number_of_people: 25,
      area: '',
      food_requirements: 'Cooked Meals',
      contact_person: '',
      contact_phone: '',
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const openEditModal = (b) => {
    setEditingId(b.id);
    setFormData({
      name: b.name,
      group_type: b.group_type || 'Community',
      number_of_people: b.number_of_people || 1,
      area: b.area || '',
      food_requirements: b.food_requirements || 'Cooked Meals',
      contact_person: b.contact_person || '',
      contact_phone: b.contact_phone || '',
      status: b.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const url = editingId ? `/api/ngo/beneficiaries/${editingId}` : '/api/ngo/beneficiaries';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchBeneficiaries();
      } else {
        alert('Failed to save beneficiary group.');
      }
    } catch {
      alert('Error saving record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this beneficiary group?')) return;
    try {
      const res = await fetch(`/api/ngo/beneficiaries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBeneficiaries();
      }
    } catch {
      alert('Failed to delete beneficiary.');
    }
  };

  const totalPeopleSupported = beneficiaries.reduce((sum, b) => sum + (b.number_of_people || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0 0 0.35rem 0' }}>
            Beneficiary & Community Groups
          </h1>
          <p style={{ color: 'var(--text-secondary, #6b7280)', margin: 0, fontSize: '0.96rem' }}>
            Manage the shelters, communities, and groups your NGO feeds. Supporting <strong>{totalPeopleSupported.toLocaleString()} people</strong>.
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{ padding: '0.75rem 1.4rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
        >
          <PlusCircle size={18} /> Add Beneficiary Group
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by community name, area, requirement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', borderRadius: '12px', border: '1px solid var(--border-color, #e5e7eb)', backgroundColor: 'var(--bg-secondary, #ffffff)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {groupTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: typeFilter === type ? '#10b981' : 'var(--border-color, #e5e7eb)',
                backgroundColor: typeFilter === type ? '#10b981' : 'var(--bg-secondary, #ffffff)',
                color: typeFilter === type ? 'white' : 'var(--text-primary, #374151)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Beneficiaries Grid */}
      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading beneficiary groups...</p>
      ) : filteredBeneficiaries.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-secondary, #ffffff)', padding: '4rem 2rem', borderRadius: '18px', border: '1px dashed var(--border-color, #e5e7eb)', textAlign: 'center' }}>
          <Users size={44} color="#9ca3af" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>
            No beneficiary groups found
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Start adding the shelters, orphanages, and local communities your NGO supports.
          </p>
          <button onClick={openAddModal} style={{ padding: '0.6rem 1.3rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
            Add Beneficiary Group
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.3rem' }}>
          {filteredBeneficiaries.map((b) => (
            <div
              key={b.id}
              style={{
                backgroundColor: 'var(--bg-secondary, #ffffff)',
                borderRadius: '16px',
                border: '1px solid var(--border-color, #e5e7eb)',
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ padding: '0.2rem 0.6rem', backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                    {b.group_type || 'Community'}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary, #111827)', margin: '0.4rem 0 0 0' }}>
                    {b.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => openEditModal(b)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}>
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.86rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={15} color="#10b981" />
                  <span>Capacity: <strong>{b.number_of_people} people</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} color="#3b82f6" />
                  <span>Area: {b.area || 'City Area'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Utensils size={15} color="#f59e0b" />
                  <span>Diet: {b.food_requirements || 'Any Food'}</span>
                </div>
                {b.contact_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={15} color="#8b5cf6" />
                    <span>Contact: {b.contact_person ? `${b.contact_person} (${b.contact_phone})` : b.contact_phone}</span>
                  </div>
                )}
              </div>

              {b.last_support_date && (
                <div style={{ fontSize: '0.76rem', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem' }}>
                  Last distribution: {new Date(b.last_support_date).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Beneficiary Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111827', margin: 0 }}>
                {editingId ? 'Edit Beneficiary Group' : 'Add Beneficiary Group'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  Group / Community Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hope Children Home, St. Mary Shelter"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Type
                  </label>
                  <select
                    value={formData.group_type}
                    onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  >
                    <option value="Community">Community</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Orphanage">Orphanage</option>
                    <option value="Relief Group">Relief Group</option>
                    <option value="Support Group">Support Group</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    People Supported
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.number_of_people}
                    onChange={(e) => setFormData({ ...formData, number_of_people: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  Location / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, East Zone"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                  Food Requirements / Diet
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cooked Meals, Vegetarian, Dry Rations"
                  value={formData.food_requirements}
                  onChange={(e) => setFormData({ ...formData, food_requirements: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', boxSizing: 'border-box' }}
                  />
                </div>
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
                  {submitting ? 'Saving...' : editingId ? 'Update Group' : 'Add Group'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default NgoBeneficiaries;
