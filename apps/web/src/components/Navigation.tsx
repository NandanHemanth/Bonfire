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
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-bold text-white">BonFire</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link to="/developer" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                Visualize
              </Link>
              <Link to="/data-analysis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
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
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  userRole === role.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
