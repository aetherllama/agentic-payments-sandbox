import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing, Simulation, Sandbox, Results } from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulation/:scenarioId" element={<Simulation />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/results/:scenarioId" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
