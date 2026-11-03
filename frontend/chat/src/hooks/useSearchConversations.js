import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BASE_API_URL } from "../utils/api";

const useSearchConversations = (title) => {
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const getConversations = async (title) => {
            setLoading(true);

            try {
                const res = await fetch(`${BASE_API_URL}/conversations/${title}/search`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();
                if (!data.success)
                    throw new Error(data.message);

                setConversations(data.conversations);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (title)
            getConversations(title);
    }, [title]);

    return { loading, conversations };
};

export default useSearchConversations;
