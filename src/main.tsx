import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Pill, Search, Loader2, AlertCircle, X, MapPin } from 'lucide-react';

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

  const filteredData = data.filter(item => 
    (item.name || item.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '15px', fontFamily: 'sans-serif' }}>
      
      {/* 🟢 Nearby Pharmacy Button */}
      <div 
        onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{ position: 'fixed', bottom: '30px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '14px 22px', borderRadius: '50px', zIndex: 100, cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
        <MapPin size={22} />
        <span>Nearby Pharmacy</span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <Pill size={35} color="#2563eb" />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Medi-Directory</h1>
        </div>
        
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <Search size={20} color="#64748b" style={{ position: 'absolute', left: '15px', top: '15px' }} />
          <input 
            style={{ width: '100%', padding: '14px 20px 14px 45px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', background: 'white' }}
            placeholder={tab === 'BD' ? "ওষুধের নাম লিখুন..." : "Search medicine name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: tab === 'BD' ? '#2563eb' : 'white', color: tab === 'BD' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>🇧🇩 Bangladesh</button>
          <button onClick={() => setTab('India')} style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: tab === 'India' ? '#2563eb' : 'white', color: tab === 'India' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>🇮🇳 India</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredData.map((m, idx) => (
              <div key={idx} onClick={() => setSelected(m)} style={{ background: 'white', padding: '18px', borderRadius: '15px', borderLeft: '6px solid #2563eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{m.name || m.Name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{m.generic || m.Generic}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🔴 Detailed Pop-up with Image Support */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '100%', maxWidth: '450px', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
            <X onClick={() => setSelected(null)} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} />
            
            {/* 📸 Medicine Image Display */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {(selected.image || selected.Image) ? (
                <img 
                  src={selected.image || selected.Image} 
                  alt="Medicine" 
                  style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '15px', border: '1px solid #e2e8f0', padding: '5px' }} 
                />
              ) : (
                <div style={{ width: '100px', height: '100px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Pill size={50} color="#cbd5e1" />
                </div>
              )}
            </div>

            <h2 style={{ marginTop: 0, color: '#1e293b', textAlign: 'center' }}>{selected.name || selected.Name}</h2>
            <div style={{ margin: '15px 0' }}>
               <p style={{ marginBottom: '8px' }}><strong>Generic:</strong> {selected.generic || selected.Generic}</p>
               <p style={{ marginBottom: '8px' }}><strong>Company:</strong> {selected.company || selected.Company}</p>
            </div>

            {/* ⚠️ Warning Section */}
            <div style={{ marginTop: '20px', padding: '15px', background: '#fff1f2', borderRadius: '12px', borderLeft: '4px solid #e11d48' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontWeight: 'bold', marginBottom: '10px' }}>
                <AlertCircle size={18} />
                <span>সতর্কতা / Important</span>
              </div>
              
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#881337' }}>
                 <p style={{ margin: '0 0 5px 0' }}>• ডাক্তারের পরামর্শ ছাড়া সেবন করবেন না।</p>
                 <p style={{ margin: 0 }}>• Consult a doctor before use.</p>
              </div>
            </div>

            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '25px', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Close / বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
