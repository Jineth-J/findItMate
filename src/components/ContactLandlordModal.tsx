import React, { useState } from 'react';
import { X, Send, MessageCircle, User, Building, CheckCircle } from 'lucide-react';
import { messagesAPI } from '../services/api';

interface ContactLandlordModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    propertyName: string;
    landlordId: string;
    landlordName?: string;
    onSend?: (message: string) => Promise<void>; // Optional callback for legacy support
}

export function ContactLandlordModal({
    isOpen,
    onClose,
    propertyId,
    propertyName,
    landlordId,
    landlordName = 'Landlord',
    onSend
}: ContactLandlordModalProps) {
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const quickMessages = [
        "Is this room still available?",
        "Can I schedule a viewing?",
        "What's included in the rent?",
        "Earliest move-in date?"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setError('Please enter a message');
            return;
        }

        setIsSending(true);
        setError('');

        try {
            const fullMessage = subject
                ? `Subject: ${subject}\n\nRegarding: ${propertyName}\n\n${message}`
                : `Regarding: ${propertyName}\n\n${message}`;

            // Use the API directly
            const response = await messagesAPI.send({
                recipientId: landlordId,
                propertyId: propertyId,
                content: fullMessage
            });

            if (response.success) {
                setSuccess(true);
                // Also call the legacy callback if provided
                if (onSend) {
                    await onSend(message);
                }
                setTimeout(() => {
                    setMessage('');
                    setSubject('');
                    setSuccess(false);
                    onClose();
                }, 2000);
            } else {
                setError(response.message || 'Failed to send message');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send message. Please log in and try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleQuickMessage = (qm: string) => {
        setMessage(qm);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#3E2723] to-[#5D4037] px-6 py-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <MessageCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Contact Landlord</h2>
                                <p className="text-white/70 text-sm">Send a message</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Property Info */}
                <div className="bg-[#F5F0E8] px-6 py-3 border-b border-[#E8E0D5]">
                    <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-[#795548]" />
                        <div>
                            <p className="font-semibold text-[#3E2723] text-sm">{propertyName}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                <User className="h-3 w-3" />
                                <span>Managed by {landlordName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {success ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <h4 className="text-xl font-bold text-[#3E2723] mb-2">Message Sent!</h4>
                        <p className="text-gray-600 text-sm">The landlord will receive your message shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* Quick Messages */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Quick Messages
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {quickMessages.map((qm, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleQuickMessage(qm)}
                                        className={`text-xs px-3 py-1.5 rounded-full transition-all ${message === qm
                                                ? 'bg-[#3E2723] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-[#EFEBE9]'
                                            }`}
                                    >
                                        {qm}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Subject (Optional)
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Inquiry about availability"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Your Message *
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    setError('');
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent min-h-[100px] resize-none text-sm"
                                placeholder="Hi, I'm interested in this room..."
                                required
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                                disabled={isSending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSending || !message.trim()}
                                className={`flex-1 px-4 py-3 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${isSending || !message.trim()
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#3E2723] text-white hover:bg-[#2D1B18] shadow-lg'
                                    }`}
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            You must be logged in to send messages
                        </p>
                    </form>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
