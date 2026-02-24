import React from 'react';
import type { Book as BookType } from '../types';
import { Clock, User } from 'lucide-react';

interface BookCardProps {
    book: BookType & { owner?: { full_name?: string, email: string } };
    onRequest?: (book: BookType) => void;
    actionText?: string;
    showStatus?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onRequest, actionText = "Request to Borrow", showStatus = false }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="h-48 w-full bg-gray-100 overflow-hidden relative">
                <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                />
                {showStatus && (
                    <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {book.status === 'available' ? 'Available' : 'Borrowed'}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-4">by {book.author}</p>

                <div className="mt-auto space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2 text-primary-600 bg-primary-50 w-fit px-2 py-1 rounded-md">
                        <Clock className="w-4 h-4" />
                        <span>Max duration: {book.max_borrow_duration} days</span>
                    </div>

                    {book.owner && (
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="truncate">Owner: {book.owner.full_name || book.owner.email.split('@')[0]}</span>
                        </div>
                    )}
                </div>
            </div>

            {onRequest && (
                <div className="px-4 pb-4 pt-2">
                    <button
                        onClick={() => onRequest(book)}
                        disabled={book.status !== 'available'}
                        className="w-full bg-primary-600 text-white py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {book.status === 'available' ? actionText : 'Currently Unavailable'}
                    </button>
                </div>
            )}
        </div>
    );
};
