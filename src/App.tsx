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
        const [bdT, indT, hospT] = await Promise.all([
          fetch('/bd-medicines.csv').then(res => res.text()),
          fetch('/indian-medicines.csv').then(res => res.text()),
          fetch('/hospitals.csv').then(res => res.text())
        ]);
        const parse = (text, type) => text.split('\n').filter(l => l.trim()).slice(1).map(line => {
          const p = line.split(',');
          if (type === 'h') return { name: p[0], location: p[1], phone: p[2], type: 'h' };
          return { name: p[0], generic: p[1], company: p[2], indication: p[3], image: p[4], origin: type, type: 'm' };
        });
        setMedicines([...parse(bdT, 'bd'), ...parse(indT, 'ind')]);
        setHospitals(parse(hospT, 'h'));
      } catch (err) { console.error("Data Load Error:", err); }
    };
    loadData();
  }, []);

  const speak = (t) => {
    const utterance = new SpeechSynthesisUtterance(t);
    window.speechSynthesis.speak(utterance);
  };

  const displayData = category === 'hospitals' 
    ? hospitals.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : medicines.filter(m => m.origin === category && m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="logo">💊 Medi-Directory</h1>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="ওষুধ বা হাসপাতালের নাম খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <nav className="tabs">
          <button className={category === 'bd' ? 'active' : ''} onClick={() => setCategory('bd')}>BD Medicines</button>
          <button className={category === 'ind' ? 'active' : ''} onClick={() => setCategory('ind')}>Indian Medicines</button>
          <button className={category === 'hospitals' ? 'active' : ''} onClick={() => setCategory('hospitals')}>🏥 Hospitals</button>
        </nav>
      </header>

      <main className="container">
        <div className="grid">
          {displayData.length > 0 ? (
            displayData.map((item, idx) => (
              <div key={idx} className="card" onClick={() => item.type === 'm' && setSelectedItem(item)}>
                <h3>{item.name}</h3>
                <p className="subtitle">{item.type === 'h' ? `📍 ${item.location}` : item.generic}</p>
                <div className="card-actions">
                  {item.type === 'h' ? (
                    <a href={`tel:${item.phone}`} className="call-btn" onClick={(e) => e.stopPropagation()}>📞 কল করুন</a>
                  ) : (
                    <button className="voice-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }}>🔊 উচ্চারণ</button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-result">কোনো তথ্য পাওয়া যায়নি।</div>
          )}
        </div>
      </main>

      {/* ৫. ফ্লোটিং নেয়ার মি বাটন */}
      <a href="https://www.google.com/maps/search/pharmacy+near+me" target="_blank" rel="noreferrer" className="near-me-fab">
        📍 Pharmacy Near Me
      </a>

      {/* ৬. পপ-আপ মোডাল (অ্যানিমেটেড হার্টবিট সহ) */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="heart-anim">❤️‍🔥</div>
            <h2>{selectedItem.name} <span onClick={() => speak(selectedItem.name)} style={{cursor:'pointer'}}>🔊</span></h2>
            <div className="info-grid">
              <p><strong>Generic:</strong> {selectedItem.generic}</p>
              <p><strong>Company:</strong> {selectedItem.company}</p>
              <p><strong>Indication:</strong> {selectedItem.indication}</p>
            </div>
            <div className="caution">
               ⚠️ ডাক্তারের পরামর্শ ছাড়া ওষুধ খাবেন না।
            </div>
            <button className="close-btn" onClick={() => setSelectedItem(null)}>বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
