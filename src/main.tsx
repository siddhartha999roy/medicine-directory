import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Pill, X, MapPin, Loader2, AlertCircle } from 'lucide-react';

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
      error: () => { setLoading(false); }
    });
  }, [tab]);

  const filtered = data.filter(i => 
    (i.name || i.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '15px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <Pill size={35} color="#2563eb" />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Medi-Directory</h1>
        </div>
        <input 
          style={{ width: '100%', maxWidth: '500px', padding: '14px 20px', borderRadius: '15px', border: '2px solid #e2e8f0' }}
          placeholder={tab === 'BD' ? "ওষুধের নাম লিখুন..." : "Search medicine..."} 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '10px 20px', borderRadius: '10px', background: tab === 'BD' ? '#2563eb' : 'white', color: tab === 'BD' ? 'white' : 'black', cursor: 'pointer' }}>🇧🇩 Bangladesh</button>
          <button onClick={() => setTab('India')} style={{ padding: '10px 20px', borderRadius: '10px', background: tab === 'India' ? '#2563eb' : 'white', color: tab === 'India' ? 'white' : 'black', cursor: 'pointer' }}>🇮🇳 India</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading ? <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" /></div> : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filtered.map((m, idx) => (
              <div key={idx} onClick={() => setSelected(m)} style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ margin: 0 }}>{m.name || m.Name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{m.generic || m.Generic}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', z_index: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '400px' }}>
            <h2>{selected.name || selected.Name}</h2>
            <p><strong>Generic:</strong> {selected.generic || selected.Generic}</p>
            <p><strong>Company:</strong> {selected.company || selected.Company}</p>
            
            <div style={{ background: '#fff1f2', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #e11d48', marginTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e11d48', fontWeight: 'bold' }}>
                <AlertCircle size={18} /> <span>সতর্কতা / Warning</span>
              </div>
              {tab === 'BD' ? (
                <div style={{ fontSize: '14px', marginTop: '10px' }}>
                  <p>• ডাক্তারের পরামর্শ ছাড়া সেবন করবেন না।</p>
                  <p>• Do not take without a doctor's advice.</p>
                </div>
              ) : (
                <div style={{ fontSize: '14px', marginTop: '10px' }}>
                  <p>• बिना डॉक्टर की सलाह के इसे न लें।</p>
                  <p>• Consult a doctor before taking this medicine.</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#2563eb', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
