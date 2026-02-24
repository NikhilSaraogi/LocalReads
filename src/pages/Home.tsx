import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookCard } from '../components/BookCard';

import { useAuth } from '../context/AuthContext';
import { Loader2, Search } from 'lucide-react';

export default function Home() {
    const { user } = useAuth();
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // State for request modal
    const [requestBook, setRequestBook] = useState<any | null>(null);
    const [requestDuration, setRequestDuration] = useState<number>(7);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            // Assuming a join with auth.users is possible if explicitly granted, 
            // or we just fetch the books and rely on a profiles table.
            // For simplicity, we just fetch books for now.
            const { data, error } = await supabase
                .from('books')
                .select(`
                  *,
                  owner:profiles ( email, full_name )
                `)
                .neq('owner_id', user?.id || '') // Don't show own books in feed
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBooks(data || []);
        } catch (err) {
            console.error('Error fetching books:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestClick = (book: any) => {
        setRequestBook(book);
        setRequestDuration(Math.min(7, book.max_borrow_duration));
    };

    const submitRequest = async () => {
        if (!requestBook || !user) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from('borrow_requests').insert({
                book_id: requestBook.id,
                requester_id: user.id,
                status: 'pending',
                duration: requestDuration
            });

            if (error) throw error;

            alert('Request sent successfully! The owner will be notified.');
            setRequestBook(null);
        } catch (err: any) {
            alert('Error sending request: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Local Book Exchange</h1>
                    <p className="text-gray-600 mt-1">Discover and borrow books from people in your area.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Search titles or authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
            ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            onRequest={handleRequestClick}
                            showStatus={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg border border-gray-200 border-dashed">
                    <h3 className="text-lg font-medium text-gray-900">No books found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search or check back later for new additions.</p>
                </div>
            )}

            {/* Request Modal */}
            {requestBook && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Request to Borrow</h2>

                        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-md border border-gray-100">
                            <img src={requestBook.image_url} alt={requestBook.title} className="w-16 h-20 object-cover rounded" />
                            <div>
                                <p className="font-semibold text-gray-900">{requestBook.title}</p>
                                <p className="text-sm text-gray-600">by {requestBook.author}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                How many days do you need it? (Max: {requestBook.max_borrow_duration})
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={requestBook.max_borrow_duration}
                                value={requestDuration}
                                onChange={(e) => setRequestDuration(parseInt(e.target.value) || 1)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setRequestBook(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRequest}
                                disabled={submitting}
                                className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
                            >
                                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
