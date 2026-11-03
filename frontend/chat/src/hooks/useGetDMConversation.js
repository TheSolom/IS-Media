import { useState } from "react";
import toast from "react-hot-toast";
import { BASE_API_URL } from "../utils/api";

const useGetDMConversation = () => {
    const [loading, setLoading] = useState(false);

    const getDMConversation = async (userId) => {
        setLoading(true);

        try {
            const res = await fetch(
                `${BASE_API_URL}/conversations/users/${userId}`,
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

    return { loading, getDMConversation };
};

export default useGetDMConversation;
