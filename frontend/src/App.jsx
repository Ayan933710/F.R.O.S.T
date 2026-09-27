import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IceNetProvider } from './context/IceNetContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLayout from './pages/AdminDashboard/AdminLayout';
import CommanderLayout from './pages/CommanderDashboard/CommanderLayout';

export default function App() {
 return (
  <ThemeProvider>
   <IceNetProvider>
    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/commander/*" element={<CommanderLayout />} />
     </Routes>
    </BrowserRouter>
   </IceNetProvider>
  </ThemeProvider>
 );
}