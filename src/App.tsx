import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

function App() {
  const [medicines, setMedicines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('bd'); 
  const [selectedItem, setSelectedItem] = useState(null);

  // ১. ডেটা লোড ফিচার (সব CSV ফাইল রিড করা)
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
          return { 
            name: p[0], 
            generic: p[1], 
            company: p[2], 
            indication: p[3], 
            image: p[4] ? p[4].trim() : '', 
            origin: type, 
            type: 'm' 
          };
        });
        setMedicines([...parse(bdT, 'bd'), ...parse(indT, 'ind')]);
        setHospitals(parse(hospT, 'h'));
      } catch (err) { console.error("Error loading CSV:", err); }
    };
    loadData();
  }, []);

  // ২. ভয়েস ফিচার (Pronunciation)
  const speak = (t) => {
    const utterance = new SpeechSynthesisUtterance(t);
    window.speechSynthesis.speak(utterance);
  };

  // ৩. সার্চ এবং ক্যাটাগরি ফিল্টার
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
            placeholder="Search medicine or hospital..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        {/* ৪. ট্যাব ফিচার (হাসপাতাল সহ) */}
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
               <a href={`tel:${item.phone}`} className="call-btn" onClick={(e) => e.stopPropagation()}>📞 Call Now</a>
            ) : (
               <button className="voice-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }}>🔊 Pronounce</button>
            )}
          </div>
        ))}
      </main>

      {/* ৫. পপ-আপ মোডাল ফিচার (Medicine Details) */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)} style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:10000}}>
          <div className="modal-body" onClick={e => e.stopPropagation()} style={{background:'white', padding:'20px', borderRadius:'15px', width:'90%', maxWidth:'400px', textAlign:'center', position:'relative', boxShadow:'0 10px 25px rgba(0,0,0,0.3)'}}>
            <span className="close-x" onClick={() => setSelectedItem(null)} style={{position:'absolute', top:'10px', right:'15px', border:'none', background:'none', fontSize:'24px', cursor:'pointer'}}>×</span>
            
            {/* ছবির জন্য ফিক্সড কোড */}
            <img 
              src={selectedItem.image} 
              alt={selectedItem.name} 
              className="modal-img" 
              style={{width:'100%', maxHeight:'200px', objectFit:'contain', marginBottom:'15px'}}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
            />
            
            <h2 style={{margin:'10px 0', fontSize:'22px'}}>{selectedItem.name}</h2>
            
            <div className="details" style={{textAlign:'left', fontSize:'16px', lineHeight:'1.8', marginTop:'15px'}}>
              <p><strong>Generic:</strong> {selectedItem.generic}</p>
              <p><strong>Company:</strong> {selectedItem.company}</p>
              <p><strong>Indication:</strong> {selectedItem.indication}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
