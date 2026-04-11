import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Search, Pill } from 'lucide-react';
import './index.css';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // এটি ইন্ডিয়ান এবং বাংলাদেশি দুই ডাটাই লোড করার চেষ্টা করবে
    const files = ['/indian-medicines.csv', '/bd-medicines.csv'];
    files.forEach(file => {
      Papa.parse(file, {
        download: true,
        header: true,
        complete: (results) => {
          setData(prev => [...prev, ...results.data]);
        },
      });
    });
  }, []);

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.generic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <header>
        <h1><Pill size={32} /> Medi-Directory</h1>
        <div className="search-box">
          <Search className="icon" />
          <input 
            type="text" 
            placeholder="Search medicine or generic..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      <main>
        {filteredData.map((med, index) => (
          <div key={index} className="card">
            <h3>{med.name}</h3>
            <p><strong>Generic:</strong> {med.generic}</p>
            <p><strong>Company:</strong> {med.company}</p>
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
