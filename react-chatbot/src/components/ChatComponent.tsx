import React, { useState } from 'react';
import { LuBot, LuSendHorizontal } from 'react-icons/lu';

interface IChatComponentProps {}

const ChatComponent: React.FunctionComponent<IChatComponentProps> = () => {
    const [input, setInput] = useState('');

    return (
        <div className='flex flex-col h-[80vh] bg-gray-100 shadow-lg rounded-lg'>
            <h2 className='p-4 font-bold text-xl text-center bg-blue-200 flex items-center justify-center gap-2 rounded-t-lg'>
                React + OpenAI Chatbot <LuBot size={28} />
            </h2>
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-white rounded-b-lg'>
                {/* Chat messages will go here */}
            </div>
            <div className='flex items-center p-4 bg-gray-200 rounded-b-lg'>
                <input
                    type='text'
                    className='flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
                    placeholder='Type your message...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button 
                    onClick={() => {
                        console.log(input);
                        setInput(''); // Clear input after sending
                    }} 
                    className='ml-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200'
                >
                    <LuSendHorizontal size={22} />
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;
