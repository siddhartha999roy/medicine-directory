import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill, Loader2 } from 'lucide-react';
import './index.css';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ফাইলগুলো /public ফোল্ডারে থাকলে শুধু নাম লিখলেই হয়
    const files = ['/indian-medicines.csv', '/bd-medicines.csv'];
    let loadedData = [];
    let completed = 0;

    files.forEach(file => {
      Papa.parse(file, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            loadedData = [...loadedData, ...results.data];
          }
          completed++;
          if (completed === files.length) {
            setData(loadedData);
            setLoading(false);
          }
        },
        error: (err) => {
          console.error("Error loading file:", file);
          setError(`Could not load ${file}. Please check public folder.`);
          completed++;
          if (completed === files.length) setLoading(false);
        }
      });
    });
  }, []);

  const filteredData = data.filter(item => {
    const name = item.name || item.Name || '';
    const generic = item.generic || item.Generic || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           generic.toLowerCase().includes(searchTerm.toLowerCase());
  }).slice(0, 50); // শুরুতে শুধু প্রথম ৫০টি দেখাবে যাতে অ্যাপ ফাস্ট থাকে

  return (
    <div className="container">
      <header>
        <h1><Pill size={32} /> Medi-Directory</h1>
        <div className="search-box">
          <Search className="icon" />
          <input 
            type="text" 
            placeholder="Search Napa or Generic name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
      </header>

      <main>
        {loading ? (
          <div className="loading"><Loader2 className="spinner" /> Loading Database...</div>
        ) : filteredData.length > 0 ? (
          filteredData.map((med, index) => (
            <div key={index} className="card">
              <h3>{med.name || med.Name}</h3>
              <p><strong>Generic:</strong> {med.generic || med.Generic || 'N/A'}</p>
              <p><strong>Company:</strong> {med.company || med.Company || 'N/A'}</p>
            </div>
          ))
        ) : (
          <div className="no-results">No medicines found matching "{searchTerm}"</div>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
