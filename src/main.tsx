import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Pill, X, MapPin, Search, Loader2 } from 'lucide-react';

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
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => { setData(r.data); setLoading(false); },
      error: () => { console.error("CSV loading error"); setLoading(false); }
    });
  }, [tab]);

  const filtered = data.filter(i => 
    (i.name || i.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '15px', fontFamily: 'sans-serif' }}>
      
      {/* 🟢 NEARBY PHARMACY BUTTON */}
      <div 
        onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{ position: 'fixed', bottom: '25px', right: '25px', backgroundColor: '#22c55e', color: 'white', padding: '15px 20px', borderRadius: '50px', zIndex: 99999, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
        <MapPin size={22} />
        <span>Nearby Pharmacy</span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <Pill size={35} color="#2563eb" />
          <h1 style={{ fontSize: '28px', margin: 0, color: '#1e293b' }}>Medi-Directory</h1>
        </div>
        
        <input 
          style={{ width: '100%', maxWidth: '500px', padding: '12px 20px', borderRadius: '30px', border: '1px solid #cbd5e1', fontSize: '16px' }}
          placeholder="Search medicine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', background: tab === 'BD' ? '#2563eb' : '#e2e8f0', color: tab === 'BD' ? 'white' : '#475569', fontWeight: 'bold' }}>🇧🇩 Bangladesh</button>
          <button onClick={() => setTab('India')} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', background: tab === 'India' ? '#2563eb' : '#e2e8f0', color: tab === 'India' ? 'white' : '#475569', fontWeight: 'bold' }}>🇮🇳 India</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading ? <div style={{ textAlign: 'center' }}>Loading...</div> : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filtered.map((m, idx) => (
              <div key={idx} onClick={() => setSelected(m)} style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #2563eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{m.name || m.Name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{m.generic || m.Generic}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <X onClick={() => setSelected(null)} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer' }} />
            <h2 style={{ marginTop: 0 }}>{selected.name || selected.Name}</h2>
            <p><strong>Generic:</strong> {selected.generic || selected.Generic}</p>
            <p><strong>Company:</strong> {selected.company || selected.Company}</p>
            <p style={{ color: '#ef4444' }}><strong>Indications:</strong> {selected.indication || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
