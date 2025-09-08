import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
    const { user } = useAuth();

    return ( 
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={user ? <HomePage/> : <Navigate to="/login" replace/>}></Route>
                    <Route path="/login" element={<Login/>} />
                    <Route path="/register" element={<Register/> } />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;