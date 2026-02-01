"use client";

import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import Toast from './Toast';
import Modal from './Modal';
import { recognizeText } from '@/lib/ocr';
import { savePrompt } from '@/lib/storage';

export default function Scanner() {
    // Core Logic States
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'DONE'>('IDLE');
    const [resultText, setResultText] = useState<string>('');
    const [preview, setPreview] = useState<string | null>(null);

    // UX States
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Input States
    const [isSaved, setIsSaved] = useState(false);
    const [email, setEmail] = useState('');
    const [emailStatus, setEmailStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'ERROR'>('IDLE');

    const shareCardRef = React.useRef<HTMLDivElement>(null);

    const showToast = (msg: string) => {
        setToastMsg(msg);
    };

    // === 1. Magic Polish Utility ===
    const handleMagicPolish = () => {
        if (!resultText) return;

        let cleaned = resultText;

        // 1. Extraction from "Prompt:" if present
        const promptRegex = /Prompt:\s*"?(.*?)(?=(?:Prompt:|Visa fler|Show more|$))/gis;
        const matches = [...resultText.matchAll(promptRegex)];

        if (matches.length > 0) {
            // Keep the "Prompt:" label so future scans recognize it!
            cleaned = matches.map(m => "Prompt: " + m[1].trim()).join('\n\n');
        } else {
            // Fallback: Remove noise
            const noisePatterns = [
                /^\d{1,2}:\d{2}.*$/gm, /^\d{1,3}%$/gm, /X\.com|Twitter|Post/gi, /Visa fler|Show more/gi,
                /@\w+/g, /^\s*[\$\€\£]\d+.*$/gm, /^[^\w\s]*[\|\|\—\-\_]{2,}.*$/gm, /^\s*\d+\s+[a-z]{0,2}\s*[\$\%]/gim
            ];
            noisePatterns.forEach(p => cleaned = cleaned.replace(p, ''));
        }

        // 2. Formatting
        cleaned = cleaned.replace(/([a-z,])\n([a-z])/g, '$1 $2').replace(/[ ]+/g, ' ');
        cleaned = cleaned.replace(/‘|’/g, "'").replace(/“|”/g, '"').replace(/Visa fler|Show more/gi, '');
        cleaned = cleaned.replace(/(\s)(\d+[\.\)])/g, '\n$2');
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

        setResultText(cleaned.trim());

        showToast(matches.length > 0 ? `✨ Extracted ${matches.length} prompts!` : '✨ Text polished & cleaned!');
    };

    // === 3. Smart Copy / Launch ===
    const handleCopy = (type: 'STANDARD' | 'MIDJOURNEY' | 'CHATGPT') => {
        if (!resultText) return;
        let textToCopy = resultText;

        if (type === 'MIDJOURNEY') {
            textToCopy = resultText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() + " --v 6.0";
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            if (type === 'CHATGPT') {
                window.open('https://chat.openai.com', '_blank');
            } else {
                showToast(type === 'MIDJOURNEY' ? 'Copied for Midjourney!' : 'Copied to clipboard!');
            }
        });
    };

    // === 4. Share as Image ===
    const handleShareImage = async () => {
        if (!shareCardRef.current || !resultText) return;
        const html2canvas = (await import('html2canvas')).default;

        try {
            const canvas = await html2canvas(shareCardRef.current, { backgroundColor: null, scale: 2 } as any);
            const link = document.createElement('a');
            link.download = `prompt-scan-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast('Framing... Image downloaded! 🖼️');
        } catch (e) {
            console.error(e);
            showToast('Failed to generate image.');
        }
    };

    // === 5. Export as PDF ===
    const handleExportPDF = async () => {
        if (!resultText) return;
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(99, 102, 241); // Electric Indigo
            doc.text("PromptScanner Export", 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);

            // Content
            doc.setFontSize(12);
            doc.setTextColor(0);

            // Split text to fit page
            const splitText = doc.splitTextToSize(resultText, 170); // 170mm width
            doc.text(splitText, 20, 40);

            doc.save(`prompt-scan-${Date.now()}.pdf`);
            showToast('PDF Exported successfully! 📄');
        } catch (e) {
            console.error(e);
            showToast('Failed to generate PDF.');
        }
    };

    const handleImages = async (files: File[]) => {
        if (files.length === 0) return;
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(files[0]);

        setStatus('SCANNING');
        try {
            let combinedText = "";
            for (const file of files) {
                const { text } = await recognizeText(file);
                combinedText += (combinedText ? "\n\n" : "") + text.trim();
            }
            setResultText(prev => prev ? prev + "\n\n" + combinedText : combinedText);
            await new Promise(r => setTimeout(r, 2000));
            setStatus('DONE');
            setIsSaved(false);
            setShowEmailModal(false);
            setEmailStatus('IDLE');
        } catch (err) {
            console.error(err);
            setStatus('IDLE');
            showToast('Scanning failed. Try again.');
        }
    };

    const handleSave = () => {
        if (!resultText) return;
        savePrompt(resultText);
        setIsSaved(true);
        showToast('Saved to your library! 📚');
    };

    const handleSendEmail = async () => {
        if (!email) return;
        setEmailStatus('SENDING');
        try {
            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, prompt: resultText })
            });

            const data = await res.json();
            if (res.ok) {
                setEmailStatus('SENT');
                showToast(data.mode === 'simulation' ? 'Simulated email sent! (Check console)' : 'Email sent successfully!');
                setTimeout(() => setShowEmailModal(false), 1500);
            } else {
                setEmailStatus('ERROR');
                showToast('Failed to send email.');
            }
        } catch (e) {
            setEmailStatus('ERROR');
            showToast('Network error.');
        }
    };

    const handleScanNextPage = () => {
        setStatus('IDLE');
        setPreview(null);
    };

    const handleRestart = () => {
        setStatus('IDLE');
        setResultText('');
        setPreview(null);
        setShowClearConfirm(false);
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

            {/* Confirmation Modal */}
            <Modal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                title="Start Over?"
                footer={
                    <>
                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowClearConfirm(false)}>Cancel</button>
                        <button className="btn-primary" style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none' }} onClick={handleRestart}>Confirm</button>
                    </>
                }
            >
                This will discard your current extracted text.
            </Modal>

            {/* Email Modal */}
            <Modal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                title="Send to Email"
            >
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 0 }}>Receive this prompt directly in your inbox.</p>
                <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'white',
                        margin: '16px 0',
                        outline: 'none',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                    }}
                    autoFocus
                />
                <button
                    className="btn-primary"
                    style={{ width: '100%' }}
                    onClick={handleSendEmail}
                    disabled={emailStatus === 'SENDING' || emailStatus === 'SENT'}
                >
                    {emailStatus === 'SENDING' ? 'Sending...' : emailStatus === 'SENT' ? 'Sent!' : 'Send Prompt'}
                </button>
            </Modal>

            {/* Hidden Share Card */}
            <div ref={shareCardRef} className="share-card">
                <div className="share-card-header">
                    <div className="share-card-logo">PromptScanner</div>
                    <div style={{ opacity: 0.5 }}>AI EXTRACTED PROMPT</div>
                </div>
                <div className="share-card-body">{resultText}</div>
                <div className="share-card-footer">Generate with your favorite AI model</div>
            </div>

            {status === 'IDLE' && (
                <>
                    {resultText ? (
                        <div className="glass-panel" style={{ padding: '0', marginBottom: '16px', borderLeft: '4px solid var(--accent-primary)', overflow: 'hidden' }}>
                            <div style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--glass-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Adding to Draft
                                </h3>
                                <button
                                    onClick={() => setStatus('DONE')}
                                    className="btn-ghost"
                                    style={{ fontSize: '0.8rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    Done ✕
                                </button>
                            </div>
                            <div style={{ padding: '12px 16px' }}>
                                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace' }}>
                                    {resultText.substring(0, 80)}...
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <ImageUploader onImageSelected={handleImages} />

                    {resultText && (
                        <button
                            className="btn-primary"
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onClick={() => setStatus('DONE')}
                        >
                            <span>↩</span> Return to Editor
                        </button>
                    )}
                </>
            )}

            {status === 'SCANNING' && (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="scan-container" style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                        {preview ? (
                            <>
                                <img src={preview} alt="Scanning..." style={{ maxWidth: '100%', borderRadius: '12px', opacity: 0.6 }} />
                                <div className="scan-laser"></div>
                            </>
                        ) : (
                            <div className="animate-pulse"><span style={{ fontSize: '2rem' }}>🧠</span></div>
                        )}
                    </div>
                    <p style={{ marginTop: '20px', fontFamily: 'monospace', color: '#a5b4fc' }}>ANALYZING NEURAL PATTERNS...</p>
                </div>
            )}

            {status === 'DONE' && (
                <div className="glass-panel animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>Scanner Result</h2>
                        <button onClick={handleMagicPolish} className="btn-ghost" style={{ color: '#a5b4fc', fontSize: '0.9rem' }}>
                            ✨ Magic Clean
                        </button>
                    </div>

                    <div style={{ padding: '20px' }}>
                        <textarea
                            value={resultText}
                            onChange={(e) => setResultText(e.target.value)}
                            placeholder="Extracted text will appear here..."
                            style={{
                                width: '100%',
                                minHeight: '300px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontFamily: 'monospace',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Action Bar */}
                    <div style={{
                        padding: '20px',
                        borderTop: '1px solid var(--glass-border)',
                        background: 'rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary" onClick={handleScanNextPage} style={{ flex: 1 }}>+ Page</button>
                            <button className="btn-primary" onClick={handleSave} disabled={isSaved} style={{ flex: 1 }}>
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button className="btn-secondary" onClick={() => setShowEmailModal(true)}>✉</button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            <button className="btn-ghost" style={{ border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleCopy('STANDARD')}>📋 Copy</button>
                            <button className="btn-ghost" style={{ border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleCopy('MIDJOURNEY')}>🎨 Copy for MJ</button>
                            <button className="btn-ghost" style={{ border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleCopy('CHATGPT')}>🤖 Start Chat</button>
                            <button className="btn-ghost" style={{ border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleShareImage}>🖼️ Share Image</button>
                            <button className="btn-ghost" style={{ border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleExportPDF}>📄 Export PDF</button>
                        </div>

                        <button
                            className="btn-ghost"
                            style={{ color: '#ef4444', alignSelf: 'flex-start', fontSize: '0.8rem', paddingLeft: 0 }}
                            onClick={() => setShowClearConfirm(true)}
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
