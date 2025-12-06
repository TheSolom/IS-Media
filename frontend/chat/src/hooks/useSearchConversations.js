import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetConversations = (title) => {
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const getConversations = async (title) => {
            setLoading(true);

            try {
                const res = await fetch(`http://localhost:5000/api/v1/conversations/${title}/search`, {
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

export default useGetConversations;
