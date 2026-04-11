import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill, Loader2, X } from 'lucide-react';
import './index.css';

const App = () => {
  const [bdData, setBdData] = useState([]);
  const [indiaData, setIndiaData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BD');
  const [selectedMed, setSelectedMed] = useState(null); // যে ওষুধে ক্লিক করবেন সেটি এখানে জমা হবে

  useEffect(() => {
    const loadFile = (path, setter) => {
      Papa.parse(path, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data) setter(results.data);
        },
      });
    };
    loadFile('/bd-medicines.csv', setBdData);
    loadFile('/indian-medicines.csv', setIndiaData);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const currentData = activeTab === 'BD' ? bdData : indiaData;

  const filteredData = currentData.filter(item => {
    const name = item.name || item.Name || '';
    const generic = item.generic || item.Generic || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           generic.toLowerCase().includes(searchTerm.toLowerCase());
  }).slice(0, 100);

  return (
    <div className="container">
      <header>
        <h1><Pill size={32} /> Medi-Directory</h1>
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
          <div className="med-list">
            {filteredData.map((med, index) => (
              <div key={index} className="card clickable" onClick={() => setSelectedMed(med)}>
                <h3>{med.name || med.Name}</h3>
                <p className="generic-short">{med.generic || med.Generic}</p>
                <small>Click for details →</small>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ওষুধে ক্লিক করলে এই পপ-আপ বা Modal টি আসবে */}
      {selectedMed && (
        <div className="modal-overlay" onClick={() => setSelectedMed(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedMed(null)}><X /></button>
            <div className="modal-header">
              <Pill size={40} color="#1a73e8" />
              <h2>{selectedMed.name || selectedMed.Name}</h2>
            </div>
            <hr />
            <div className="modal-body">
              <p><strong>Generic Name:</strong> {selectedMed.generic || selectedMed.Generic}</p>
              <p><strong>Manufacturer:</strong> {selectedMed.company || selectedMed.Company}</p>
              <p><strong>Country:</strong> {activeTab === 'BD' ? 'Bangladesh' : 'India'}</p>
              <div className="disclaimer">
                * This information is for educational purposes. Consult a doctor before use.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
