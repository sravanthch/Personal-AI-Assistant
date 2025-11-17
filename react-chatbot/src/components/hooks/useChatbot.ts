import { useState } from "react";

interface Message {
    text: string;
    sender: "user" | "bot";
}

export const useChatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);

};