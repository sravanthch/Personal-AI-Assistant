import React, { useState } from 'react';
import { LuKey, LuExternalLink, LuX, LuSave } from 'react-icons/lu';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string) => void;
    currentKey: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
    const [apiKey, setApiKey] = useState(currentKey || '');

    if (!isOpen) return null;

    const handleSave = () => {
        if (apiKey.trim()) {
            onSave(apiKey.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <LuKey size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">API Key Settings</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <LuX size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            You are currently using the <span className="font-semibold text-blue-600">Demo Version</span>.
                            To continue using the assistant beyond the limit, please enter your personal Google Gemini API Key.
                        </p>
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all"
                        >
                            <LuExternalLink size={14} />
                            Get your free API key here
                        </a>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="apiKey" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                                Gemini API Key
                            </label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste your API key here..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    >
                        <LuSave size={18} />
                        Save API Key
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
