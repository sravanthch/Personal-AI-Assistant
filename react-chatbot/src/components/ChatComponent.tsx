import React, { useState, useRef } from 'react'
import { LuBot, LuSendHorizontal, LuUpload, LuX, LuFileText, LuMenu } from 'react-icons/lu';
import { useChatbot } from './hooks/useChatbot';
import Markdown from 'react-markdown';
import { usePDFHandler } from './hooks/usePdfHandler';
import useChatScroll from './hooks/useChatScroll';

interface IChatComponentProps {

}

const ChatComponent: React.FunctionComponent<IChatComponentProps> = () => {
    const [input, setInput] = useState('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { messages, sendMessage, setPDF, clearPDF, hasPDF } = useChatbot();
    const { pdfData, isLoading, error, uploadPDF, clearPDF: clearPDFHandler } = usePDFHandler();
    const ref = useChatScroll(messages)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (input.trim()) {
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

                <div className='p-4 border-t border-gray-700 text-xs text-gray-400 text-center'>
                    <p>Supported format: PDF</p>
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
                    <div className='flex items-center gap-2 justify-center flex-1 md:flex-none'>
                        <LuBot size={25} />
                        React + OpenAI Chatbot
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
        </>
    )
}

export default ChatComponent;