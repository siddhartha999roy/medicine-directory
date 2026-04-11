import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Pill, X, MapPin, Search, Loader2, AlertCircle } from 'lucide-react';

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
      complete: (r) => { setData(r.data); setLoading(false); },
      error: () => { setLoading(false); }
    });
  }, [tab]);

  const filtered = data.filter(i => 
    (i.name || i.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '15px', fontFamily: 'sans-serif' }}>
      
      <div 
        onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{ position: 'fixed', bottom: '30px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '14px 22px', borderRadius: '50px', zIndex: 100, cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
        <MapPin size={22} />
        <span>Nearby Pharmacy</span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <Pill size={35} color="#2563eb" />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Medi-Directory</h1>
        </div>
        
        <input 
          style={{ width: '100%', maxWidth: '500px', padding: '14px 20px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none' }}
          placeholder={tab === 'BD' ? "ওষুধ খুঁজুন..." : "Search medicine..."} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: tab === 'BD' ? '#2563eb' : 'white', color: tab === 'BD' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>🇧🇩 Bangladesh</button>
          <button onClick={() => setTab('India')} style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: tab === 'India' ? '#2563eb' : 'white', color: tab === 'India' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>🇮🇳 India</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading ? <div style={{ textAlign: 'center' }}>Loading...</div> : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filtered.map((m, idx) => (
              <div key={idx} onClick={() => setSelected(m)} style={{ background: 'white', padding: '18px', borderRadius: '15px', borderLeft: '6px solid #2563eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{m.name || m.Name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{m.generic || m.Generic}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '100%', maxWidth: '450px', position: 'relative' }}>
            <X onClick={() => setSelected(null)} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} />
            <h2 style={{ marginTop: 0 }}>{selected.name || selected.Name}</h2>
            <p><strong>Generic:</strong> {selected.generic || selected.Generic}</p>
            <p><strong>Company:</strong> {selected.company || selected.Company}</p>

            <div style={{ marginTop: '20px', padding: '15px', background: '#fff1f2', borderRadius: '12px', borderLeft: '4px solid #e11d48' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontWeight: 'bold', marginBottom: '10px' }}>
                <AlertCircle size={18} />
                <span>Important / গুরুত্বপূর্ণ / महत्वपूर्ण</span>
              </div>
              {tab === 'BD' ? (
                <div style={{ fontSize: '14px', color: '#881337' }}>
                  <p>• ডাক্তারের পরামর্শ ছাড়া এই ওষুধ খাবেন না। এটি জ্বর বা ব্যথার জন্য।</p>
                  <p>• Do not take without doctor's advice. Used for fever/pain.</p>
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#881337' }}>
                  <p>• बिना डॉक्टर की सलाह के यह दवा न लें।</p>
                  <p>• Do not take without doctor's advice. Consult a professional.</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}
