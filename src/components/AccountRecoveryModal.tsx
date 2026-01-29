import React, { useState } from 'react';
import { X, User, Lock, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';

interface AccountRecoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'userid' | 'password'; // 'userid' = Recover User ID, 'password' = Reset Password
}

const AccountRecoveryModal: React.FC<AccountRecoveryModalProps> = ({ isOpen, onClose, mode }) => {
    const [step, setStep] = useState(1);
    const [cnic, setCnic] = useState('');
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [recoveredUser, setRecoveredUser] = useState('');

    if (!isOpen) return null;

    const handleReset = () => {
        setStep(1);
        setCnic('');
        setUsername('');
        setNewPassword('');
        setError('');
        setSuccessMsg('');
        setRecoveredUser('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'userid') {
                // Recover User ID Logic
                const data = await api.recoverUserId(cnic);

                if (data.success) {
                    setRecoveredUser(data.username);
                    setStep(2); // Show Success
                } else {
                    setError(data.message || 'Verification failed.');
                }
            } else {
                // Reset Password Logic
                if (step === 1) {
                    // Verify Identity
                    const data = await api.verifyResetIdentity(username, cnic);

                    if (data.success) {
                        setStep(2); // Move to set password
                    } else {
                        setError(data.message || 'Verification failed.');
                    }
                } else if (step === 2) {
                    // Set New Password
                    const data = await api.resetPassword(username, cnic, newPassword);

                    if (data.success) {
                        setSuccessMsg('Password has been reset successfully. You can now login.');
                        setStep(3); // Final Success
                    } else {
                        setError(data.message || 'Reset failed.');
                    }
                }
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-judiciary-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            {mode === 'userid' ? <User size={24} /> : <Lock size={24} />}
                            {mode === 'userid' ? 'Recover User ID' : 'Reset Password'}
                        </h3>
                        <p className="text-judiciary-100 text-sm mt-1">
                            {mode === 'userid' ? 'Enter identity details to find your account.' : 'Verify identity to set a new password.'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* VIEW: RECOVER USER ID */}
                    {mode === 'userid' && (
                        <>
                            {step === 1 && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">CNIC Number</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g. 36302-1234567-1"
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-judiciary-500 outline-none transition-all"
                                                value={cnic}
                                                onChange={(e) => setCnic(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Format: 36302-1234567-1 (dashes optional depending on data)</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-judiciary-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-judiciary-700 transition-all flex justify-center items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Find Account <ArrowRight size={18} /></>}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-800">Account Found!</h4>
                                    <p className="text-gray-500 mb-6">Your User ID is:</p>
                                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-2xl font-mono font-bold text-judiciary-700 mb-6 tracking-wider">
                                        {recoveredUser}
                                    </div>
                                    <button onClick={handleClose} className="text-judiciary-600 font-bold hover:underline">Back to Login</button>
                                </div>
                            )}
                        </>
                    )}

                    {/* VIEW: RESET PASSWORD */}
                    {mode === 'password' && (
                        <>
                            {step === 1 && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">User ID / Username</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g. admin"
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-judiciary-500 outline-none transition-all"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">CNIC Number</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g. 36302-1234567-1"
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-judiciary-500 outline-none transition-all"
                                                value={cnic}
                                                onChange={(e) => setCnic(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-judiciary-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-judiciary-700 transition-all flex justify-center items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Verify Identity <ArrowRight size={18} /></>}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 items-start mb-2">
                                        <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs text-blue-700">Identity verified via CNIC. Please set a strong password.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-judiciary-500 outline-none transition-all"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-green-700 transition-all flex justify-center items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Reset Password <CheckCircle size={18} /></>}
                                    </button>
                                </form>
                            )}

                            {step === 3 && (
                                <div className="text-center py-6 animate-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-800">Password Changed!</h4>
                                    <p className="text-gray-500 mb-6">{successMsg}</p>
                                    <button onClick={handleClose} className="w-full bg-gray-100hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-lg transition-colors">
                                        Close
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountRecoveryModal;
