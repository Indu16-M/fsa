import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Leaf, PackageCheck, Award, Heart } from 'lucide-react';

const ReceiverImpact = () => {
  const { token, user } = useAuth();
  const [impact, setImpact] = useState({
    totalMealsReceived: 0,
    successfulClaims: 0,
    foodCollectedKg: 0,
    foodSaved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    try {
      const res = await fetch('/api/claims/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const claims = await res.json();
      
      if (res.ok) {
        const completedClaims = claims.filter(c => c.claim_status === 'COMPLETED' || c.claim_status === 'FOOD_COLLECTED');
        
        let meals = 0;
        let kg = 0;
        
        completedClaims.forEach(c => {
           if (c.donation_details?.quantity_unit === 'meals') {
             meals += parseInt(c.donation_details.quantity) || 1;
           } else if (c.donation_details?.quantity_unit === 'kg') {
             kg += parseFloat(c.donation_details.quantity) || 0;
           } else {
             // Treat as 1 item/meal if unknown
             meals += 1;
           }
        });
        
        // Approximate calculation if they didn't log kg explicitly: 1 meal ≈ 0.4kg of food saved
        if (kg === 0 && meals > 0) {
            kg = meals * 0.4;
        }

        setImpact({
          totalMealsReceived: meals,
          successfulClaims: completedClaims.length,
          foodCollectedKg: kg.toFixed(1),
          foodSaved: (kg * 2.5).toFixed(1) // rough estimate of CO2 emissions saved in kg based on food weight
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading impact data...</div>;
  }

  return (
    <div>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--primary-color-10)', borderRadius: '50%', color: 'var(--primary-color)' }}>
            <Leaf size={48} />
          </div>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Impact</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          By claiming and collecting surplus food, you are directly preventing food waste and helping the environment.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <Heart size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{impact.totalMealsReceived}</div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem' }}>Total Meals Received</div>
        </div>
        
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <PackageCheck size={40} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{impact.successfulClaims}</div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem' }}>Successful Pickups</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <Award size={40} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{impact.foodCollectedKg} <span style={{ fontSize: '1.5rem' }}>kg</span></div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem' }}>Food Waste Prevented</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Thank you for being part of ShareBite!</h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto' }}>
          Every time you collect a meal, you're not just getting food—you're preventing approximately <strong>{impact.foodSaved} kg of CO₂ emissions</strong> that would have been generated if this food had gone to a landfill.
        </p>
      </div>
    </div>
  );
};

export default ReceiverImpact;
