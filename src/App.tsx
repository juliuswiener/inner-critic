import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Welcome } from './pages/Welcome';
import { Create } from './pages/Create';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';
import { Journal } from './pages/Journal';
import { JournalStats } from './pages/JournalStats';
import { JournalSettings } from './pages/JournalSettings';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/create" element={<Create />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/stats" element={<JournalStats />} />
          <Route path="/journal/settings" element={<JournalSettings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
