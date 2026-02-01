"use client";

import React, { useRef, useState, ChangeEvent } from 'react';

interface ImageUploaderProps {
    onImageSelected: (files: File[]) => void;
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onImageSelected(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            onImageSelected(Array.from(e.target.files));
        }
    };

    const onButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    return (
        <div
            className="glass-panel"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
                padding: '60px 20px',
                textAlign: 'center',
                border: dragActive ? '1px solid var(--text-primary)' : '1px solid var(--glass-border)',
                backgroundColor: dragActive ? 'rgba(255,255,255,0.02)' : 'transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '280px'
            }}
            onClick={onButtonClick}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleChange}
                style={{ display: 'none' }}
            />

            <div className="camera-lens">
                <div style={{
                    width: '30%',
                    height: '30%',
                    background: '#09090b',
                    borderRadius: '50%',
                    opacity: 0.8
                }} />
            </div>

            <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '1.1rem',
                fontWeight: 500,
                color: 'var(--text-primary)'
            }}>
                Upload or Scan
            </h3>

            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', margin: 0, maxWidth: '200px', lineHeight: '1.5' }}>
                Tap the lens to capture a prompt
            </p>
        </div>
    );
}
