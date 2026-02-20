import axios from "axios";
import { useState, useEffect } from "react";

interface Message {
    text: string;
    sender: "user" | "bot";
}

export const useChatbot = () => {
    // Start with empty messages (clears on refresh as requested)
    const [messages, setMessages] = useState<Message[]>([]);
    const [pdfContent, setPdfContent] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);

    // Helper to get stable date string (YYYY-MM-DD)
    const getTodayDateString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Prompt limit and API key state
    const [promptCount, setPromptCount] = useState<number>(() => {
        const savedCount = localStorage.getItem("prompt_count");
        return savedCount ? parseInt(savedCount, 10) : 0;
    });

    // Stable reset date logic (Calendar Day)
    const [lastResetDate, setLastResetDate] = useState<string>(() => {
        const savedDate = localStorage.getItem("prompt_last_reset_date");
        return savedDate || getTodayDateString();
    });

    const [userApiKey, setUserApiKey] = useState<string | null>(() => {
        return localStorage.getItem("user_gemini_api_key");
    });

    // Check for Calendar Day reset on mount and periodically
    useEffect(() => {
        const checkReset = () => {
            const currentDate = getTodayDateString();
            if (currentDate !== lastResetDate) {
                setPromptCount(0);
                setLastResetDate(currentDate);
                localStorage.setItem("prompt_count", "0");
                localStorage.setItem("prompt_last_reset_date", currentDate);
            }
        };

        checkReset();
        const interval = setInterval(checkReset, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [lastResetDate]);


    // Persist prompt count
    useEffect(() => {
        localStorage.setItem("prompt_count", promptCount.toString());
    }, [promptCount]);

    // Persist custom API key
    const saveApiKey = (key: string) => {
        localStorage.setItem("user_gemini_api_key", key);
        setUserApiKey(key);
    };

    const isLimitReached = !userApiKey && promptCount >= 4;

    const sendMessage = async (message: string, includeContext: boolean = false) => {
        if (!message || !message.trim()) return;

        // Check limit
        if (isLimitReached) {
            console.warn("Prompt limit reached. Custom API key required.");
            return;
        }

        setIsSending(true);
        const newUserMessage: Message = { text: message, sender: "user" };
        setMessages((prev) => [...prev, newUserMessage]);

        const apiKey = userApiKey || import.meta.env.VITE_GEMINI_API_KEY;

        try {
            // Prepare the history for Gemini API
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

            // Increment prompt count if using demo key
            if (!userApiKey) {
                // Refresh the reset date if it's the first prompt of a day in a new session
                setLastResetDate(getTodayDateString());
                setPromptCount((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error fetching AI Response", error);

            // Check for rate limit error (429)
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                setIsRateLimited(true);
            }

            setMessages((prev) => [
                ...prev,
                { text: "Error: unable to fetch response from API.", sender: "bot" },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const resetRateLimit = () => {
        setIsRateLimited(false);
    };

    const setPDF = (content: string) => {
        setPdfContent(content);
    };

    const clearPDF = () => {
        setPdfContent(null);
    };

    const clearChat = () => {
        setMessages([]);
        setPdfContent(null);
    };

    return {
        messages,
        sendMessage,
        setPDF,
        clearPDF,
        clearChat,
        hasPDF: !!pdfContent,
        isSending,
        isRateLimited,
        resetRateLimit,
        promptCount,
        isLimitReached,
        userApiKey,
        saveApiKey
    };
};
