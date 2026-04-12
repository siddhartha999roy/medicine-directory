import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

function App() {
  const [medicines, setMedicines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('bd'); 
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [bdRes, indRes, hospRes] = await Promise.all([
          fetch('/bd-medicines.csv'),
          fetch('/indian-medicines.csv'),
          fetch('/hospitals.csv')
        ]);
        const bdText = await bdRes.text();
        const indText = await indRes.text();
        const hospText = await hospRes.text();

        const parseCSV = (text, origin) => {
          const lines = text.split('\n').filter(line => line.trim() !== '');
          return lines.slice(1).map(line => {
            const parts = line.split(',');
            if (origin === 'hospital') {
              return { name: parts[0], location: parts[1], phone: parts[2], category: parts[3], type: 'hospital' };
            }
            return { name: parts[0], generic: parts[1], company: parts[2], indication: parts[3], image: parts[4], type: 'medicine', origin };
          });
        };
        setMedicines([...parseCSV(bdText, 'bd'), ...parseCSV(indText, 'ind')]);
        setHospitals(parseCSV(hospText, 'hospital'));
      } catch (error) {
        console.error("Error loading CSV files:", error);
      }
    };
    loadAllData();
  }, []);

  const speak = (text) => {
    const value = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(value);
  };

  const displayData = category === 'hospitals' 
    ? hospitals.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : medicines.filter(m => m.origin === category && m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="App">
      <header>
        <h1 className="logo">💊 Medi-Directory</h1>
        <div className="search-container">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="tabs">
          <button className={category === 'bd' ? 'active' : ''} onClick={() => setCategory('bd')}>BD Medicine</button>
          <button className={category === 'ind' ? 'active' : ''} onClick={() => setCategory('ind')}>Indian Medicine</button>
          <button className={category === 'hospitals' ? 'active' : ''} onClick={() => setCategory('hospitals')}>🏥 Hospitals</button>
        </div>
      </header>
      <main className="grid-container">
        {displayData.map((item, idx) => (
          <div key={idx} className="card" onClick={() => item.type === 'medicine' && setSelectedItem(item)}>
            <div className="card-info">
              <h3>{item.name}</h3>
              <p className="subtitle">{item.type === 'hospital' ? `📍 ${item.location}` : item.generic}</p>
            </div>
            {item.type === 'hospital' ? (
               <a href={`tel:${item.phone}`} className="call-btn" onClick={(e) => e.stopPropagation()}>📞 Call: {item.phone}</a>
            ) : (
               <button className="voice-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }}>🔊 Pronounce</button>
            )}
          </div>
        ))}
      </main>
      <footer className="footer-nav">
        <button className="map-btn pharmacy" onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me')}>📍 Pharmacy</button>
        <button className="map-btn hospital-map" onClick={() => window.open('https://www.google.com/maps/search/hospitals+near+me')}>🏥 Hospitals</button>
      </footer>
    </div>
  );
}

// এটিই আপনার অ্যাপকে রান করাবে
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
