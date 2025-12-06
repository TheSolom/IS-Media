import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();
	const { authUser } = useAuthContext();

	const sendMessage = async (message) => {
		setLoading(true);

		try {
			const sentMessage = {
				content: message,
				image: null,
				sender_id: authUser.id,
				conversation_id: selectedConversation.id,
				parent_id: null,
			};

			const res = await fetch(`http://localhost:5000/api/v1/conversations/${selectedConversation.id}/messages`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(sentMessage),
				credentials: "include"
			});

			const data = await res.json();
			if (!data.success)
				throw new Error(data.message);

			setMessages([...messages, data.message]);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};

export default useSendMessage;
