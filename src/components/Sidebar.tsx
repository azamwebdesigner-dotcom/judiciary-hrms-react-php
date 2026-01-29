import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, FileText, Scale, LogOut, Database, Map, Briefcase, GraduationCap, MapPin, UserCog, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;
  const getLinkClass = (path: string) => `nav-item ${isActive(path) ? 'active' : ''}`;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-judiciary-900 text-white shadow-xl z-50 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-judiciary-700">
        <div className="bg-white p-2 rounded-full text-judiciary-800">
          <Scale size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">Judiciary HR</h1>
          <span className="text-xs text-judiciary-100 opacity-70">
            {user?.role === 'admin' ? 'Admin Panel' : 'Operator Portal'}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-judiciary-400 uppercase tracking-wider mb-2">Main Menu</p>
          <Link to="/" className={getLinkClass('/')}>
            <LayoutDashboard size={20} /> <span>Advanced Dashboard</span>
          </Link>


          <Link to="/employees" className={getLinkClass('/employees')}>
            <Users size={20} /> <span>Employees List</span>
          </Link>

          <Link to="/add-employee" className={getLinkClass('/add-employee')}>
            <UserPlus size={20} /> <span>New Registration</span>
          </Link>
        </div>

        {/* Only Admin sees System Setup and Reports */}
        {user?.role === 'admin' && (
          <div className="mt-8 space-y-1">
            <p className="px-4 text-xs font-semibold text-judiciary-400 uppercase tracking-wider mb-2">System Setup</p>

            <Link to="/admin/locations" className={getLinkClass('/admin/locations')}>
              <Map size={20} /> <span>HQ & Tehsils</span>
            </Link>

            <Link to="/admin/posting" className={getLinkClass('/admin/posting')}>
              <MapPin size={20} /> <span>Posting Places</span>
            </Link>

            <Link to="/admin/designations" className={getLinkClass('/admin/designations')}>
              <Briefcase size={20} /> <span>Designations</span>
            </Link>

            <Link to="/admin/qualifications" className={getLinkClass('/admin/qualifications')}>
              <GraduationCap size={20} /> <span>Qualifications</span>
            </Link>

            <Link to="/admin/users" className={getLinkClass('/admin/users')}>
              <UserCog size={20} /> <span>User Management</span>
            </Link>

            <Link to="/reports" className={getLinkClass('/reports')}>
              <FileText size={20} /> <span>Reports</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-judiciary-700 space-y-2">
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="flex items-center gap-3 px-4 py-3 text-judiciary-200 hover:text-white hover:bg-judiciary-800 transition-colors rounded-lg w-full text-left"
        >
          <Lock size={20} />
          <span>Change Password</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-200 hover:text-white hover:bg-red-900/50 w-full transition-colors rounded-lg text-left"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      {user && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          userId={user.id}
        />
      )}

      <style>{`
        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 8px;
            color: #dcfce7;
            transition: all 0.2s;
            text-decoration: none;
        }
        .nav-item:hover {
            background-color: #166534;
            color: white;
        }
        .nav-item.active {
            background-color: #16a34a;
            color: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;