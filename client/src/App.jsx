import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Home from './pages/Home'
import Room from './pages/Room'
import AmbientBackground from './components/AmbientBackground'

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AmbientBackground />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </motion.div>
    </div>
  )
}

export default App 