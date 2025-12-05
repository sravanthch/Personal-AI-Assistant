import axios from "axios";
import { useState } from "react";

interface Message {
    text: string;
    sender: "user" | "bot";
}

export const useChatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [pdfContent, setPdfContent] = useState<string | null>(null);

    const sendMessage = async (message: string, includeContext: boolean = false) => {
        if (!message || !message.trim()) return;

        // Add the user's message using a functional update to avoid stale state
        setMessages((prev) => [...prev, { text: message, sender: "user" }]);

        // Temporarily hard-coded API key (move to .env later)
        // const apiKey = process.env.API_KEY
        const apiKey = import.meta.env.VITE_API_KEY;
        
        try {
            let userContent = message;
            
            // If PDF is uploaded and context should be included, add it to the message
            if (includeContext && pdfContent) {
                userContent = `You are answering based on the following PDF document content:\n\n${pdfContent}\n\nQuestion: ${message}`;
            }

            const response = await axios.post(
                import.meta.env.VITE_OPEN_AI_API,
                {
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: userContent,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const botMessage =
                response?.data?.choices?.[0]?.message?.content ??
                response?.data?.choices?.[0]?.text ??
                "(no response)";

            setMessages((prev) => [...prev, { text: botMessage, sender: "bot" }]);
        } catch (error) {
            console.error("Error fetching AI Response", error);
            setMessages((prev) => [
                ...prev,
                { text: "Error: unable to fetch response from API.", sender: "bot" },
            ]);
        }
    };

    const setPDF = (content: string) => {
        setPdfContent(content);
    };

    const clearPDF = () => {
        setPdfContent(null);
    };

    return { messages, sendMessage, setPDF, clearPDF, hasPDF: !!pdfContent };
};