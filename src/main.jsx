import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { demarrerStatistiques } from './firebase'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Statistiques Firebase : après l'affichage, quand le navigateur est libre.
demarrerStatistiques()
