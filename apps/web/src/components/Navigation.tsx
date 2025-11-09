import { Link } from 'react-router-dom';
import { UserRole } from '../App';

interface NavigationProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Navigation({ userRole, onRoleChange }: NavigationProps) {
  const navLinks = [
    {
      to: '/developer',
      label: 'Visualize',
      tooltip: '3D Repository Visualization • Interactive Code Maps • Dependency Graphs • Architecture Overview'
    },
    {
      to: '/workflows',
      label: 'Workflows',
      tooltip: 'Custom Automation • CI/CD Pipelines • Task Orchestration • Process Builder'
    },
    {
      to: '/data-analysis',
      label: 'Data Analysis',
      tooltip: 'Advanced Analytics • Custom Reports • Data Insights • Trend Analysis • Export Tools'
    }
  ];

  const roles: { id: UserRole; label: string; icon: string; tooltip: string }[] = [
    { 
      id: 'developer', 
      label: 'Developer', 
      icon: '💻',
      tooltip: 'Code Quality Metrics • Commit Activity • PR Analytics • Bug Tracking • Technical Debt'
    },
    { 
      id: 'finance', 
      label: 'Finance', 
      icon: '💰',
      tooltip: 'Cost Analysis • Budget Tracking • ROI Metrics • Resource Allocation • Expense Trends'
    },
    { 
      id: 'hr', 
      label: 'HR', 
      icon: '👥',
      tooltip: 'Team Performance • Skill Distribution • Workload Balance • Retention Metrics • Growth Tracking'
    },
    { 
      id: 'pm', 
      label: 'PM', 
      icon: '📊',
      tooltip: 'Sprint Progress • Velocity Trends • Milestone Tracking • Risk Assessment • Delivery Metrics'
    },
    { 
      id: 'devops', 
      label: 'DevOps', 
      icon: '🚀',
      tooltip: 'Deployment Frequency • Build Success Rate • System Health • Performance Metrics • Incident Tracking'
    }
  ];

  return (
    <nav className="bg-black bg-opacity-40 backdrop-blur-lg border-b border-white border-opacity-10 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
              <span className="text-xl font-bold text-white tracking-tight">BonFire</span>
            </Link>

            <div className="hidden md:flex space-x-2">
              {navLinks.map((link) => (
                <div key={link.to} className="relative group">
                  <Link 
                    to={link.to} 
                    className="text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 px-4 py-2 rounded-lg transition-all block"
                  >
                    {link.label}
                  </Link>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                    <div className="bg-black bg-opacity-95 backdrop-blur-xl border border-orange-500 border-opacity-30 rounded-lg px-4 py-3 shadow-2xl shadow-orange-500/20 min-w-[280px]">
                      <div className="text-xs font-semibold text-orange-400 mb-1.5">
                        {link.label}
                      </div>
                      <div className="text-xs text-gray-300 leading-relaxed">
                        {link.tooltip}
                      </div>
                      {/* Arrow */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-t border-l border-orange-500 border-opacity-30 rotate-45"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm mr-2">View as:</span>
            {roles.map((role) => (
              <div key={role.id} className="relative group">
                <button
                  onClick={() => onRoleChange(role.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    userRole === role.id
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                      : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20 backdrop-blur-sm'
                  }`}
                >
                  {role.icon} {role.label}
                </button>
                
                {/* Tooltip */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="bg-black bg-opacity-95 backdrop-blur-xl border border-orange-500 border-opacity-30 rounded-lg px-4 py-3 shadow-2xl shadow-orange-500/20 min-w-[280px]">
                    <div className="text-xs font-semibold text-orange-400 mb-1.5">
                      {role.icon} {role.label} Dashboard
                    </div>
                    <div className="text-xs text-gray-300 leading-relaxed">
                      {role.tooltip}
                    </div>
                    {/* Arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-t border-l border-orange-500 border-opacity-30 rotate-45"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
