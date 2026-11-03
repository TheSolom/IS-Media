import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { BASE_API_URL } from "../utils/api";

const useCreateConversation = () => {
    const [loading, setLoading] = useState(false);
    const { authUser } = useAuthContext();

    const createConversation = async (user) => {
        setLoading(true);

        try {
            const res = await fetch(`${BASE_API_URL}/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: user.username,
                    photo: user.profile_picture,
                    type: 1,
                    participants: [authUser.id, user.user_id],
                }),
                credentials: "include"
            });

            const data = await res.json();
            if (!data.success)
                throw new Error(data.message);

            return data.conversationId;
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, createConversation };
};

export default useCreateConversation;
