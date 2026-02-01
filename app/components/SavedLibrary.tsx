"use client";

import React, { useEffect, useState } from 'react';
import { getPrompts, SavedPrompt, removePrompt } from '@/lib/storage';
import Toast from './Toast';
import Modal from './Modal';

export default function SavedLibrary() {
    const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setPrompts(getPrompts());
        }
    }, [isOpen]);

    const confirmDelete = () => {
        if (deleteId) {
            removePrompt(deleteId);
            setPrompts(getPrompts());
            setToastMsg('Prompt deleted.');
            setDeleteId(null);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const handleCopy = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setToastMsg('Copied to clipboard!');
    };

    const allTags = Array.from(new Set(prompts.flatMap(p => p.tags || []))).sort();

    const filtered = prompts.filter(p => {
        const matchesSearch = p.text.toLowerCase().includes(search.toLowerCase());
        const matchesTag = activeTag ? p.tags?.includes(activeTag) : true;
        return matchesSearch && matchesTag;
    });

    if (!isOpen) {
        return (
            <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.6 }}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn-ghost"
                    style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                >
                    <span>📚</span> View Saved Library ({prompts.length || '...'})
                </button>
            </div>
        );
    }

    return (
        <div className="glass-panel animate-fade-in" style={{ marginTop: '40px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Prompt?"
                footer={
                    <>
                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                        <button
                            className="btn-primary"
                            style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none' }}
                            onClick={confirmDelete}
                        >
                            Delete
                        </button>
                    </>
                }
            >
                Are you sure you want to remove this prompt from your library?
            </Modal>

            <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>Prompt Library</h3>
                    <button onClick={() => setIsOpen(false)} className="btn-ghost">✕</button>
                </div>

                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search your prompts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        color: 'white',
                        outline: 'none',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                    }}
                />

                {/* Filter Tags */}
                {allTags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                        <button
                            className="btn-ghost"
                            style={{
                                fontSize: '0.8rem',
                                padding: '4px 12px',
                                borderRadius: '100px',
                                background: !activeTag ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                color: !activeTag ? 'white' : 'var(--text-secondary)'
                            }}
                            onClick={() => setActiveTag(null)}
                        >
                            All
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                className="btn-ghost"
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '4px 12px',
                                    borderRadius: '100px',
                                    background: activeTag === tag ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                    color: activeTag === tag ? 'white' : 'var(--text-secondary)'
                                }}
                                onClick={() => setActiveTag(tag)}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '20px' }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                        {search || activeTag ? 'No matches found.' : 'Your library is empty. Start scanning! 🧠'}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {filtered.map((p) => (
                            <div key={p.id} className="glass-panel" style={{
                                padding: '16px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.2s ease',
                                cursor: 'default'
                            }}>
                                {/* Tags Display */}
                                {p.tags && p.tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                        {p.tags.map(tag => (
                                            <span key={tag} style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: 'rgba(99, 102, 241, 0.2)',
                                                color: '#a5b4fc'
                                            }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.5',
                                    marginBottom: '16px',
                                    maxHeight: '100px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {p.text}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={(e) => handleCopy(p.text, e)}
                                            className="btn-ghost"
                                            style={{ padding: '6px 10px', fontSize: '0.8rem', border: '1px solid var(--glass-border)', borderRadius: '6px' }}
                                        >
                                            Copy
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(p.id, e)}
                                            className="btn-ghost"
                                            style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#ef4444', borderRadius: '6px' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
