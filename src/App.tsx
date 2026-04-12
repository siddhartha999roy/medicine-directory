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
    const loadData = async () => {
      try {
        const [bdText, indText, hospText] = await Promise.all([
          fetch('/bd-medicines.csv').then(res => res.text()),
          fetch('/indian-medicines.csv').then(res => res.text()),
          fetch('/hospitals.csv').then(res => res.text())
        ]);

        const parse = (text, type) => {
          const lines = text.split('\n').filter(l => l.trim() !== '');
          return lines.slice(1).map(line => {
            const p = line.split(',');
            if (type === 'h') return { name: p[0], location: p[1], phone: p[2], type: 'h' };
            return { name: p[0], generic: p[1], company: p[2], indication: p[3], image: p[4], origin: type, type: 'm' };
          });
        };

        setMedicines([...parse(bdText, 'bd'), ...parse(indText, 'ind')]);
        setHospitals(parse(hospText, 'h'));
      } catch (error) { console.error("Data error:", error); }
    };
    loadData();
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
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="tabs">
          <button className={category === 'bd' ? 'active' : ''} onClick={() => setCategory('bd')}>BD Medicine</button>
          <button className={category === 'ind' ? 'active' : ''} onClick={() => setCategory('ind')}>Indian Medicine</button>
          <button className={category === 'hospitals' ? 'active' : ''} onClick={() => setCategory('hospitals')}>🏥 Hospitals</button>
        </div>
      </header>

      <main className="grid-container">
        {displayData.map((item, idx) => (
          <div key={idx} className="card" onClick={() => item.type === 'm' && setSelectedItem(item)}>
            <h3>{item.name}</h3>
            <p className="subtitle">{item.type === 'h' ? `📍 ${item.location}` : item.generic}</p>
            {item.type === 'h' ? (
               <a href={`tel:${item.phone}`} className="call-btn" onClick={(e) => e.stopPropagation()}>📞 Call: {item.phone}</a>
            ) : (
               <button className="voice-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }}>🔊 Pronounce</button>
            )}
          </div>
        ))}
      </main>

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-body" onClick={e => e.stopPropagation()}>
            <img src={selectedItem.image} alt={selectedItem.name} className="modal-img" />
            <h2>{selectedItem.name}</h2>
            <p><strong>Generic:</strong> {selectedItem.generic}</p>
            <p><strong>Indication:</strong> {selectedItem.indication}</p>
            <button className="close-btn" onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
