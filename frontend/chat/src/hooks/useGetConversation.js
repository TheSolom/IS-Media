import { useState } from "react";
import toast from "react-hot-toast";
import { BASE_API_URL } from "../utils/api";

const useGetConversation = () => {
    const [loading, setLoading] = useState(false);

    const getConversation = async (conversationId) => {
        setLoading(true);

        try {
            const res = await fetch(
                `${BASE_API_URL}/conversations/${conversationId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            const data = await res.json();
            if (!data.success)
                throw new Error(data.message);

            return data.conversation;
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, getConversation };
};

export default useGetConversation;
