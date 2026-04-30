import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Create from './pages/Create';
import Home from './pages/Home';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/generate" element={<Navigate to="/" replace />} />
        <Route path="/trending-sounds" element={<Navigate to="/" replace />} />
        <Route path="/gear-kits" element={<Navigate to="/" replace />} />
        <Route path="/products" element={<Navigate to="/" replace />} />
        <Route path="/creator-setups" element={<Navigate to="/" replace />} />
        <Route path="/creator-setups/:slug" element={<Navigate to="/" replace />} />
        <Route path="/articles" element={<Navigate to="/" replace />} />
        <Route path="/articles/:slug" element={<Navigate to="/" replace />} />
        <Route path="/admin/content-engine" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
