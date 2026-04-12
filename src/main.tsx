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
  const [isListening, setIsListening] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // LocalStorage থেকে ফেভারিট লিস্ট লোড করা
  useEffect(() => {
    const saved = localStorage.getItem('med_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setLoading(true);
    const file = tab === 'BD' ? '/bd-medicines.csv' : '/indian-medicines.csv';
    Papa.parse(file, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setLoading(false);
      },
      error: () => setLoading(false)
    });
  }, [tab]);

  const toggleFavorite = (e: React.MouseEvent, medName: string) => {
    e.stopPropagation();
    const newFavs = favorites.includes(medName) 
      ? favorites.filter(f => f !== medName) 
      : [...favorites, medName];
    setFavorites(newFavs);
    localStorage.setItem('med_favorites', JSON.stringify(newFavs));
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("ব্রাউজার ভয়েস সাপোর্ট করে না।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = tab === 'BD' ? 'bn-BD' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setSearchTerm(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const filteredData = data.filter(item => 
    (item.name || item.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '15px', fontFamily: 'sans-serif' }}>
      
      {/* 🟢 Pharmacy Finder */}
      <div onClick={() => window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank')}
        style={{ position: 'fixed', bottom: '30px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '14px 22px', borderRadius: '50px', zIndex: 100, cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
        <MapPin size={22} />
        <span>Pharmacy Near Me</span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <Pill size={35} color="#2563eb" />
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Medi-Directory</h1>
        </div>
        
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto', display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} color="#64748b" style={{ position: 'absolute', left: '15px', top: '15px' }} />
            <input style={{ width: '100%', padding: '14px 20px 14px 45px', borderRadius: '15px', border: '2px solid #e2e8f0', fontSize: '16px', outline: 'none' }}
              placeholder="ওষুধ খুঁজুন..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={handleVoiceSearch} style={{ padding: '0 15px', borderRadius: '15px', border: 'none', background: isListening ? '#ef4444' : '#2563eb', color: 'white', cursor: 'pointer' }}>
            <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
          </button>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={() => setTab('BD')} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: tab === 'BD' ? '#2563eb' : 'white', color: tab === 'BD' ? 'white' : '#64748b', fontWeight: 'bold' }}>🇧🇩 BD</button>
          <button onClick={() => setTab('India')} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: tab === 'India' ? '#2563eb' : 'white', color: tab === 'India' ? 'white' : '#64748b', fontWeight: 'bold' }}>🇮🇳 India</button>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} color="#2563eb" /></div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredData.map((m, idx) => (
              <div key={idx} onClick={() => setSelected(m)} style={{ background: 'white', padding: '18px', borderRadius: '15px', borderLeft: '6px solid #2563eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{m.name || m.Name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{m.generic || m.Generic}</p>
                <Heart onClick={(e) => toggleFavorite(e, m.name || m.Name)} size={22} style={{ position: 'absolute', right: '20px', top: '25px', color: favorites.includes(m.name || m.Name) ? '#ef4444' : '#cbd5e1', fill: favorites.includes(m.name || m.Name) ? '#ef4444' : 'none' }} />
              </div>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '100%', maxWidth: '450px', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
            <X onClick={() => setSelected(null)} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} />
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {(selected.image || selected.Image) ? (
                <img src={selected.image || selected.Image} alt="Medicine" style={{ width: '150px', height: '150px', objectFit: 'contain' }} />
              ) : (
                <Pill size={80} color="#cbd5e1" style={{ margin: '0 auto' }} />
              )}
            </div>

            <h2 style={{ textAlign: 'center' }}>{selected.name || selected.Name}</h2>
            <div style={{ margin: '15px 0', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
              <p><strong>Generic:</strong> {selected.generic || selected.Generic}</p>
              <p><strong>Company:</strong> {selected.company || selected.Company}</p>
            </div>

            <div style={{ padding: '15px', background: '#fff1f2', borderRadius: '12px', borderLeft: '4px solid #e11d48' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontWeight: 'bold' }}>
                <AlertCircle size={18} />
                <span>সতর্কতা / Warning</span>
              </div>
              <p style={{ fontSize: '13px', marginTop: '10px' }}>{tab === 'BD' ? "ডাক্তারের পরামর্শ ছাড়া সেবন করবেন না।" : "Consult a doctor before use."}</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ width: '100%', marginTop: '20px', padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
