import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill, Loader2, Globe } from 'lucide-react';
import './index.css';

const App = () => {
  const [bdData, setBdData] = useState([]);
  const [indiaData, setIndiaData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BD'); // 'BD' অথবা 'India'

  useEffect(() => {
    // ফাইল লোড করার লজিক
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

    // আপনার public ফোল্ডার থেকে ফাইল দুটি লোড হবে
    loadFile('/bd-medicines.csv', setBdData);
    loadFile('/indian-medicines.csv', setIndiaData);

    // ছোট ডিলে দিয়ে লোডিং শেষ করা
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // বর্তমানে কোন ডাটা দেখাবে তা নির্ধারণ
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
        
        {/* সার্চ বক্স */}
        <div className="search-box">
          <Search className="icon" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'BD' ? 'Bangladeshi' : 'Indian'} medicine...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* দেশ পরিবর্তনের ট্যাব */}
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'BD' ? 'active' : ''}`}
            onClick={() => setActiveTab('BD')}
          >
            🇧🇩 Bangladesh
          </button>
          <button 
            className={`tab-btn ${activeTab === 'India' ? 'active' : ''}`}
            onClick={() => setActiveTab('India')}
          >
            🇮🇳 India
          </button>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loading"><Loader2 className="spinner" /> Updating Database...</div>
        ) : filteredData.length > 0 ? (
          filteredData.map((med, index) => (
            <div key={index} className="card">
              <h3>{med.name || med.Name}</h3>
              <p><strong>Generic:</strong> {med.generic || med.Generic || 'N/A'}</p>
              <p><strong>Company:</strong> {med.company || med.Company || 'N/A'}</p>
            </div>
          ))
        ) : (
          <div className="no-results">No medicines found in {activeTab} list.</div>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
