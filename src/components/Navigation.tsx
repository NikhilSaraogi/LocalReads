import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, PlusCircle } from 'lucide-react';

export default function Navigation() {
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-primary-600" />
                            <span className="font-bold text-xl text-gray-900 hidden sm:block">LocalReads</span>
                        </Link>
                    </div>

                    {user && (
                        <div className="flex items-center gap-4 sm:gap-6">
                            <Link
                                to="/add-book"
                                className="text-gray-600 hover:text-primary-600 flex items-center gap-1 font-medium transition-colors"
                            >
                                <PlusCircle className="h-5 w-5" />
                                <span className="hidden sm:inline">Add Book</span>
                            </Link>

                            <Link
                                to="/profile"
                                className="text-gray-600 hover:text-primary-600 flex items-center gap-1 font-medium transition-colors"
                            >
                                <User className="h-5 w-5" />
                                <span className="hidden sm:inline">Profile</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
