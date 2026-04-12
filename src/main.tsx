import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Papa from 'papaparse';
import { Pill, Search, Loader2, AlertCircle, X, MapPin, Mic, Heart } from 'lucide-react';

const App = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('BD');
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('medFavs') || '[]'));

  // ডাটা লোড করার লজিক (আগের মতোই)
  useEffect(() => {
    setLoading(true);
    const file = tab === 'BD' ? '/bd-medicines.csv' : '/indian-medicines.csv';
    Papa.parse(file, {
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => { setData(r.data); setLoading(false); },
      error: () => setLoading(false)
    });
  }, [tab]);

  // ফেভারিট সেভ করার লজিক
  useEffect(() => {
    localStorage.setItem('medFavs', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFav = (m) => {
    const isFav = favorites.some(f => (f.name || f.Name) === (m.name || m.Name));
    if (isFav) setFavorites(favorites.filter(f => (f.name || f.Name) !== (m.name || m.Name)));
    else setFavorites([...favorites, m]);
  };

  // ২. ভয়েস সার্চ লজিক
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser does not support voice search");
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => setSearchTerm(event.results[0][0].transcript);
    recognition.start();
  };

  const filtered = data.filter(i => (i.name || i.Name || '').toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 50);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '15px', fontFamily: 'sans-serif' }}>
      
      {/* 🟢 ৩. ফেভারিট ফিল্টার ও ৪. ম্যাপ বাটন */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100 }}>
        <button onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me')} style={{ background: '#10b981', color: 'white', padding: '15px', borderRadius: '50px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer' }}><MapPin /></button>
        <button onClick={() => setSearchTerm(favorites.length > 0 ? favorites[0].name : '')} style={{ background: '#ec4899', color: 'white', padding: '15px', borderRadius: '50px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer' }}><Heart fill="white" size={24} /></button>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <Pill size={35} color="#2563eb" />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Medi-Directory Plus</h1>
        </div>
        
        {/* সার্চ বার ও ভয়েস সার্চ */}
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <Search style={{ position: 'absolute', left: '15px', top: '14px' }} size={20} color="#64748b" />
          <input 
            style={{ width: '100%', padding: '14px 80px 14px 45px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none', background: 'white' }}
            placeholder={tab === 'BD' ? "ওষুধের নাম..." : "Search medicine..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Mic onClick={startVoiceSearch} style={{ position: 'absolute', right: '15px', top: '14px', cursor: 'pointer', color: '#2563eb' }} size={22} />
        </div>

        {/* BD/India ট্যাব */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: tab === 'BD' ? '#2563eb' : 'white', color: tab === 'BD' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>🇧🇩 BD</button>
          <button onClick={() => setTab('India')} style={{ padding: '10px 25px', borderRadius: '10px', border: 'none', background: tab === 'India' ? '#2563eb' : 'white', color: tab === 'India' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>🇮🇳 India</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
        {loading ? <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" size={40} style={{ margin: 'auto' }} /></div> : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filtered.map((m, idx) => (
              <div key={idx} onClick={() => setSelected(m)} style={{ background: 'white', padding: '18px', borderRadius: '15px', borderLeft: '6px solid #2563eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{m.name || m.Name}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{m.generic || m.Generic}</p>
                </div>
                <Heart onClick={(e) => { e.stopPropagation(); toggleFav(m); }} fill={favorites.some(f => (f.name || f.Name) === (m.name || m.Name)) ? "#ef4444" : "none"} color="#ef4444" size={24} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ৫. আধুনিক পপ-আপ (ছবিসহ) */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '30px', width: '100%', maxWidth: '450px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' }}>
               <Pill size={70} color="#cbd5e1" />
               <p style={{ position: 'absolute', color: '#94a3b8', fontSize: '12px', bottom: '170px' }}>[Medicine Image Preview]</p>
            </div>
            <div style={{ padding: '25px' }}>
              <X onClick={() => setSelected(null)} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', background: 'white', borderRadius: '50%', padding: '5px' }} />
              <h2 style={{ margin: 0, color: '#1e293b' }}>{selected.name || selected.Name}</h2>
              <p style={{ color: '#2563eb', fontWeight: 'bold', margin: '5px 0 15px 0' }}>{selected.generic || selected.Generic}</p>
              <p style={{ fontSize: '14px' }}><strong>Company:</strong> {selected.company || selected.Company}</p>
              
              {/* ১. সেই আগের সতর্কবার্তা (Save আছে) */}
              <div style={{ background: '#fff1f2', padding: '15px', borderRadius: '15px', borderLeft: '5px solid #e11d48', marginTop: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontWeight: 'bold', marginBottom: '8px' }}>
                  <AlertCircle size={18} /> <span>সতর্কতা / Important</span>
                </div>
                {tab === 'BD' ? (
                  <p style={{ fontSize: '13px', margin: 0, color: '#881337' }}>ডাক্তারের পরামর্শ ছাড়া সেবন করবেন না। (Consult a doctor before use)</p>
                ) : (
                  <p style={{ fontSize: '13px', margin: 0, color: '#881337' }}>बिना डॉक्टर की सलाह के इसे न लें। (Do not take without advice)</p>
                )}
              </div>
              <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '20px', padding: '14px', background: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Close / বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
