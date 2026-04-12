import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [medicines, setMedicines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('bd'); // 'bd', 'ind', or 'hospitals'
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // লোড হচ্ছে সব ডাটাবেস
    const loadData = async () => {
      const bdRes = await fetch('/bd-medicines.csv');
      const indRes = await fetch('/indian-medicines.csv');
      const hospRes = await fetch('/hospitals.csv');
      
      const bdText = await bdRes.text();
      const indText = await indRes.text();
      const hospText = await hospRes.text();

      const parseCSV = (text, type) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        return lines.slice(1).map(line => {
          const parts = line.split(',');
          return type === 'hospital' 
            ? { name: parts[0], location: parts[1], phone: parts[2], category: parts[3], type: 'hospital' }
            : { name: parts[0], generic: parts[1], company: parts[2], indication: parts[3], image: parts[4], type: 'medicine' };
        });
      };

      setMedicines([...parseCSV(bdText, 'bd'), ...parseCSV(indText, 'ind')]);
      setHospitals(parseCSV(hospText, 'hospital'));
    };

    loadData();
  }, []);

  const speak = (text) => {
    const value = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(value);
  };

  const filteredData = category === 'hospitals' 
    ? hospitals.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : medicines.filter(m => 
        (category === 'bd' ? m.company !== 'Cipla Ltd' && m.company !== 'Sun Pharma' : m.company === 'Cipla Ltd' || m.company === 'Sun Pharma') &&
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="App">
      <header>
        <h1>Medicine & Hospital Directory</h1>
        <input 
          type="text" 
          placeholder="Search name..." 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <div className="tabs">
          <button className={category === 'bd' ? 'active' : ''} onClick={() => setCategory('bd')}>BD Medicines</button>
          <button className={category === 'ind' ? 'active' : ''} onClick={() => setCategory('ind')}>Indian Medicines</button>
          <button className={category === 'hospitals' ? 'active' : ''} onClick={() => setCategory('hospitals')}>🏥 Hospitals</button>
        </div>
      </header>

      <main className="grid">
        {filteredData.map((item, idx) => (
          <div key={idx} className="card" onClick={() => setSelectedItem(item)}>
            <h3>{item.name}</h3>
            <p>{item.type === 'hospital' ? `📍 ${item.location}` : item.generic}</p>
            {item.type === 'hospital' ? (
               <a href={`tel:${item.phone}`} className="call-btn" onClick={(e) => e.stopPropagation()}>📞 Call: {item.phone}</a>
            ) : (
               <button className="voice-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }}>🔊 Voice</button>
            )}
          </div>
        ))}
      </main>

      {/* আগের পপআপ ফিচারটি এখানে */}
      {selectedItem && selectedItem.type === 'medicine' && (
        <div className="modal" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedItem.image} alt={selectedItem.name} />
            <h2>{selectedItem.name}</h2>
            <p><strong>Generic:</strong> {selectedItem.generic}</p>
            <p><strong>Company:</strong> {selectedItem.company}</p>
            <p><strong>Indication:</strong> {selectedItem.indication}</p>
            <button onClick={() => setSelectedItem(null)}>Close</button>
          </div>
        </div>
      )}

      {/* ম্যাপ বাটন */}
      <footer className="footer-map">
        <button onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me')}>📍 Find Pharmacy Near Me</button>
        <button onClick={() => window.open('https://www.google.com/maps/search/hospitals+near+me')}>🏥 Find Hospitals Near Me</button>
      </footer>
    </div>
  );
}

export default App;
