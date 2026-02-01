import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    onClose: () => void;
    // Optional type for different colors if needed later
}

export default function Toast({ message, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto close after 3s
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="toast-container">
            <div className="toast">
                <span>✨</span>
                {message}
            </div>
        </div>
    );
}
