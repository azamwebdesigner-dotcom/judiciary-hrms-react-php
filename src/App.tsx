import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdvancedDashboard from './pages/AdvancedDashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import TransferForm from './pages/TransferForm';
import AddDocuments from './pages/AddDocuments';
import EmployeeProfile from './pages/EmployeeProfile';
import Reports from './pages/Reports';
import ManageLocations from './pages/admin/ManageLocations';
import ManagePosting from './pages/admin/ManagePosting';
import ManageDesignations from './pages/admin/ManageDesignations';
import ManageQualifications from './pages/admin/ManageQualifications';
import ManageUsers from './pages/admin/ManageUsers';
import FinancialRecords from './pages/FinancialRecords';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import { MasterDataProvider } from './context/MasterDataContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout component to handle Sidebar and Header visibility
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userString = localStorage.getItem('hrms_user');
  const user = userString ? JSON.parse(userString) : null;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">District Judiciary Punjab</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Access'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <MainLayout>
            <Routes>
              <Route path="/" element={<AdvancedDashboard />} />
              <Route path="/view-employee/:id" element={<EmployeeProfile />} />

              {/* Shared Management Routes (Admin + User) */}
              <Route path="/employees" element={
                <ProtectedRoute allowedRoles={['admin', 'user']}><EmployeeList /></ProtectedRoute>
              } />
              <Route path="/add-employee" element={
                <ProtectedRoute allowedRoles={['admin', 'user']}><EmployeeForm /></ProtectedRoute>
              } />
              <Route path="/edit-employee/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'user']}><EmployeeForm /></ProtectedRoute>
              } />
              <Route path="/transfer/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'user']}><TransferForm /></ProtectedRoute>
              } />
              <Route path="/documents/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'user']}><AddDocuments /></ProtectedRoute>
              } />
              <Route path="/financial-records/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'user']}><FinancialRecords /></ProtectedRoute>
              } />

              {/* Admin Only Routes */}
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>
              } />
              <Route path="/admin/locations" element={
                <ProtectedRoute allowedRoles={['admin']}><ManageLocations /></ProtectedRoute>
              } />
              <Route path="/admin/posting" element={
                <ProtectedRoute allowedRoles={['admin']}><ManagePosting /></ProtectedRoute>
              } />
              <Route path="/admin/designations" element={
                <ProtectedRoute allowedRoles={['admin']}><ManageDesignations /></ProtectedRoute>
              } />
              <Route path="/admin/qualifications" element={
                <ProtectedRoute allowedRoles={['admin']}><ManageQualifications /></ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MasterDataProvider>
        <Router>
          <AppRoutes />
        </Router>
      </MasterDataProvider>
    </AuthProvider>
  );
};

export default App;