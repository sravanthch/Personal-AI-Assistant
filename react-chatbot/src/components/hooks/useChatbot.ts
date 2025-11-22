import axios from "axios";
import { useState } from "react";

interface Message {
    text: string;
    sender: "user" | "bot";
}

export const useChatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);

    const sendMessage = async (message: string) => {
        if (!message || !message.trim()) return;

        // Add the user's message using a functional update to avoid stale state
        setMessages((prev) => [...prev, { text: message, sender: "user" }]);

        // Temporarily hard-coded API key (move to .env later)
        // const apiKey = process.env.API_KEY
        const apiKey = import.meta.env.VITE_API_KEY;
        

        try {
            const response = await axios.post(
                import.meta.env.VITE_OPEN_AI_API,
                {
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: message,
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

    return { messages, sendMessage };
};