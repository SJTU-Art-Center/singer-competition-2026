import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Admin from './pages/Admin';
import Screen from './pages/Screen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/screen" element={<Screen />} />
        <Route path="/" element={
          <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-8">校园歌手大赛可视化系统</h1>
            <Link to="/admin" className="px-8 py-4 text-xl font-bold bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-500 transition-all duration-300 w-64 text-center">进入后台管理端</Link>
            <Link to="/screen" className="px-8 py-4 text-xl font-bold bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-500 transition-all duration-300 w-64 text-center">进入全屏展示端</Link>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
