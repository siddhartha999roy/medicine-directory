import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill, Loader2, X, MapPin } from 'lucide-react';

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
      error: () => setLoading(false)
    });
  }, [tab]);

  const filtered = data.filter(i => 
    (i.name || i.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '15px' }}>
      {/* Floating Map Button */}
      <div onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#22c55e', color: 'white', padding: '12px 20px', borderRadius: '50px', zIndex: 9999, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MapPin size={20} /> <span style={{ fontWeight: 'bold' }}>Pharmacy Near Me</span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Pill color="#2563eb" /> Medi-Directory
        </h1>
        <input style={{ width: '100%', maxWidth: '400px', padding: '12px', borderRadius: '25px', border: '1px solid #ccc' }}
          placeholder="Search medicine..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => setTab('BD')} style={{ margin: '5px', padding: '8px 15px', background: tab === 'BD' ? '#2563eb' : '#ddd', color: tab === 'BD' ? 'white' : 'black', border: 'none', borderRadius: '15px' }}>🇧🇩 BD</button>
          <button onClick={() => setTab('India')} style={{ margin: '5px', padding: '8px 15px', background: tab === 'India' ? '#2563eb' : '#ddd', color: tab === 'India' ? 'white' : 'black', border: 'none', borderRadius: '15px' }}>🇮🇳 India</button>
        </div>
      </header>

      {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gap: '10px' }}>
          {filtered.map((m, i) => (
            <div key={i} onClick={() => setSelected(m)} style={{ background: 'white', padding: '15px', borderRadius: '10px', borderLeft: '5px solid #2563eb', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: 0 }}>{m.name || m.Name}</h3>
              <p style={{ margin: 0, color: '#666' }}>{m.generic || m.Generic}</p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '90%', maxWidth: '400px' }}>
            <h2>{selected.name || selected.Name}</h2>
            <p><b>Generic:</b> {selected.generic || selected.Generic}</p>
            <p><b>Company:</b> {selected.company || selected.Company}</p>
            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
