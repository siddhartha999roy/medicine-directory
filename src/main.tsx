import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill, Loader2, X, AlertCircle, MapPin, Phone } from 'lucide-react';
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
        complete: (results) => {
          if (results.data) setter(results.data);
        },
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
  }).slice(0, 100);

  // Nearby Pharmacy সার্চ করার ফাংশন
  const findNearbyPharmacy = () => {
    const url = "https://www.google.com/maps/search/pharmacy+near+me/";
    window.open(url, '_blank');
  };

  return (
    <div className="container">
      {/* Nearby Pharmacy Floating Button - Right Top Corner */}
      <button className="nearby-btn" onClick={findNearbyPharmacy}>
        <MapPin size={18} />
        <span>Nearby Pharmacy</span>
      </button>

      <header>
        <div className="brand">
          <Pill size={32} className="logo-icon" />
          <h1>Medi-Directory</h1>
        </div>
        <div className="search-box">
          <Search className="icon" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'BD' ? 'Bangladeshi' : 'Indian'} medicine...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'BD' ? 'active' : ''}`} onClick={() => setActiveTab('BD')}>🇧🇩 BD</button>
          <button className={`tab-btn ${activeTab === 'India' ? 'active' : ''}`} onClick={() => setActiveTab('India')}>🇮🇳 India</button>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loading"><Loader2 className="spinner" /> Loading...</div>
        ) : (
          <div className="med-grid">
            {filteredData.map((med, index) => (
              <div key={index} className="card clickable" onClick={() => setSelectedMed(med)}>
                <div className="card-accent"></div>
                <h3>{med.name || med.Name}</h3>
                <p className="generic-text">{med.generic || med.Generic}</p>
                {med.indication && <span className="indication-tag">{med.indication}</span>}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Pop-up Modal */}
      {selectedMed && (
        <div className="modal-overlay" onClick={() => setSelectedMed(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMed(null)}><X size={24} /></button>
            <div className="modal-header">
              <div className="pill-icon-bg"><Pill size={30} color="#1a73e8" /></div>
              <h2>{selectedMed.name || selectedMed.Name}</h2>
            </div>
            <div className="modal-body">
              <div className="info-row"><strong>Generic:</strong> <span>{selectedMed.generic || selectedMed.Generic}</span></div>
              <div className="info-row"><strong>Company:</strong> <span>{selectedMed.company || selectedMed.Company}</span></div>
              <div className="info-row"><strong>Main Use:</strong> <span className="indication-highlight">{selectedMed.indication || 'General Use'}</span></div>
              <div className="disclaimer-box">
                <AlertCircle size={20} className="alert-icon" />
                <div className="disclaimer-text">
                  <p>* Consult a doctor before use.</p>
                  <p className="native-lang">
                    {activeTab === 'BD' ? '* ব্যবহারের আগে অবশ্যই ডাক্তারের পরামর্শ নিন।' : '* डॉक्टर से सलाह लें।'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
