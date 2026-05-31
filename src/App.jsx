
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth/Auth';
import User from './components/User/User';
import Navigation from './components/Navigation/Navigation';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Auth />} />
        {/* User Dashboard route */}
        <Route path="/usuario" element={<User />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
