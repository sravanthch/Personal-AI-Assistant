A Personal AI Assistant
### Command to Start the Server : npm run dev 
### PORT:3001

# Chat with PDF – AI Chatbot (React + OpenAI API)

An AI-powered web application that allows users to **chat normally** or **upload a PDF and ask questions based on its content**.  
The app extracts text from the uploaded PDF using `pdfjs-dist` and sends contextual queries to the OpenAI API for accurate, document-aware responses.

---

## Features

- **AI Chatbot** powered by OpenAI (gpt-4o-mini)
- **Upload any PDF** and ask questions based on its content
- Extracts text from PDF using `pdfjs-dist`
- Smart chat mode:  
  - With PDF → AI answers using document context  
  - Without PDF → AI answers normally  
- Modern UI with:
  - Message bubbles  
  - Markdown rendering  
  - Auto-scroll  
  - PDF upload status & delete option  
- Built using reusable **custom hooks** (`useChatbot`, `usePDFHandler`, `useChatScroll`)

