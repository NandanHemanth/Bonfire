import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navigation from './components/Navigation';
import DeveloperView from './components/views/DeveloperView';
import FinanceView from './components/views/FinanceView';
import HRView from './components/views/HRView';
import PMView from './components/views/PMView';
import DevOpsView from './components/views/DevOpsView';
import DataAnalyzer from './components/data/DataAnalyzer';
import CanvasWorkflowBuilder from './components/workflows/CanvasWorkflowBuilder';
import VantaBackground from './components/VantaBackground';

export type UserRole = 'developer' | 'finance' | 'hr' | 'pm' | 'devops';

function App() {
  const [userRole, setUserRole] = useState<UserRole>('developer');

  return (
    <BrowserRouter>
      <VantaBackground>
        <div className="h-screen flex flex-col text-white overflow-hidden">
          <Navigation userRole={userRole} onRoleChange={setUserRole} />

          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/developer" replace />} />
              <Route path="/developer" element={<DeveloperView />} />
              <Route path="/finance" element={<FinanceView />} />
              <Route path="/hr" element={<HRView />} />
              <Route path="/pm" element={<PMView />} />
              <Route path="/devops" element={<DevOpsView />} />
              <Route path="/data-analysis" element={<DataAnalyzer />} />
              <Route path="/workflows" element={<CanvasWorkflowBuilder />} />
            </Routes>
          </main>
        </div>
      </VantaBackground>
    </BrowserRouter>
  );
}

export default App;
