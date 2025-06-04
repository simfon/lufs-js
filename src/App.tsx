import LufsAnalyzer from './components/LufsAnalyzer.js'
import './App.css'
function App() {
  return (
    <div className="app">
{/*       <header className="app-header">
        <h3>LUFS-JS Audio Analyzer</h3>
      </header> */}
      <main className="app-main">
        <LufsAnalyzer />
      </main>
      <footer className="app-footer">
        <p className="footer-text">
          Made with 🍻 and <a href="https://vite.dev/" target="_blank">Vite</a> by Simone Fontana - sim.fontana@gmail.com
        </p>
      </footer>
    </div>
  )
}

export default App
