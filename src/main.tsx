import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// সরাসরি এখানে একটি ছোট মেসেজ দেখাবে যাতে বুঝতে পারি সাইট কাজ করছে
const App = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    <h1>Medi-Directory is Loading...</h1>
    <p>Siddhartha, your site is almost ready!</p>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
