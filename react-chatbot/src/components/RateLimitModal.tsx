import React from 'react';
import { LuInfo, LuX, LuKey } from 'react-icons/lu';

interface RateLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    isUsingDemoKey: boolean;
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({ isOpen, onClose, onUpgrade, isUsingDemoKey }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all border border-red-100 dark:border-red-900/30">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                        <LuInfo size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Too Many Requests</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                        The AI service is currently experiencing high traffic.
                        Please try again in a few minutes or after some time.
                    </p>

                    {isUsingDemoKey && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-left">
                            <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                <span className="mt-0.5">💡</span>
                                <span>Using your own API key can often provide more reliable access.</span>
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {isUsingDemoKey && (
                            <button
                                onClick={() => {
                                    onUpgrade();
                                    onClose();
                                }}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                            >
                                <LuKey size={18} />
                                Use Personal API Key
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <LuX size={18} />
                </button>
            </div>
        </div>
    );
};

export default RateLimitModal;
