import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';
import { User } from '../types';

interface VerifyEmailPageProps {
    onNavigate: (page: any) => void;
    onLoginSuccess: (user: User) => void;
}

export function VerifyEmailPage({ onNavigate, onLoginSuccess }: VerifyEmailPageProps) {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        const verifyEmail = async () => {
            // Get token from URL query params
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. Missing token.');
                return;
            }

            try {
                const response = await authAPI.verifyEmail(token);
                if (response.success && response.data) {
                    setStatus('success');
                    setMessage('Email verified successfully! You are now logged in.');

                    // Auto-login logic
                    setAuthToken(response.data.token);
                    if (onLoginSuccess) {
                        // Construct user object safely
                        const userData = response.data.user;
                        onLoginSuccess({
                            id: userData._id || userData.id,
                            name: userData.name,
                            email: userData.email,
                            type: userData.userType as 'student' | 'landlord',
                            isVerified: true
                        });
                    }

                    // Redirect after short delay
                    setTimeout(() => {
                        const userType = response.data.user.userType;
                        if (userType === 'student') onNavigate('student-dashboard');
                        else if (userType === 'landlord') onNavigate('landlord-dashboard');
                        else onNavigate('home');
                    }, 2000);

                } else {
                    setStatus('error');
                    setMessage(response.message || 'Verification failed. Token may be invalid or expired.');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'Verification failed. Please try again.');
            }
        };

        verifyEmail();
    }, [onNavigate, onLoginSuccess]);

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
                        <p className="text-gray-600">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="w-full bg-[#3E2723] text-white py-3 rounded-xl font-medium hover:bg-[#2D1B18] transition-colors flex items-center justify-center gap-2"
                        >
                            Continue to Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <button
                            onClick={() => onNavigate('home')}
                            className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
