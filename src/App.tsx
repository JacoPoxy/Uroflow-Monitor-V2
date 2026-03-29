import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LogEntry from './pages/LogEntry'
import History from './pages/History'
import Reports from './pages/Reports'
import { LayoutDashboard, PlusCircle, History as HistoryIcon, BarChart2 } from 'lucide-react'

export default function App() {
  return (
    <div className="app">
      <nav className="sidebar">
        <div className="logo">Uroflow Tracker</div>
        <NavLink to="/"><LayoutDashboard size={18}/> Dashboard</NavLink>
        <NavLink to="/log"><PlusCircle size={18}/> Log Entry</NavLink>
        <NavLink to="/history"><HistoryIcon size={18}/> History</NavLink>
        <NavLink to="/reports"><BarChart2 size={18}/> Reports</NavLink>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogEntry />} />
          <Route path="/history" element={<History />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  )
}