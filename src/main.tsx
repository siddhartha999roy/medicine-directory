import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill } from 'lucide-react';
import './index.css';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const files = ['/indian-medicines.csv', '/bd-medicines.csv'];
    let loadedCount = 0;

    files.forEach(file => {
      Papa.parse(file, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data) {
            setData(prev => [...prev, ...results.data]);
          }
          loadedCount++;
          if (loadedCount === files.length) setLoading(false);
        },
        error: () => {
          loadedCount++;
          if (loadedCount === files.length) setLoading(false);
        }
      });
    });
  }, []);

  const filteredData = data.filter(item => {
    if (!item.name) return false;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (item.generic && item.generic.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="container">
      <header>
        <h1><Pill size={32} /> Medi-Directory</h1>
        <div className="search-box">
          <Search className="icon" />
          <input 
            type="text" 
            placeholder="Search Napa or Any Medicine..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      <main>
        {loading ? <p style={{textAlign: 'center'}}>Loading medicines...</p> : null}
        {!loading && filteredData.length === 0 ? <p style={{textAlign: 'center'}}>No medicines found.</p> : null}
        {filteredData.map((med, index) => (
          <div key={index} className="card">
            <h3>{med.name || 'Unknown Name'}</h3>
            <p><strong>Generic:</strong> {med.generic || 'N/A'}</p>
            <p><strong>Company:</strong> {med.company || 'N/A'}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
