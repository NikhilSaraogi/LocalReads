import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BookCard } from '../components/BookCard';
import { User, BookOpen, Clock, AlertCircle, Loader2, Inbox, CheckCircle, XCircle } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'owned' | 'borrowed' | 'requests' | 'incoming'>('owned');

    const [ownedBooks, setOwnedBooks] = useState<any[]>([]);
    const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Owned Books
            const { data: ownedData } = await supabase
                .from('books')
                .select('*')
                .eq('owner_id', user?.id)
                .order('created_at', { ascending: false });

            if (ownedData) setOwnedBooks(ownedData);

            // 2. Fetch Active Borrowed Books (where I am the requester and status is approved)
            const { data: borrowedData } = await supabase
                .from('borrow_requests')
                .select(`
                  id,
                  status,
                  duration,
                  book:book_id (*)
                `)
                .eq('requester_id', user?.id)
                .eq('status', 'approved');

            if (borrowedData) {
                // Map the data to just list the books with some extra borrow info
                const formattedBorrowed = borrowedData.map((req: any) => ({
                    ...req.book,
                    borrow_details: { id: req.id, duration: req.duration, status: req.status }
                }));
                setBorrowedBooks(formattedBorrowed);
            }

            // 3. Fetch Pending Requests (Books I asked for that aren't approved yet)
            const { data: requestsData } = await supabase
                .from('borrow_requests')
                .select(`
                  id,
                  status,
                  duration,
                  book:book_id (*)
                `)
                .eq('requester_id', user?.id)
                .in('status', ['pending', 'rejected']);

            if (requestsData) {
                setMyRequests(requestsData);
            }

            // 4. Fetch Incoming Requests (Other people asking for my books)
            const { data: incomingData, error: incomingError } = await supabase
                .from('borrow_requests')
                .select(`
                  id,
                  status,
                  duration,
                  requester:profiles ( email, full_name ),
                  book:books!inner ( id, title, image_url, owner_id )
                `)
                .eq('books.owner_id', user?.id)
                .eq('status', 'pending');

            if (incomingData) {
                setIncomingRequests(incomingData);
            } else if (incomingError) {
                console.error("Error fetching incoming requests:", incomingError);
            }

        } catch (err) {
            console.error('Error fetching profile data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAction = async (requestId: string, newStatus: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('borrow_requests')
                .update({ status: newStatus })
                .eq('id', requestId);

            if (error) throw error;

            // Remove from the local list since it's no longer 'pending'
            setIncomingRequests(incomingRequests.filter(req => req.id !== requestId));

            // Refetch data to update the Owned Library statuses (available -> borrowed)
            fetchProfileData();

        } catch (err: any) {
            alert('Error updating request: ' + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex items-center gap-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                    <User className="w-10 h-10" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.user_metadata?.full_name || 'Book Lover'}</h1>
                    <p className="text-gray-500">{user?.email}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('owned')}
                    className={`whitespace-nowrap py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'owned'
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    My Library ({ownedBooks.length})
                </button>
                <button
                    onClick={() => setActiveTab('borrowed')}
                    className={`whitespace-nowrap py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'borrowed'
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    Currently Borrowing ({borrowedBooks.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`whitespace-nowrap py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'requests'
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    Sent Requests ({myRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('incoming')}
                    className={`whitespace-nowrap py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'incoming'
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    Incoming Requests ({incomingRequests.length})
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
            ) : (
                <div className="mt-6">

                    {/* OWNED TAB */}
                    {activeTab === 'owned' && (
                        <div>
                            {ownedBooks.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {ownedBooks.map((book) => (
                                        <BookCard key={book.id} book={book} showStatus={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center">
                                    <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">Your library is empty</h3>
                                    <p className="text-gray-500 mt-1 max-w-sm">You haven't added any books to share with the community yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* BORROWED TAB */}
                    {activeTab === 'borrowed' && (
                        <div>
                            {borrowedBooks.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {borrowedBooks.map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center">
                                    <Clock className="w-12 h-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">You aren't borrowing any books</h3>
                                    <p className="text-gray-500 mt-1">Explore the home feed to find books you'd like to read.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SENT REQUESTS TAB */}
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {myRequests.length > 0 ? (
                                myRequests.map((req) => (
                                    <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img src={req.book?.image_url} alt={req.book?.title} className="w-12 h-16 object-cover rounded" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{req.book?.title}</h4>
                                                <p className="text-sm text-gray-500">Requested for {req.duration} days</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {req.status === 'pending' ? 'Pending Approval' : 'Declined'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No sent requests</h3>
                                    <p className="text-gray-500 mt-1">You haven't sent any borrow requests recently.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* INCOMING REQUESTS TAB */}
                    {activeTab === 'incoming' && (
                        <div className="space-y-4">
                            {incomingRequests.length > 0 ? (
                                incomingRequests.map((req) => (
                                    <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={req.book?.image_url} alt={req.book?.title} className="w-12 h-16 object-cover rounded" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Someone wants your book!</h4>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">{req.requester?.full_name || req.requester?.email}</span> wants to borrow <strong>{req.book?.title}</strong> for <strong>{req.duration} days</strong>.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex w-full sm:w-auto gap-2">
                                            <button
                                                onClick={() => handleRequestAction(req.id, 'rejected')}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                                            >
                                                <XCircle className="w-4 h-4" /> Decline
                                            </button>
                                            <button
                                                onClick={() => handleRequestAction(req.id, 'approved')}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center">
                                    <Inbox className="w-12 h-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No incoming requests</h3>
                                    <p className="text-gray-500 mt-1 whitespace-pre-wrap">Nobody has requested to borrow your books yet.\nWhen they do, you'll see them here so you can approve or decline them.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
