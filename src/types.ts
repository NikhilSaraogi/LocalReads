export type Book = {
    id: string;
    title: string;
    author: string;
    image_url: string;
    owner_id: string;
    status: 'available' | 'borrowed';
    max_borrow_duration: number; // in days
    created_at?: string;
};

export type BorrowRequest = {
    id: string;
    book_id: string;
    requester_id: string;
    status: 'pending' | 'approved' | 'rejected' | 'returned';
    duration: number;
    created_at?: string;
};
