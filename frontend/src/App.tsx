import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import InstancesPage from './pages/InstancesPage';
import ApiKeysPage from './pages/ApiKeysPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/instances" replace />} />
          <Route path="instances" element={<InstancesPage />} />
          <Route path="chats" element={<ChatPage />} />
          <Route path="apikeys" element={<ApiKeysPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
