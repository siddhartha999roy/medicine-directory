import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Pill, Search, Loader2, AlertCircle, X, MapPin, Volume2 } from 'lucide-react';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('BD'); // Default Tab
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
    (item.name || item.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '15px', fontFamily: 'sans-serif' }}>
      
      {/* Pharmacy Finder Button */}
      <div onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{ position: 'fixed', bottom: '30px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '14px 22px', borderRadius: '50px', zIndex: 100, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
        <MapPin size={22} />
        <span>Pharmacy Near Me</span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <Pill size={35} color="#2563eb" />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Medi-Directory</h1>
        </div>
        
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <Search size={20} color="#64748b" style={{ position: 'absolute', left: '15px', top: '15px' }} />
          <input style={{ width: '100%', padding: '14px 20px 14px 45px', borderRadius: '15px', border: '2px solid #e2e8f0' }}
            placeholder={tab === 'BD' ? "ওষুধের নাম লিখুন..." : "Search medicine..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: tab === 'BD' ? '#2563eb' : 'white', color: tab === 'BD' ? 'white' : '#64748b', fontWeight: 'bold' }}>🇧🇩 BD Medicine</button>
          <button onClick={() => setTab('India')} style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: tab === 'India' ? '#2563eb' : 'white', color: tab === 'India' ? 'white' : '#64748b', fontWeight: 'bold' }}>🇮🇳 Indian Medicine</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} color="#2563eb" /></div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredData.map((m, idx) => (
              <div key={idx} onClick={() => setSelected(m)} style={{ background: 'white', padding: '18px', borderRadius: '15px', borderLeft: '6px solid #2563eb', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{m.name || m.Name}</h3>
                <p style={{ margin: 0, color: '#64748b' }}>{m.generic || m.Generic}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '100%', maxWidth: '450px', position: 'relative' }}>
            <X onClick={() => setSelected(null)} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} />
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {(selected.image || selected.Image) ? (
                <img src={selected.image || selected.Image} alt="Medicine" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
              ) : (
                <Pill size={60} color="#cbd5e1" style={{ margin: '0 auto' }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0 }}>{selected.name || selected.Name}</h2>
              <button onClick={() => speak(selected.name || selected.Name)} style={{ border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><Volume2 size={20} color="#2563eb" /></button>
            </div>

            <p><strong>Generic:</strong> {selected.generic || selected.Generic}</p>
            <p><strong>Company:</strong> {selected.company || selected.Company}</p>
            <p><strong>Indication:</strong> {selected.indication || selected.Indication || 'N/A'}</p>

            <div style={{ marginTop: '20px', padding: '15px', background: '#fff1f2', borderRadius: '12px', borderLeft: '4px solid #e11d48' }}>
              <AlertCircle size={18} color="#e11d48" />
              <p style={{ fontSize: '14px', color: '#881337', margin: '5px 0 0 0' }}>ডাক্তারের পরামর্শ ছাড়া ওষুধ সেবন করবেন না।</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '20px', padding: '14px', background: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold' }}>Close / বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
