import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill, AlertCircle } from 'lucide-react';
import './index.css';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('Loading database...');

  useEffect(() => {
    // এখানে আপনার GitHub-এর ফাইল নামগুলো হুবহু (ছোট হাতের অক্ষর) হতে হবে
    const files = ['bd-medicines.csv', 'indian-medicines.csv'];
    let allData = [];
    let successCount = 0;

    files.forEach(fileName => {
      Papa.parse(`${window.location.origin}/${fileName}`, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`Loaded ${fileName}:`, results.data.length);
          allData = [...allData, ...results.data];
          successCount++;
          setData([...allData]);
          if (successCount === files.length) setStatus('');
        },
        error: (err) => {
          console.error(`Failed to load ${fileName}`, err);
          setStatus(`Error loading ${fileName}. Check file names in GitHub.`);
        }
      });
    });
  }, []);

  const filteredData = data.filter(item => {
    // আপনার CSV-তে কলামের নাম 'name' বা 'brand' যাই হোক, এটি সব চেক করবে
    const name = (item.name || item.brand || item.Medicine || "").toLowerCase();
    const generic = (item.generic || item.Generic || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || generic.includes(search);
  });

  return (
    <div className="container">
      <header>
        <h1><Pill size={32} color="#3498db" /> Medi-Directory</h1>
        <div className="search-box">
          <Search className="icon" />
          <input 
            type="text" 
            placeholder="Search Napa or Generic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {status && <p style={{color: 'orange', fontSize: '12px'}}><AlertCircle size={14} /> {status}</p>}
      </header>

      <main>
        {filteredData.length > 0 ? (
          filteredData.slice(0, 50).map((med, index) => (
            <div key={index} className="card">
              <h3>{med.name || med.brand || med.Medicine || "No Name"}</h3>
              <p><strong>Generic:</strong> {med.generic || med.Generic || "N/A"}</p>
              <p><strong>Company:</strong> {med.company || med.Manufacturer || "N/A"}</p>
            </div>
          ))
        ) : (
          <div style={{textAlign: 'center', marginTop: '40px', color: '#888'}}>
            {searchTerm ? "No results found." : "Waiting for data..."}
          </div>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
