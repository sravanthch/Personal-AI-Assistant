import React, { useState, useRef } from 'react'
import { LuBot, LuSendHorizontal, LuUpload, LuX, LuFileText, LuMenu, LuLoader, LuKey } from 'react-icons/lu';
import { useChatbot } from './hooks/useChatbot';
import Markdown from 'react-markdown';
import { usePDFHandler } from './hooks/usePdfHandler';
import useChatScroll from './hooks/useChatScroll';
import ApiKeyModal from './ApiKeyModal';
import RateLimitModal from './RateLimitModal';

interface IChatComponentProps {

}

const ChatComponent: React.FunctionComponent<IChatComponentProps> = () => {
    const [input, setInput] = useState('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const {
        messages,
        sendMessage,
        setPDF,
        clearPDF,
        clearChat,
        hasPDF,
        isSending,
        isRateLimited,
        resetRateLimit,
        isLimitReached,
        userApiKey,
        saveApiKey,
        promptCount
    } = useChatbot();
    const { pdfData, isLoading, error, uploadPDF, clearPDF: clearPDFHandler } = usePDFHandler();
    const ref = useChatScroll(messages)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (input.trim()) {
            if (isLimitReached) {
                setIsApiKeyModalOpen(true);
                return;
            }
            sendMessage(input, hasPDF);
            setInput('')
        }
    }

    const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            await uploadPDF(file);
            const textContent = await extractPDFText(file);
            setPDF(textContent);
        } catch (err) {
            console.error('PDF upload failed:', err);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const extractPDFText = async (file: File): Promise<string> => {
        try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.min.mjs',
                import.meta.url
            ).href;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }

            return fullText.substring(0, 12000);
        } catch (err) {
            throw new Error(`Failed to extract text: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const handleClearPDF = () => {
        clearPDF();
        clearPDFHandler();
    };

    return (
        <>
            <div className={`fixed inset-0 z-50 w-full md:relative md:inset-auto md:w-80 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col border-r border-gray-700 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className='p-6 border-b border-gray-700 flex items-center justify-between'>
                    <h2 className='text-2xl font-bold flex items-center gap-2'>
                        <LuFileText size={28} className='text-blue-400' />
                        Documents
                    </h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className='md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors'
                    >
                        <LuX size={24} />
                    </button>
                </div>

                <div className='flex-1 flex flex-col p-6 gap-4'>
                    {!pdfData ? (
                        <div className='flex flex-col items-center justify-center gap-4 py-12'>
                            <div className='w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center'>
                                <LuFileText size={40} className='text-gray-400' />
                            </div>
                            <div className='text-center'>
                                <h3 className='text-lg font-semibold mb-2'>No PDF Uploaded</h3>
                                <p className='text-gray-400 text-sm'>Upload a PDF document to start asking questions about it</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='.pdf'
                                onChange={handlePDFUpload}
                                disabled={isLoading}
                                className='hidden'
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className='w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition duration-200'
                            >
                                <LuUpload size={20} />
                                {isLoading ? 'Uploading...' : 'Upload PDF'}
                            </button>
                            {error && (
                                <div className='w-full p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-200 text-sm'>
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='flex flex-col gap-4'>
                            <div className='p-4 bg-gray-700 rounded-lg border border-blue-500'>
                                <div className='flex items-start gap-3 mb-3'>
                                    <LuFileText size={24} className='text-blue-400 flex-shrink-0 mt-1' />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-semibold text-blue-300 truncate'>
                                            {pdfData.fileName}
                                        </p>
                                        <p className='text-xs text-gray-400 mt-1'>Uploaded at {pdfData.uploadedAt}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClearPDF}
                                    className='w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition duration-200 flex items-center justify-center gap-2'
                                >
                                    <LuX size={16} />
                                    Remove PDF
                                </button>
                            </div>

                            <div className='p-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg'>
                                <p className='text-xs text-blue-200'>
                                    💡 You can now ask questions about this PDF in the chatbot. The AI will use the document content to answer your questions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className='p-4 border-t border-gray-700 flex flex-col gap-2'>
                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className='w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded transition duration-200 flex items-center justify-center gap-2 border border-gray-600'
                        >
                            <LuX size={14} />
                            Clear Chat History
                        </button>
                    )}

                    <div className='text-xs text-gray-400 text-center mt-2'>
                        <p>Supported format: PDF</p>
                    </div>
                </div>
            </div>

            <div className='flex-1 flex flex-col bg-white w-full'>
                <div className='p-4 font-semibold text-lg bg-gradient-to-r from-blue-600 to-blue-800 flex text-white items-center gap-3'>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className='md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors'
                    >
                        <LuMenu size={24} />
                    </button>
                    <div className='flex items-center gap-2 justify-center flex-1 min-w-0'>
                        <LuBot size={25} className="flex-shrink-0" />
                        <span className="truncate">React + AI Chatbot</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {!userApiKey && (
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-[10px] uppercase font-bold text-blue-200 leading-none mb-1">
                                    {promptCount}/4
                                </span>
                                <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${promptCount >= 4 ? 'bg-red-400' : 'bg-green-400'}`}
                                        style={{ width: `${Math.min((promptCount / 4) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setIsApiKeyModalOpen(true)}
                            className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${userApiKey
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 shadow-lg'
                                }`}
                            title={userApiKey ? 'API Key Active' : 'Enter API Key'}
                        >
                            <LuKey size={18} />
                            {!userApiKey && <span className="text-xs hidden md:block">Upgrade</span>}
                        </button>
                    </div>
                </div>

                <div ref={ref} className='flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50'>
                    {messages.length === 0 && (
                        <div className='flex flex-col items-center justify-center h-full text-gray-400'>
                            <LuBot size={48} className='mb-4 text-gray-300' />
                            <p className='text-lg font-medium'>Welcome to AI Assistant</p>
                            <p className='text-sm'>Start a conversation or upload a PDF to get started</p>
                        </div>
                    )}
                    {messages?.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-md lg:max-w-xl px-4 py-3 rounded-lg ${msg.sender === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                <div className='prose prose-sm max-w-none dark:prose-invert'>
                                    <Markdown>
                                        {msg?.text}
                                    </Markdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isSending && (
                        <div className='flex justify-start'>
                            <div className='bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none shadow-sm px-4 py-3 flex flex-row'>
                                <LuLoader className="animate-spin text-blue-600" size={20} />
                                <p className='text-sm text-gray-500 ml-2'>Thinking...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Input Area */}
                <div className='p-4 border-t border-gray-200 bg-white'>
                    <div className='flex items-center gap-2'>
                        <input
                            type='text'
                            className='flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
                            placeholder={pdfData ? 'Ask a question about the PDF...' : 'Type your message here...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button
                            onClick={handleSend}
                            className='p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center justify-center'
                            title='Send message'
                        >
                            <LuSendHorizontal size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                onSave={saveApiKey}
                currentKey={userApiKey}
            />

            <RateLimitModal
                isOpen={isRateLimited}
                onClose={resetRateLimit}
                onUpgrade={() => setIsApiKeyModalOpen(true)}
                isUsingDemoKey={!userApiKey}
            />
        </>
    )
}

export default ChatComponent;