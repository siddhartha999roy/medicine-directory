import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Pill, Search, Loader2, AlertCircle, X, MapPin, Volume2 } from 'lucide-react';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('BD');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    const file = tab === 'BD' ? '/bd-medicines.csv' : '/indian-medicines.csv';
    Papa.parse(file, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
      error: () => setLoading(false)
    });
  }, [tab]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredData = data.filter(item => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 100);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '15px', fontFamily: 'sans-serif' }}>
      
      {/* 📍 Nearby Pharmacy */}
      <div onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '12px 20px', borderRadius: '50px', zIndex: 100, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
        <MapPin size={20} /> <span>Pharmacy Near Me</span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <Pill size={32} color="#2563eb" />
          <h1 style={{ fontSize: '24px', margin: 0 }}>Medi-Directory</h1>
        </div>
        
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '15px', top: '13px' }} />
          <input style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            placeholder="Search medicine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: tab === 'BD' ? '#2563eb' : '#fff', color: tab === 'BD' ? '#fff' : '#64748b' }}>🇧🇩 BD Medicine</button>
          <button onClick={() => setTab('India')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: tab === 'India' ? '#2563eb' : '#fff', color: tab === 'India' ? '#fff' : '#64748b' }}>🇮🇳 Indian Medicine</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading ? <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div> : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {filteredData.map((m, i) => (
              <div key={i} onClick={() => setSelected(m)} style={{ background: '#fff', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #2563eb', cursor: 'pointer' }}>
                <h3 style={{ margin: 0 }}>{m.name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{m.generic}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🔴 Modal with Voice & Image */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ marginBottom: '15px' }}>
              {selected.image ? (
                <img src={selected.image} alt="Medicine" style={{ width: '120px', height: '120px', objectFit: 'contain' }} 
                     onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/1040/1040238.png'; }} />
              ) : <Pill size={60} color="#cbd5e1" style={{ margin: '0 auto' }} />}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
              <h2 style={{ margin: 0 }}>{selected.name}</h2>
              <Volume2 size={20} color="#2563eb" style={{ cursor: 'pointer' }} onClick={() => speak(selected.name)} />
            </div>
            
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
              <p><strong>Generic:</strong> {selected.generic}</p>
              <p><strong>Company:</strong> {selected.company}</p>
              <p><strong>Indication:</strong> {selected.indication}</p>
            </div>

            <div style={{ padding: '10px', background: '#fff1f2', borderRadius: '10px', color: '#e11d48', fontSize: '13px', marginBottom: '15px' }}>
              <AlertCircle size={16} style={{ marginBottom: '5px' }} />
              <p style={{ margin: 0 }}>ডাক্তারের পরামর্শ ছাড়া ওষুধ সেবন করবেন না।</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>Close / বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
