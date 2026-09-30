import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Logon from './pages/Logon/index.jsx'
import NewIncident from './pages/NewIncident/index.jsx'
import Profile from './pages/Profile/index.jsx'
import Register from './pages/Register/index.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Logon />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/incidents/new" element={<NewIncident />} />
      </Routes>
    </BrowserRouter>
  )
}
