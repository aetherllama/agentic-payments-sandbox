import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing, Simulation, Playground, Results } from './pages'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulation/:scenarioId" element={<Simulation />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/results/:scenarioId" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
