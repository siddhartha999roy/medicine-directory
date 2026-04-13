import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

function App() {
  const [medicines, setMedicines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('bd'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark Mode State
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  }); // Favorites State

  const aiSectionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

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
          return { id: p[0]+p[1], name: p[0], generic: p[1], company: p[2], indication: p[3], image: p[4], origin: type, type: 'm' };
        });
        setMedicines([...parse(bdT, 'bd'), ...parse(indT, 'ind')]);
        setHospitals(parse(hospT, 'h'));
      } catch (err) { console.error("Error:", err); }
    };
    loadData();
  }, []);

  const speak = (t) => {
    const utterance = new SpeechSynthesisUtterance(t);
    window.speechSynthesis.speak(utterance);
  };

  const toggleFavorite = (e, item) => {
    e.stopPropagation();
    const isFav = favorites.find(f => f.name === item.name);
    if (isFav) {
      setFavorites(favorites.filter(f => f.name !== item.name));
    } else {
      setFavorites([...favorites, item]);
    }
  };

  const displayData = category === 'favorites' 
    ? favorites 
    : category === 'hospitals' 
      ? hospitals.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : medicines.filter(m => m.origin === category && m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`App ${isDarkMode ? 'dark-theme' : ''}`}>
      <header className="fixed-header">
        <div className="header-top">
           <h1 className="logo">💊 Medi-Directory</h1>
           <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
             {isDarkMode ? '☀️ Light' : '🌙 Dark'}
           </button>
        </div>
        
        <button className="ai-nav-btn" onClick={() => aiSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          🤖 Ask AI Assistant
        </button>

        <div className="search-box">
          <input 
            type="text" 
            placeholder="ওষুধ বা হাসপাতালের নাম খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="tabs">
          <button className={category === 'bd' ? 'active' : ''} onClick={() => setCategory('bd')}>BD</button>
          <button className={category === 'ind' ? 'active' : ''} onClick={() => setCategory('ind')}>Indian</button>
          <button className={category === 'hospitals' ? 'active' : ''} onClick={() => setCategory('hospitals')}>🏥 Hospitals</button>
          <button className={category === 'favorites' ? 'active' : ''} onClick={() => setCategory('favorites')}>⭐ Saved</button>
        </div>
      </header>

      <main className="main-content">
        <div className="card-grid">
          {displayData.map((item, idx) => (
            <div key={idx} className="medicine-card" onClick={() => item.type === 'm' && setSelectedItem(item)}>
              <div className="card-header">
                <h3>{item.name}</h3>
                {item.type === 'm' && (
                  <span className={`fav-star ${favorites.find(f => f.name === item.name) ? 'active' : ''}`} 
                        onClick={(e) => toggleFavorite(e, item)}>⭐</span>
                )}
              </div>
              <p>{item.type === 'h' ? `📍 ${item.location}` : item.generic}</p>
              {item.type === 'h' ? (
                 <a href={`tel:${item.phone}`} className="voice-btn" onClick={(e) => e.stopPropagation()}>📞 Call</a>
              ) : (
                 <button className="voice-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }}>🔊 উচ্চারণ</button>
              )}
            </div>
          ))}
        </div>

        <div className="ai-container" ref={aiSectionRef}>
          <div className="ai-header">
             <h2>🤖 Medi-Assistant AI</h2>
          </div>
          <div className="iframe-wrapper">
            {isAiLoading && <div className="ai-loader"><div className="spinner"></div></div>}
            <iframe
              src="https://global-student-ai-m4rzaqcfbxis6m98fsyna9.streamlit.app/?embedded=true"
              width="100%" height="600px"
              onLoad={() => setIsAiLoading(false)}
              style={{ border: 'none', borderRadius: '15px', opacity: isAiLoading ? 0 : 1 }}
            ></iframe>
          </div>
        </div>
      </main>

      <a href="https://www.google.com/maps/search/pharmacy+near+me" target="_blank" rel="noreferrer" className="fab-btn">📍 Pharmacy</a>

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="heart-icon">❤️‍🔥</div>
            <h2>{selectedItem.name}</h2>
            <p><strong>Generic:</strong> {selectedItem.generic}</p>
            <p><strong>Company:</strong> {selectedItem.company}</p>
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
