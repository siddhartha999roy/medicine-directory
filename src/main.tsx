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
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '15px', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      
      {/* 🟢 Floating Pharmacy Button */}
      <div 
        onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{ position: 'fixed', bottom: '30px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '14px 22px', borderRadius: '50px', zIndex: 100, cursor: 'pointer', boxShadow: '0 10px 25px rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', border: 'none' }}>
        <MapPin size={22} />
        <span>Nearby Pharmacy</span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '25px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#2563eb', padding: '10px', borderRadius: '12px' }}>
            <Pill size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1e293b', letterSpacing: '-0.5px' }}>Medi-Directory</h1>
        </div>
        
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <Search size={20} color="#64748b" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            style={{ width: '100%', padding: '14px 20px 14px 45px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', background: 'white' }}
            placeholder="Search for medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: tab === 'BD' ? '#2563eb' : 'white', color: tab === 'BD' ? 'white' : '#64748b', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.3s' }}>🇧🇩 Bangladesh</button>
          <button onClick={() => setTab('India')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: tab === 'India' ? '#2563eb' : 'white', color: tab === 'India' ? 'white' : '#64748b', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.3s' }}>🇮🇳 India</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
        {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> <p>Loading medicines...</p></div> : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filtered.map((m, idx) => (
              <div key={idx} onClick={() => setSelected(m)} style={{ background: 'white', padding: '18px', borderRadius: '16px', borderLeft: '6px solid #2563eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1e293b' }}>{m.name || m.Name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{m.generic || m.Generic}</p>
                <div style={{ marginTop: '8px', display: 'inline-block', fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{m.indication || 'General'}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
            <div style={{ color: '#2563eb', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px' }}>MEDICINE DETAILS</div>
            <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '24px' }}>{selected.name || selected.Name}</h2>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />
            <div style={{ display: 'grid', gap: '15px' }}>
              <div><span style={{ color: '#64748b', fontSize: '13px' }}>GENERIC NAME</span><p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{selected.generic || selected.Generic}</p></div>
              <div><span style={{ color: '#64748b', fontSize: '13px' }}>MANUFACTURER</span><p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{selected.company || selected.Company}</p></div>
              <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '12px', borderLeft: '4px solid #f97316' }}>
                <span style={{ color: '#c2410c', fontSize: '13px', fontWeight: 'bold' }}>INDICATIONS</span>
                <p style={{ margin: '4px 0 0 0', color: '#7c2d12', fontSize: '14px', lineHeight: '1.5' }}>{selected.indication || 'Used for general healthcare as prescribed by doctors.'}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '25px', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Close Details</button>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
