import { useEffect } from "react";
import toast from "react-hot-toast";
import useConversation from '../zustand/useConversation';

const useGetMessages = () => {
	const {
		selectedConversation,
		messages, setMessages,
		lastMessageId, setLastMessageId,
		lastMessageDate, setLastMessageDate,
		loading, setLoading,
		hasMore, setHasMore,
	} = useConversation();

	const LIMIT = 10;

	const getMessages = async () => {
		if (loading || !hasMore || !selectedConversation)
			return;

		setLoading(true);

		try {
			let url = `http://localhost:5000/api/v1/conversations/${selectedConversation.id}/messages?limit=${LIMIT}`;
			if (lastMessageId && lastMessageDate) {
				url += `&lastId=${lastMessageId}&lastDate=${lastMessageDate}`;
			}

			const res = await fetch(url, {
				method: "GET",
				credentials: "include",
			});

			if (res.status === 204) {
				setLoading(false);
				setHasMore(false);
				return;
			}

			const data = await res.json();
			if (!data.success)
				throw new Error(data.message);

			if (data.messages.length < LIMIT)
				setHasMore(false);

			setLastMessageId(data.lastId);
			setLastMessageDate(data.lastDate);
			setMessages([...messages, ...data.messages]);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setMessages([]);
		setLastMessageId(null);
		setLastMessageDate(null);
		setHasMore(true);
		getMessages();
	}, [selectedConversation?.id]);

	return { loading, hasMore, messages, getMessages };
};

export default useGetMessages;
