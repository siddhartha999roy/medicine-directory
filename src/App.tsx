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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('medi-favs');
    return saved ? JSON.parse(saved) : [];
  });

  const aiSectionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('medi-favs', JSON.stringify(favorites));
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
          return { 
            name: p[0], generic: p[1], company: p[2], indication: p[3], 
            image: p[4], uses: p[5], dosage: p[6], sideEffects: p[7], 
            price: p[8], alternatives: p[9], pharmacodynamics: p[10], 
            administration: p[11], interaction: p[12], contraindications: p[13],
            pregnancy: p[14], warnings: p[15], storage: p[16], origin: type, type: 'm' 
          };
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

  const toggleFavorite = (e, item) => {
    e.stopPropagation();
    const exists = favorites.find(f => f.name === item.name);
    if (exists) {
      setFavorites(favorites.filter(f => f.name !== item.name));
    } else {
      setFavorites([...favorites, item]);
    }
  };

  const displayData = category === 'favorites' 
    ? favorites 
    : category === 'hospitals' 
      ? hospitals.filter(h => 
          h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          h.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : medicines.filter(m => m.origin === category && 
          (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           m.generic.toLowerCase().includes(searchTerm.toLowerCase()))
        );

  const filterByLocation = (loc) => {
    setCategory('hospitals');
    setSearchTerm(loc);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* নতুন প্রফেশনাল টপ নেভিগেশন বার */}
      <header className="custom-navbar">
        <div className="nav-container">
          <div className="brand-area">
            <span className="brand-icon">🔱</span>
            <h1 className="brand-logo">MediRef BD</h1>
          </div>
          <div className="nav-actions">
            <button className="nav-icon-btn" onClick={() => aiSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} title="Ask AI">🤖</button>
            <button className="nav-icon-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <span className="lang-badge">文/A বাংলা</span>
          </div>
        </div>
      </header>

      {/* হিরো সেকশন */}
      <section className="hero-section">
        <h2 className="main-title">Medicine Directory</h2>
        <p className="sub-title">Search the clinical database by brand name, generic name, or drug class.</p>
        
        {/* মডার্ন সার্চ বার */}
        <div className="search-container-box">
          <span className="search-icon-inside">🔍</span>
          <input 
            type="text" 
            placeholder="Search medicines (e.g. Paracetamol, Napa)..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="modern-input-field"
          />
        </div>

        {/* ক্যাটাগরি ও ফিল্টার ট্যাব */}
        <div className="filter-dropdown-row">
          <div className="tabs-container">
            <button className={`tab-item ${category === 'bd' ? 'active' : ''}`} onClick={() => {setCategory('bd'); setSearchTerm('');}}>BD</button>
            <button className={`tab-item ${category === 'ind' ? 'active' : ''}`} onClick={() => {setCategory('ind'); setSearchTerm('');}}>Indian</button>
            <button className={`tab-item ${category === 'hospitals' ? 'active' : ''}`} onClick={() => {setCategory('hospitals'); setSearchTerm('');}}>🏥 Hospitals</button>
            <button className={`tab-item ${category === 'favorites' ? 'active' : ''}`} onClick={() => {setCategory('favorites'); setSearchTerm('');}}>⭐ Saved</button>
          </div>
        </div>

        {/* হাসপাতাল লোকেশন ফিল্টারসমূহ */}
        <div className="location-scroll-bar">
           <button className="loc-chip" onClick={() => filterByLocation('Dhaka')}>📍 Dhaka</button>
           <button className="loc-chip" onClick={() => filterByLocation('Chattogram')}>📍 Chattogram</button>
           <button className="loc-chip" onClick={() => filterByLocation('Noakhali')}>📍 Noakhali</button>
           <button className="loc-chip" onClick={() => filterByLocation('Sylhet')}>📍 Sylhet</button>
           <button className="loc-chip" onClick={() => filterByLocation('Rajshahi')}>📍 Rajshahi</button>
           <button className="loc-chip clear-chip" onClick={() => setSearchTerm('')}>✖ Clear</button>
        </div>
        
        <p className="university-credit">
          Made by East West University Genetic Engineering & Biotechnology Department
        </p>
      </section>

      {/* মেডিসিন ও হাসপাতাল কার্ড গ্রিড */}
      <main className="content-container">
        <div className="medicine-cards-list">
          {displayData.map((item, idx) => (
            <div key={idx} className="modern-medicine-card" onClick={() => item.type === 'm' && setSelectedItem(item)}>
              <div className="card-top-row">
                <div className="med-info-block">
                  <h3 className="med-brand-title">{item.name}</h3>
                  <p className="med-generic-subtitle">🧬 {item.generic || item.location}</p>
                </div>
                <div className="card-right-actions">
                  {item.type === 'm' && (
                    <span className={`fav-star-icon ${favorites.find(f => f.name === item.name) ? 'pinned' : ''}`} 
                          onClick={(e) => toggleFavorite(e, item)}>⭐</span>
                  )}
                  {item.uses && <span className="class-tag-badge">{item.uses.split(';')[0]}</span>}
                </div>
              </div>

              {item.indication && (
                <p className="card-indication-text">
                  <strong>Indication:</strong> {item.indication.length > 120 ? item.indication.substring(0, 120) + '...' : item.indication}
                </p>
              )}

              <div className="card-footer-actions">
                <div className="footer-left-info">
                  {item.sideEffects && <span className="footer-info-span">⚠️ Side Effects</span>}
                  <span className="footer-info-span">🔍 Click for full profile</span>
                </div>
                {item.type === 'h' ? (
                   <a href={`tel:${item.phone}`} className="action-circle-btn" onClick={(e) => e.stopPropagation()}>📞</a>
                ) : (
                   <button className="action-circle-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }} title="Pronounce">🔊</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* এআই অ্যাসিস্ট্যান্ট সেকশন */}
        <div className="ai-section-wrapper" ref={aiSectionRef}>
          <div className="ai-container-box">
            <div className="ai-box-header"><h2>🤖 Medi-Assistant AI</h2></div>
            <div className="iframe-box-inside">
              {isAiLoading && <div className="ai-spinner-layer"><div className="custom-spinner"></div></div>}
              <iframe
                src="https://global-student-ai-m4rzaqcfbxis6m98fsyna9.streamlit.app/?embedded=true"
                width="100%" height="540px"
                onLoad={() => setIsAiLoading(false)}
                className="ai-iframe-element"
                scrolling="no"
              ></iframe>
            </div>
          </div>
        </div>
      </main>

      <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="floating-map-btn">📍 Pharmacy Near Me</a>

      {/* নতুন ফুল স্ক্রিন ক্লিন ডিটেইলস ভিউ (হুবহু স্ক্রিনশট ১৮৪৯৮৩ এবং ১৮৪৯৮৪ এর মতো) */}
      {selectedItem && selectedItem.type === 'm' && (
        <div className="full-profile-overlay">
          <div className="full-profile-container">
            
            <div className="profile-top-bar">
              <button className="back-to-directory-btn" onClick={() => setSelectedItem(null)}>
                ← Back to Directory
              </button>
            </div>

            <div className="profile-header-card">
              <h1 className="profile-med-title">{selectedItem.name}</h1>
              <div className="profile-generic-row">💊 {selectedItem.generic}</div>
              {selectedItem.uses && <span className="profile-class-badge">{selectedItem.uses}</span>}
              {selectedItem.company && <p className="profile-company-name">🏢 {selectedItem.company}</p>}
              {selectedItem.price && <div className="profile-price-tag">Price: ৳ {selectedItem.price}</div>}
            </div>

            <div className="profile-details-body">
              {selectedItem.indication && (
                <div className="profile-data-block">
                  <h3 className="block-header-title">🩺 Indication</h3>
                  <p className="block-body-content">{selectedItem.indication}</p>
                </div>
              )}

              {selectedItem.pharmacodynamics && (
                <div className="profile-data-block">
                  <h3 className="block-header-title">ℹ️ Mechanism of Action</h3>
                  <p className="block-body-content">{selectedItem.pharmacodynamics}</p>
                </div>
              )}

              {selectedItem.dosage && (
                <div className="profile-data-block">
                  <h3 className="block-header-title">⚖️ Dosage & Administration</h3>
                  <p className="block-body-content">{selectedItem.dosage}</p>
                </div>
              )}

              {selectedItem.sideEffects && (
                <div className="profile-data-block">
                  <h3 className="block-header-title">⚠️ Side Effects</h3>
                  <p className="block-body-content">{selectedItem.sideEffects}</p>
                </div>
              )}

              {selectedItem.contraindications && (
                <div className="profile-data-block">
                  <h3 className="block-header-title">🚫 Contraindications</h3>
                  <p className="block-body-content">{selectedItem.contraindications}</p>
                </div>
              )}

              {selectedItem.alternatives && (
                <div className="profile-data-block alternative-brands-block">
                  <h3 className="block-header-title">🧬 Common Alternate Brands</h3>
                  <div className="alternative-chips-container">
                    {selectedItem.alternatives.split(',').map((brand, i) => (
                      <span key={i} className="alternative-item-chip">{brand.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="profile-close-footer-btn" onClick={() => setSelectedItem(null)}>Close Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
