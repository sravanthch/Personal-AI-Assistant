import React, { useEffect } from 'react'
import ChatComponent from './components/ChatComponent';


const App: React.FunctionComponent = () => {
  useEffect(() => {
    // Clear localStorage on app initialization (page load/refresh or server restart)
    localStorage.clear();
  }, []);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-0 md:p-4">
      <div className='w-full h-full max-w-7xl bg-white shadow-2xl rounded-none md:rounded-xl overflow-hidden flex'>
        <ChatComponent/>
      </div>
    </div>
  )
}

export default App;