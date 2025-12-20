import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Fornecedores from './pages/Fornecedores';
import ContasPagar from './pages/ContasPagar';
import Pagamentos from './pages/Pagamentos';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            <h1>TSYS Financeiro</h1>
          </div>
          <div className="navbar-menu">
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
            <Link to="/fornecedores" className="nav-link">
              Fornecedores
            </Link>
            <Link to="/contas-pagar" className="nav-link">
              Contas a Pagar
            </Link>
            <Link to="/pagamentos" className="nav-link">
              Pagamentos
            </Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/contas-pagar" element={<ContasPagar />} />
            <Route path="/pagamentos" element={<Pagamentos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;



