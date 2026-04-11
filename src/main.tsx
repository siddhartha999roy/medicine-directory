import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill, Loader2, X, AlertCircle, MapPin } from 'lucide-react';
import './index.css';

const App = () => {
  const [bdData, setBdData] = useState([]);
  const [indiaData, setIndiaData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BD');
  const [selectedMed, setSelectedMed] = useState(null);

  useEffect(() => {
    const loadFile = (fileName, setter) => {
      Papa.parse(`/${fileName}`, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => { if (results.data) setter(results.data); },
      });
    };
    loadFile('bd-medicines.csv', setBdData);
    loadFile('indian-medicines.csv', setIndiaData);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const currentData = activeTab === 'BD' ? bdData : indiaData;
  const filteredData = currentData.filter(item => {
    const name = (item.name || item.Name || '').toString().toLowerCase();
    const generic = (item.generic || item.Generic || '').toString().toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || generic.includes(searchTerm.toLowerCase());
  }).slice(0, 50);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#f8f9fa' }}>
      
      {/* FIXED BUTTON - এটি এখন ইনলাইন স্টাইলে, তাই না আসার উপায় নেই */}
      <div 
        onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          backgroundColor: '#34a853',
          color: 'white',
          padding: '15px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          zIndex: 99999,
          cursor: 'pointer',
          fontWeight: 'bold',
          border: '2px solid white'
        }}
      >
        <MapPin size={24} />
        <span className="hide-on-mobile">Nearby Pharmacy</span>
      </div>

      <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <Pill size={32} color="#1a73e8" />
            <h1 style={{ fontSize: '28px', margin: 0 }}>Medi-Directory</h1>
          </div>
          
          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 20px' }}>
            <Search style={{ position: 'absolute', left: '15px', top: '12px', color: '#5f6368' }} />
            <input 
              type="text" 
              placeholder="Search medicine..."
              style={{ width: '100%', padding: '12px 45px', borderRadius: '25px', border: '1px solid #dfe1e5', fontSize: '16px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('BD')}
              style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: activeTab === 'BD' ? '#1a73e8' : 'white', color: activeTab === 'BD' ? 'white' : '#5f6368', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            >
              🇧🇩 Bangladesh
            </button>
            <button 
              onClick={() => setActiveTab('India')}
              style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: activeTab === 'India' ? '#1a73e8' : 'white', color: activeTab === 'India' ? 'white' : '#5f6368', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            >
              🇮🇳 India
            </button>
          </div>
        </header>

        <main>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}><Loader2 className="spinner" /> Loading...</div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {filteredData.map((med, index) => (
                <div 
                  key={index} 
                  onClick={() => setSelectedMed(med)}
                  style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e0e0e0', cursor: 'pointer', borderLeft: '5px solid #1a73e8' }}
                >
                  <h3 style={{ margin: '0 0 5px 0', color: '#1a73e8' }}>{med.name || med.Name}</h3>
                  <p style={{ margin: 0, color: '#5f6368', fontSize: '14px' }}>{med.generic || med.Generic}</p>
                  {med.indication && (
                    <span style={{ display: 'inline-block', marginTop: '8px', background: '#e8f0fe', color: '#1a73e8', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                      {med.indication}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Pop-up Modal */}
      {selectedMed && (
        <div 
          onClick={() => setSelectedMed(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', padding: '25px', borderRadius: '20px', width: '100%', maxWidth: '400px', position: 'relative' }}
          >
            <X onClick={() => setSelectedMed(null)} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer' }} />
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#e8f0fe', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Pill size={25} color="#1a73e8" />
              </div>
              <h2 style={{ margin: 0 }}>{selectedMed.name || selectedMed.Name}</h2>
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
              <div><strong>Generic:</strong> {selectedMed.generic || selectedMed.Generic}</div>
              <div><strong>Company:</strong> {selectedMed.company || selectedMed.Company}</div>
              <div style={{ color: '#d93025' }}><strong>Indication:</strong> {selectedMed.indication || 'N/A'}</div>
            </div>
            <div style={{ marginTop: '20px', padding: '10px', background: '#fff8f8', borderRadius: '10px', border: '1px solid #fce8e6', fontSize: '12px' }}>
              <p style={{ margin: 0 }}>* ব্যবহারের আগে ডাক্তারের পরামর্শ নিন।</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
