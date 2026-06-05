import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

function App() {
  const [medicines, setMedicines] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]); // নতুন স্টেট
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
        // নতুন pharmacies.json ডেটা একসাথে ফেচ করা হচ্ছে
        const [bdT, indT, hospT, pharmRes] = await Promise.all([
          fetch('/bd-medicines.csv').then(res => res.text()),
          fetch('/indian-medicines.csv').then(res => res.text()),
          fetch('/hospitals.csv').then(res => res.text()),
          fetch('/src/data/pharmacies.json').then(res => res.json()) // JSON লোড
        ]);
        
        const parseMedicines = (text, type) => text.split('\n').filter(l => l.trim()).slice(1).map(line => {
          const p = line.split(',');
          return { 
            name: p[0], generic: p[1], company: p[2], indication: p[3], 
            image: p[4], uses: p[5], dosage: p[6], sideEffects: p[7], 
            price: p[8], alternatives: p[9], pharmacodynamics: p[10], 
            administration: p[11], interaction: p[12], contraindications: p[13],
            pregnancy: p[14], warnings: p[15], storage: p[16], origin: type, type: 'm' 
          };
        });

        const parseHospitals = (text) => text.split('\n').filter(l => l.trim()).slice(1).map(line => {
          const p = line.split(',');
          return { 
            name: p[0], location: p[1], phone: p[2], 
            image: p[3] || '', facilities: p[4] || '', doctors: p[5] || '', 
            type: 'h' 
          };
        });

        setMedicines([...parseMedicines(bdT, 'bd'), ...parseMedicines(indT, 'ind')]);
        setHospitals(parseHospitals(hospT));
        setPharmacies(pharmRes); // স্টেট সেট করা হলো
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

  // ডিসপ্লে ডেটা ফিল্টারিং লজিক আপডেট
  const displayData = category === 'favorites' 
    ? favorites 
    : category === 'hospitals' 
      ? hospitals.filter(h => 
          h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          h.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : category === 'pharmacies'
        ? pharmacies.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.location.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : medicines.filter(m => m.origin === category && 
            (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             m.generic.toLowerCase().includes(searchTerm.toLowerCase()))
          );

  // লোকেশন ফিল্টার এবার ফার্মেসিতেও কাজ করবে
  const filterByLocation = (loc) => {
    if (category !== 'hospitals' && category !== 'pharmacies') {
      setCategory('hospitals');
    }
    setSearchTerm(loc);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* টপ নেভিগেশন বার */}
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
        <h2 className="main-title">Medicine & Hospital Directory</h2>
        <p className="sub-title">Search the clinical database by brand name, generic name, hospital, or pharmacy details.</p>
        
        {/* সার্চ বার */}
        <div className="search-container-box">
          <span className="search-icon-inside">🔍</span>
          <input 
            type="text" 
            placeholder={
              category === 'hospitals' ? "Search hospitals..." : 
              category === 'pharmacies' ? "Search pharmacies by name or area..." : 
              "Search medicines (e.g. Paracetamol, Napa)..."
            }
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="modern-input-field"
          />
        </div>

        {/* ফিল্টার ট্যাব (এখানে নতুন Pharmacies ট্যাব যুক্ত করা হয়েছে) */}
        <div className="filter-dropdown-row">
          <div className="tabs-container">
            <button className={`tab-item ${category === 'bd' ? 'active' : ''}`} onClick={() => {setCategory('bd'); setSearchTerm('');}}>BD</button>
            <button className={`tab-item ${category === 'ind' ? 'active' : ''}`} onClick={() => {setCategory('ind'); setSearchTerm('');}}>Indian</button>
            <button className={`tab-item ${category === 'hospitals' ? 'active' : ''}`} onClick={() => {setCategory('hospitals'); setSearchTerm('');}}>🏥 Hospitals</button>
            <button className={`tab-item ${category === 'pharmacies' ? 'active' : ''}`} onClick={() => {setCategory('pharmacies'); setSearchTerm('');}}>🏪 Pharmacies</button>
            <button className={`tab-item ${category === 'favorites' ? 'active' : ''}`} onClick={() => {setCategory('favorites'); setSearchTerm('');}}>⭐ Saved</button>
          </div>
        </div>

        {/* লোকেশন ফিল্টার */}
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

      {/* মডার্ন কার্ড গ্রিড */}
      <main className="content-container">
        <div className="medicine-cards-list">
          {displayData.map((item, idx) => (
            <div key={idx} className="modern-medicine-card" onClick={() => setSelectedItem(item)}>
              <div className="card-top-row">
                <div className="med-info-block">
                  <h3 className="med-brand-title">{item.name}</h3>
                  <p className="med-generic-subtitle">
                    {item.type === 'h' ? `📍 ${item.location}` : item.type === 'p' ? `📍 ${item.location}` : `🧬 ${item.generic}`}
                  </p>
                </div>
                <div className="card-right-actions">
                  {item.type === 'm' && (
                    <span className={`fav-star-icon ${favorites.find(f => f.name === item.name) ? 'pinned' : ''}`} 
                          onClick={(e) => toggleFavorite(e, item)}>⭐</span>
                  )}
                  {item.type === 'm' && item.uses && <span className="class-tag-badge">{item.uses.split(';')[0]}</span>}
                  {item.type === 'h' && <span className="class-tag-badge" style={{background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe'}}>Hospital</span>}
                  {item.type === 'p' && <span className="class-tag-badge" style={{background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0'}}>Pharmacy</span>}
                </div>
              </div>

              {item.type === 'm' && item.indication && (
                <p className="card-indication-text">
                  <strong>Indication:</strong> {item.indication.length > 120 ? item.indication.substring(0, 120) + '...' : item.indication}
                </p>
              )}

              {item.type === 'p' && (
                <p className="card-indication-text">
                  <strong>Address:</strong> {item.address}<br />
                  <strong style={{color: '#16a34a'}}>Status:</strong> {item.status}
                </p>
              )}

              <div className="card-footer-actions">
                <div className="footer-left-info">
                  <span className="footer-info-span">🔍 Click for full profile</span>
                </div>
                {item.type === 'h' || item.type === 'p' ? (
                   <a href={`tel:${item.phone}`} className="action-circle-btn" onClick={(e) => e.stopPropagation()} title="Call Now">📞</a>
                ) : (
                   <button className="action-circle-btn" onClick={(e) => { e.stopPropagation(); speak(item.name); }} title="Pronounce">🔊</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* এআই অ্যাসিস্ট্যান্ট */}
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

      {/* ডায়নামিক ফুল প্রোফাইল ভিউ (মেডিসিন, হাসপাতাল ও নতুন ফার্মেসি লেআউট) */}
      {selectedItem && (
        <div className="full-profile-overlay">
          <div className="full-profile-container">
            
            <div className="profile-top-bar">
              <button className="back-to-directory-btn" onClick={() => setSelectedItem(null)}>
                ← Back to Directory
              </button>
            </div>

            {/* ১. মেডিসিন প্রোফাইল */}
            {selectedItem.type === 'm' && (
              <>
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
                  {selectedItem.dosage && (
                    <div className="profile-data-block">
                      <h3 className="block-header-title">⚖️ Dosage</h3>
                      <p className="block-body-content">{selectedItem.dosage}</p>
                    </div>
                  )}
                  {selectedItem.sideEffects && (
                    <div className="profile-data-block">
                      <h3 className="block-header-title">⚠️ Side Effects</h3>
                      <p className="block-body-content">{selectedItem.sideEffects}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ২. হাসপাতাল প্রোফাইল */}
            {selectedItem.type === 'h' && (
              <>
                <div className="profile-header-card" style={{ background: '#f0f6ff', borderColor: '#bfdbfe' }}>
                  <h1 className="profile-med-title" style={{ color: '#1e3a8a' }}>🏥 {selectedItem.name}</h1>
                  <div className="profile-generic-row" style={{ color: '#2563eb' }}>📍 {selectedItem.location}</div>
                  <div className="profile-price-tag" style={{ color: '#1e293b', marginTop: '5px' }}>
                    📞 Emergency: <a href={`tel:${selectedItem.phone}`}>{selectedItem.phone}</a>
                  </div>
                </div>
                <div className="profile-details-body">
                  {selectedItem.facilities && (
                    <div className="profile-data-block">
                      <h3 className="block-header-title" style={{ color: '#2563eb' }}>⚡ Facilities</h3>
                      <p className="block-body-content">{selectedItem.facilities}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ৩. নতুন ফার্মেসি প্রোফাইল ভিউ (Map Link সহ) */}
            {selectedItem.type === 'p' && (
              <>
                <div className="profile-header-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <h1 className="profile-med-title" style={{ color: '#16a34a' }}>🏪 {selectedItem.name}</h1>
                  <div className="profile-generic-row" style={{ color: '#16a34a' }}>📍 {selectedItem.location}</div>
                  <div className="profile-price-tag" style={{ color: '#1e293b', marginTop: '5px' }}>
                    📞 Contact: <a href={`tel:${selectedItem.phone}`} style={{color: '#16a34a', textDecoration: 'none'}}>{selectedItem.phone}</a>
                  </div>
                </div>

                <div className="profile-details-body">
                  <div className="profile-data-block">
                    <h3 className="block-header-title" style={{ color: '#16a34a', borderColor: '#bbf7d0' }}>📌 Full Address</h3>
                    <p className="block-body-content" style={{fontSize: '15px'}}>{selectedItem.address}</p>
                  </div>

                  <div className="profile-data-block">
                    <h3 className="block-header-title" style={{ color: '#16a34a', borderColor: '#bbf7d0' }}>⏰ Operational Status</h3>
                    <p className="block-body-content" style={{fontWeight: 'bold', color: '#15803d'}}>{selectedItem.status}</p>
                  </div>

                  {/* ম্যাপ লিংক বাটন */}
                  {selectedItem.map_link && (
                    <div style={{ textAlign: 'center', marginTop: '25px' }}>
                      <a 
                        href={selectedItem.map_link} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{
                          display: 'inline-block',
                          background: '#16a34a',
                          color: '#ffffff',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                      >
                        🌐 View on Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}

            <button className="profile-close-footer-btn" onClick={() => setSelectedItem(null)}>Close Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
/* বাটনগুলোর মেইন কন্টেইনার বা রো এর জন্য */
.tabs-container {
  display: flex;
  overflow-x: auto; /* মোবাইলে ডানে-বামে স্ক্রল করার জন্য */
  white-space: nowrap;
  gap: 8px; /* বাটনগুলোর ভেতরের দূরত্ব */
  padding: 5px 10px;
  scrollbar-width: none; /* ফায়ারফক্সের স্ক্রলবার হাইড করার জন্য */
}

/* ক্রোম বা সাফারিতে নিচের স্ক্রলবারটি সুন্দর/হাইড রাখার জন্য */
.tabs-container::-webkit-scrollbar {
  display: none;
}

/* বাটনগুলোর সাইজ ঠিক রাখা যাতে চেপে ছোট না হয়ে যায় */
.tab-item {
  flex-shrink: 0;
}
