import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertTriangle, Video, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AiFoodScannerView = () => {
  const { getAuthHeaders } = useAuth();
  
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [category, setCategory] = useState('cooked');
  
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [error, setError] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Camera states
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

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

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

  const handleScan = async () => {
    if (!imageFile) {
      setError('Please upload an image or capture a photo first.');
      return;
    }

    setLoading(true);
    setError('');
    setAiAnalysis(null);
    setScanStatus('Initializing AI Vision models...');

    const timer1 = setTimeout(() => setScanStatus('Scanning food item color & geometry...'), 500);
    const timer2 = setTimeout(() => setScanStatus('Analyzing surface textures & freshness indices...'), 1100);
    const timer3 = setTimeout(() => setScanStatus('Verifying package integrity...'), 1700);

    try {
      const form = new FormData();
      form.append('category', category);
      form.append('image', imageFile);

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

  const resetScanner = () => {
    setImageFile(null);
    setAiAnalysis(null);
    setError('');
  };

  return (
    <div className="fade-in max-w-2xl mx-auto" style={{ padding: '1rem 0' }}>
      <div className="panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
            <Sparkles size={26} /> AI Food Quality Scanner
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Check if food is fresh and safe for sharing using smart visual analysis.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {!aiAnalysis ? (
          <div>
            {/* Category selection */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Select Food Category</label>
              <select className="form-control" value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <option value="cooked">Cooked Meals</option>
                <option value="produce">Fresh Produce (Fruits/Veg)</option>
                <option value="dairy">Dairy Products</option>
                <option value="bakery">Bakery / Bread</option>
                <option value="packaged">Packaged Food</option>
                <option value="dry">Dry Ration</option>
              </select>
            </div>

            {/* Input Selection */}
            {!isCameraActive ? (
              <>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px' }} onClick={startCamera}>
                    <Video size={20} /> Take Photo
                  </button>
                  <label className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0, borderRadius: '12px' }}>
                    <ImageIcon size={20} /> Upload Image File
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
                  </label>
                </div>

                {imageFile ? (
                  <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <div className="scanner-container">
                      <img src={previewUrl} className={`scanner-image ${loading ? 'scanner-blur' : ''}`} alt="Preview" />
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
                    padding: '4rem 2rem', 
                    backgroundColor: 'var(--bg-primary)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Camera size={48} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>No image captured or uploaded yet</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#000', marginBottom: '1rem' }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '350px', objectFit: 'cover' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px' }} onClick={stopCamera}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '12px' }} onClick={capturePhoto}>
                    <Camera size={20} /> Capture Photo
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ margin: '1.25rem 0', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <span>⚡ {scanStatus}</span>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)', marginTop: '0.5rem' }} 
              onClick={handleScan} 
              disabled={loading || !imageFile}
            >
              {loading ? 'Running AI Scan...' : 'Start AI Analysis'}
            </button>
          </div>
        ) : (
          /* Result Output Screen */
          <div className="fade-in">
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: aiAnalysis.freshness === 'Poor' ? '#fef2f2' : '#f0fdf4', 
              borderRadius: '16px', 
              border: `1.5px solid ${aiAnalysis.freshness === 'Poor' ? '#fecaca' : '#bbf7d0'}`,
              marginBottom: '2rem'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: aiAnalysis.freshness === 'Poor' ? '#dc2626' : '#16a34a', margin: 0, fontSize: '1.2rem' }}>
                {aiAnalysis.freshness === 'Poor' ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
                {aiAnalysis.status}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>FRESHNESS INDEX</span>
                  <strong style={{ fontSize: '1.1rem', color: aiAnalysis.freshness === 'Poor' ? '#dc2626' : '#16a34a' }}>{aiAnalysis.freshness}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>AI CONFIDENCE</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{aiAnalysis.confidence}</strong>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>HANDLING RECOMMENDATION</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>{aiAnalysis.recommendation}</p>
              </div>
            </div>

            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} 
              onClick={resetScanner}
            >
              <RefreshCw size={18} /> Scan Another Item
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiFoodScannerView;
