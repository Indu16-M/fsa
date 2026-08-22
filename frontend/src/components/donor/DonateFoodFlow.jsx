import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, ChevronRight, AlertTriangle, ArrowLeft, Image as ImageIcon, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DonateFoodFlow = ({ onComplete, onCancel }) => {
  const { getAuthHeaders } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    food_type: 'cooked',
    quantity: '',
    quantity_unit: 'kg',
    storage_condition: 'ambient',
    temperature_celsius: '25',
    prep_time: new Date().toISOString().slice(0, 16)
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanStatus, setScanStatus] = useState('');
  
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Webcam states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setIsCameraActive(true);
      setError('');
    } catch (err) {
      setError("Camera permission denied or not available.");
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
    setStream(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        setImageFile(file);
        stopCamera();
      }, 'image/jpeg');
    }
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleAiCheck = async () => {
    setLoading(true);
    setError('');
    setScanStatus('Initializing AI Vision models...');
    
    // Simulate real steps
    const timer1 = setTimeout(() => setScanStatus('Scanning food item color & geometry...'), 500);
    const timer2 = setTimeout(() => setScanStatus('Analyzing surface textures & freshness indices...'), 1100);
    const timer3 = setTimeout(() => setScanStatus('Verifying package integrity...'), 1700);

    try {
      const form = new FormData();
      form.append('category', formData.food_type);
      if (imageFile) form.append('image', imageFile);

      const res = await fetch('/api/ai/food-check', {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeaders().Authorization
        },
        body: form
      });
      if (!res.ok) throw new Error('AI analysis failed');
      const data = await res.json();
      setAiAnalysis(data);
      handleNext();
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setLoading(false);
      setScanStatus('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'prep_time') {
          submitData.append(key, new Date(formData[key]).toISOString());
        } else {
          submitData.append(key, formData[key]);
        }
      });
      if (imageFile) submitData.append('image', imageFile);

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Authorization': getAuthHeaders().Authorization },
        body: submitData
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to submit donation');
      }
      
      onComplete();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="donate-food-flow fade-in max-w-3xl mx-auto">
      <div className="panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="icon-btn" onClick={step === 1 ? onCancel : handleBack} style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '50%' }}>
              <ArrowLeft size={20} />
            </button>
            Step {step} of 4
          </h2>
          <div className="step-indicator" style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: i <= step ? 'var(--primary-color)' : 'var(--bg-secondary)' }} />
            ))}
          </div>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>{error}</div>}

        {/* STEP 1: Basic Details */}
        {step === 1 && (
          <div className="fade-in">
            <h3 style={{ marginBottom: '1.5rem' }}>What are you donating?</h3>
            <div className="form-group">
              <label className="form-label">Food Title / Item Name</label>
              <input type="text" className="form-control" placeholder="e.g. Mixed Vegetable Curry" 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description (Ingredients, Allergens)</label>
              <textarea className="form-control" rows="3" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Food Category</label>
              <select className="form-control" value={formData.food_type} onChange={e => setFormData({...formData, food_type: e.target.value})}>
                <option value="cooked">Cooked Meals</option>
                <option value="produce">Fresh Produce (Fruits/Veg)</option>
                <option value="dairy">Dairy Products</option>
                <option value="bakery">Bakery / Bread</option>
                <option value="packaged">Packaged Food</option>
                <option value="dry">Dry Ration</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} 
              disabled={!formData.title} onClick={handleNext}>
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Quantity & Storage */}
        {step === 2 && (
          <div className="fade-in">
            <h3 style={{ marginBottom: '1.5rem' }}>Quantity & Storage Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" className="form-control" value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  <select className="form-control" style={{ width: '100px' }} 
                    value={formData.quantity_unit} onChange={e => setFormData({...formData, quantity_unit: e.target.value})}>
                    <option value="kg">kg</option>
                    <option value="L">Liters</option>
                    <option value="portions">Portions</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preparation Time</label>
                <input type="datetime-local" className="form-control" value={formData.prep_time} 
                  onChange={e => setFormData({...formData, prep_time: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Storage Condition</label>
                <select className="form-control" value={formData.storage_condition} 
                  onChange={e => setFormData({...formData, storage_condition: e.target.value})}>
                  <option value="ambient">Ambient (Room Temp)</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Storage Temp (°C)</label>
                <input type="number" className="form-control" value={formData.temperature_celsius} 
                  onChange={e => setFormData({...formData, temperature_celsius: e.target.value})} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} 
              disabled={!formData.quantity} onClick={handleNext}>
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 3: Image & AI Check */}
        {step === 3 && (
          <div className="fade-in text-center">
            <h3 style={{ marginBottom: '1.25rem' }}>AI Quality Scanner</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>Scan your food item to verify visual freshness & quality before donating.</p>
            
            {!isCameraActive ? (
              <>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={startCamera}>
                    <Video size={20} /> Take Photo
                  </button>
                  <label className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                    <ImageIcon size={20} /> Upload File
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
                  </label>
                </div>
                
                {imageFile ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div className="scanner-container">
                      <img src={previewUrl} className={`scanner-image ${loading ? 'scanner-blur' : ''}`} alt="Food preview" />
                      {loading && (
                        <div className="scanner-overlay">
                          <div className="scanner-laser" />
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <button className="btn-link text-danger" onClick={() => setImageFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove Photo</button>
                    </div>
                  </div>
                ) : (
                  <div className="image-upload-area" style={{ 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '3.5rem 2rem', 
                    backgroundColor: 'var(--bg-secondary)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Camera size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Ready to scan food item</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#000', marginBottom: '1rem' }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={stopCamera}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={capturePhoto}>
                    <Camera size={20} /> Capture Photo
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ margin: '1rem 0', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', animation: 'pulse 1.5s infinite' }}>
                <span>⚡ {scanStatus}</span>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleAiCheck} disabled={loading || !imageFile}>
              {loading ? 'Analyzing Freshness...' : 'Start AI Scan & Check'}
            </button>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <div className="fade-in">
            <h3 style={{ marginBottom: '1.5rem' }}>Review & Publish</h3>
            
            {/* AI Results Box */}
            {aiAnalysis && (
              <div style={{ padding: '1.5rem', backgroundColor: aiAnalysis.freshness === 'Poor' ? '#fef2f2' : '#f0fdf4', borderRadius: '12px', marginBottom: '2rem', border: `1px solid ${aiAnalysis.freshness === 'Poor' ? '#fecaca' : '#bbf7d0'}` }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: aiAnalysis.freshness === 'Poor' ? '#dc2626' : '#16a34a' }}>
                  {aiAnalysis.freshness === 'Poor' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                  AI Analysis: {aiAnalysis.status}
                </h4>
                <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>Confidence: {aiAnalysis.confidence}</p>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Recommendation: {aiAnalysis.recommendation}</p>
              </div>
            )}

            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '2rem' }}>
              <p><strong>Item:</strong> {formData.title}</p>
              <p><strong>Quantity:</strong> {formData.quantity} {formData.quantity_unit}</p>
              <p><strong>Category:</strong> {formData.food_type}</p>
              <p><strong>Storage:</strong> {formData.storage_condition} at {formData.temperature_celsius}°C</p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Publishing...' : 'Confirm & Publish Donation'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateFoodFlow;
