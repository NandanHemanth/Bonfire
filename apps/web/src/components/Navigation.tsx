import { Link } from 'react-router-dom';
import { UserRole } from '../App';

interface NavigationProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function Navigation({ userRole, onRoleChange }: NavigationProps) {
  const roles: { id: UserRole; label: string; icon: string }[] = [
    { id: 'developer', label: 'Developer', icon: '💻' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'hr', label: 'HR', icon: '👥' },
    { id: 'pm', label: 'PM', icon: '📊' },
    { id: 'devops', label: 'DevOps', icon: '🚀' }
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
              <Link 
                to="/developer" 
                className="text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 px-4 py-2 rounded-lg transition-all"
              >
                Visualize
              </Link>
              <Link 
                to="/workflows" 
                className="text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 px-4 py-2 rounded-lg transition-all"
              >
                Workflows
              </Link>
              <Link 
                to="/data-analysis" 
                className="text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 px-4 py-2 rounded-lg transition-all"
              >
                Data Analysis
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm mr-2">View as:</span>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  userRole === role.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20 backdrop-blur-sm'
                }`}
              >
                {role.icon} {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
