import React, { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
            setTimeout(() => setVisible(true), 10);
        } else {
            setVisible(false);
            setTimeout(() => setRender(false), 300);
        }
    }, [isOpen]);

    if (!render) return null;

    return (
        <div
            className="modal-overlay"
            style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: visible ? 'auto' : 'none'
            }}
            onClick={onClose}
        >
            <div
                className="modal-content"
                style={{
                    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                    opacity: visible ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontWeight: 500, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{title}</h3>
                    <button onClick={onClose} className="btn-ghost" style={{ padding: '4px', lineHeight: 1 }}>✕</button>
                </div>

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {children}
                </div>

                {footer && (
                    <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
