import React, { useState, useRef } from 'react'
import { LuBot, LuSendHorizontal, LuUpload, LuX, LuFileText } from 'react-icons/lu';
import { useChatbot } from './hooks/useChatbot';
import Markdown from 'react-markdown';
import useChatScroll from './hooks/useChatScroll';

interface IChatComponentProps {

}

const ChatComponent: React.FunctionComponent<IChatComponentProps> = () => {
    const [input, setInput] = useState('')
    const { messages, sendMessage} = useChatbot();
    const ref = useChatScroll(messages)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input,);
            setInput('')
        }
    }

    return (
        <>
           

            {/* Right Side - Chatbot */}
            <div className='flex-1 flex flex-col bg-white'>
                {/* Chat Header */}
                <div className='p-4 font-semibold text-lg bg-gradient-to-r from-blue-600 to-blue-800 flex text-white justify-center items-center gap-2'>
                    <LuBot size={25} />
                    React + OpenAI Chatbot
                </div>

                {/* Chat Messages */}
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
                                className={`max-w-md lg:max-w-xl px-4 py-3 rounded-lg ${
                                    msg.sender === 'user'
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
                            placeholder={'Type your message here...'}
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