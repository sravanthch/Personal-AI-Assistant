import axios from "axios";
import { useState, useEffect } from "react";

interface Message {
    text: string;
    sender: "user" | "bot";
}

export const useChatbot = () => {
    // Load messages from localStorage on initial render
    const [messages, setMessages] = useState<Message[]>(() => {
        const savedMessages = localStorage.getItem("chat_messages");
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [pdfContent, setPdfContent] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("chat_messages", JSON.stringify(messages));
    }, [messages]);

    const sendMessage = async (message: string, includeContext: boolean = false) => {
        if (!message || !message.trim()) return;

        setIsSending(true);
        const newUserMessage: Message = { text: message, sender: "user" };
        setMessages((prev) => [...prev, newUserMessage]);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        try {
            // Prepare the history for Gemini API
            // Gemini format: [{ role: "user" | "model", parts: [{ text: string }] }]
            const history = messages.map((msg) => ({
                role: msg.sender === "user" ? "user" : "model",
                parts: [{ text: msg.text }],
            }));

            let currentText = message;
            if (includeContext && pdfContent) {
                currentText = `You are answering based on the following PDF document content:\n\n${pdfContent}\n\nQuestion: ${message}`;
            }

            // Add the current message to history
            history.push({
                role: "user",
                parts: [{ text: currentText }],
            });

            const response = await axios.post(
                `${import.meta.env.VITE_GEMINI_API_URL}?key=${apiKey}`,
                {
                    contents: history,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const botMessage =
                response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ??
                "(no response)";

            setMessages((prev) => [...prev, { text: botMessage, sender: "bot" }]);
        } catch (error) {
            console.error("Error fetching AI Response", error);
            setMessages((prev) => [
                ...prev,
                { text: "Error: unable to fetch response from API.", sender: "bot" },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const setPDF = (content: string) => {
        setPdfContent(content);
    };

    const clearPDF = () => {
        setPdfContent(null);
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem("chat_messages");
    };

    return { messages, sendMessage, setPDF, clearPDF, clearChat, hasPDF: !!pdfContent, isSending };
};
