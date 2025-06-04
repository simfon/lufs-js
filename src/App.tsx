import LufsAnalyzer from './components/LufsAnalyzer.js'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>LUFS Audio Analyzer</h1>
        <p>Professional loudness measurement for audio devices</p>
      </header>
      <main className="app-main">
        <LufsAnalyzer />
      </main>
    </div>
  )
}

export default App
