import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Pill, Search, Loader2, AlertCircle, X } from 'lucide-react';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('BD');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    // ট্যাব অনুযায়ী ডাটা লোড করার লজিক
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
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '15px', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Header Section */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <Pill size={32} color="#2563eb" />
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Medi-Directory</h1>
        </div>
        
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <Search style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }} size={20} />
          <input 
            style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
            placeholder={tab === 'BD' ? "ওষুধের নাম লিখুন..." : "Search medicine..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={() => setTab('BD')}
            style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', background: tab === 'BD' ? '#2563eb' : '#fff', color: tab === 'BD' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            🇧🇩 BD
          </button>
          <button 
            onClick={() => setTab('India')}
            style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', background: tab === 'India' ? '#2563eb' : '#fff', color: tab === 'India' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            🇮🇳 India
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 className="animate-spin" size={40} color="#2563eb" /></div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredData.map((med, index) => (
              <div 
                key={index} 
                onClick={() => setSelected(med)}
                style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', borderLeft: '5px solid #2563eb' }}
              >
                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{med.name || med.Name}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{med.generic || med.Generic}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modern Pop-up Modal */}
      {selected && (
        <div 
          onClick={() => setSelected(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}
          >
            <div style={{ padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b' }}>{selected.name || selected.Name}</h2>
                <X onClick={() => setSelected(null)} style={{ cursor: 'pointer', color: '#94a3b8' }} />
              </div>
              
              <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                <p style={{ margin: 0 }}><strong>Generic:</strong> {selected.generic || selected.Generic}</p>
                <p style={{ margin: 0 }}><strong>Company:</strong> {selected.company || selected.Company}</p>
              </div>

              {/* Warning Box */}
              <div style={{ background: '#fff1f2', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #e11d48' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontWeight: 'bold', marginBottom: '8px' }}>
                  <AlertCircle size={18} /> <span>সতর্কতা / Warning</span>
                </div>
                {tab === 'BD' ? (
                  <div style={{ fontSize: '14px', color: '#9f1239' }}>
                    <p style={{ margin: '0 0 5px 0' }}>• ডাক্তারের পরামর্শ ছাড়া সেবন করবেন না।</p>
                    <p style={{ margin: 0 }}>• Do not take without a doctor's advice.</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#9f1239' }}>
                    <p style={{ margin: '0 0 5px 0' }}>• बिना डॉक्टर की सलाह के इसे न लें।</p>
                    <p style={{ margin: 0 }}>• Consult a doctor before taking this medicine.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelected(null)}
                style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#2563eb', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
