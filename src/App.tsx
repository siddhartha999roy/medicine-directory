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
      } catch (err) { console.error("Error loading data:", err); }
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
      <header className="fixed-header">
        <h1 className="logo">💊 Medi-Directory</h1>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="ওষুধ বা হাসপাতালের নাম খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="tabs">
          <button className={category === 'bd' ? 'active' : ''} onClick={() => setCategory('bd')}>BD Medicines</button>
          <button className={category === 'ind' ? 'active' : ''} onClick={() => setCategory('ind')}>Indian Medicines</button>
          <button className={category === 'hospitals' ? 'active' : ''} onClick={() => setCategory('hospitals')}>🏥 Hospitals</button>
        </div>
      </header>

      <main className="main-content">
        <div className="card-grid">
          {displayData.map((item, idx) => (
            <div key={idx} className="medicine-card" onClick={() => item.type === 'm' && setSelectedItem(item)}>
              <h3>{item.name}</h3>
              <p>{item.type === 'h' ? `📍 ${item.location}` : item.generic}</p>
              {item.type === 'h' ? (
                 <a href={`tel:${item.phone}`} className="voice-btn" onClick={(e) => e.stopPropagation()}>📞 কল করুন</a>
              ) : (
                 <button className="voice-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }}>🔊 উচ্চারণ</button>
              )}
            </div>
          ))}
        </div>

        {/* --- Medi-Assistant AI Section (New) --- */}
        <div className="ai-container">
          <h2>🤖 Medi-Assistant AI</h2>
          <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>আপনার যেকোনো স্বাস্থ্য বিষয়ক প্রশ্নের উত্তর পেতে AI ব্যবহার করুন।</p>
          <iframe
            src="https://global-student-ai-m4rzaqcfbxis6m98fsyna9.streamlit.app/?embedded=true"
            width="100%"
            height="600px"
            style={{ border: 'none', borderRadius: '15px', background: '#fff' }}
            title="Medi-Assistant AI"
          ></iframe>
        </div>
      </main>

      {/* Near Me Button (Floating) */}
      <a href="https://www.google.com/maps/search/pharmacy+near+me" target="_blank" rel="noreferrer" className="fab-btn">
        📍 Pharmacy Near Me
      </a>

      {/* Pop-up Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="heart-icon">❤️‍🔥</div>
            <h2>{selectedItem.name} <span onClick={() => speak(selectedItem.name)} style={{cursor:'pointer', fontSize: '20px'}}>🔊</span></h2>
            <div className="details">
              <p><strong>Generic:</strong> {selectedItem.generic}</p>
              <p><strong>Company:</strong> {selectedItem.company}</p>
              <p><strong>Indication:</strong> {selectedItem.indication}</p>
            </div>
            <div className="warning">⚠️ ডাক্তারের পরামর্শ ছাড়া ওষুধ খাবেন না।</div>
            <button className="close-btn" onClick={() => setSelectedItem(null)}>বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
