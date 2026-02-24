import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { BookOpen, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        if (error) {
            setError(error.message);
        } else {
            setMessage('Password reset instructions sent to your email.');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen bg-primary-50">
            <div className="m-auto w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-primary-100">
                <div className="text-center mb-8">
                    <BookOpen className="mx-auto h-12 w-12 text-primary-600 mb-2" />
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-sm text-gray-500 mt-2">Enter your email to receive reset instructions</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 p-4 rounded-md flex items-start gap-3 border border-red-200">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="mb-4 bg-green-50 p-4 rounded-md border border-green-200">
                        <p className="text-sm text-green-700">{message}</p>
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
