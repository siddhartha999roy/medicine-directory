import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill, Activity } from 'lucide-react';
import './index.css';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // এখানে আপনার গিটহাবের ফাইলগুলোর নাম হুবহু মিলতে হবে
    const files = ['bd-medicines.csv', 'indian-medicines.csv'];
    let loadedData = [];
    let processedFiles = 0;

    files.forEach(file => {
      Papa.parse(`/${file}`, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`Loaded ${file}:`, results.data.length);
          loadedData = [...loadedData, ...results.data];
          processedFiles++;
          if (processedFiles === files.length) {
            setData(loadedData);
            setLoading(false);
          }
        },
        error: (err) => {
          console.error(`Error loading ${file}:`, err);
          processedFiles++;
          if (processedFiles === files.length) setLoading(false);
        }
      });
    });
  }, []);

  // সার্চ লজিক
  const filteredData = data.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.generic?.toLowerCase().includes(search) ||
      item.brand?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container">
      <header>
        <h1 style={{color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <Pill color="#3498db" size={35} /> Medi-Directory
        </h1>
        <p style={{fontSize: '14px', color: '#7f8c8d', marginBottom: '20px'}}>Siddhartha's Medicine Database</p>
        <div className="search-box">
          <Search className="icon" />
          <input 
            type="text" 
            placeholder="Search Napa, Paracetamol or any medicine..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main>
        {loading ? (
          <div style={{textAlign: 'center', padding: '50px'}}>
             <Activity className="animate-spin" />
             <p>Loading database... Please wait</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid">
            {filteredData.slice(0, 100).map((med, index) => (
              <div key={index} className="card">
                <h3>{med.name || med.brand || 'No Name'}</h3>
                <p><strong>Generic:</strong> {med.generic || 'N/A'}</p>
                <p><strong>Company:</strong> {med.company || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '50px', color: '#95a5a6'}}>
            {searchTerm ? "No medicines found!" : "Start typing to search..."}
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
