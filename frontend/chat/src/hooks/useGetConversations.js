import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSocketContext } from "../context/SocketContext";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [initialCall, setInitialCall] = useState(true);
	const [lastId, setLastId] = useState(null);
	const [lastDate, setLastDate] = useState(null);
	const [conversations, setConversations] = useState([]);

	const { socket } = useSocketContext();

	const LIMIT = 10;

	const userJoinConversations = (conversations) => {
		if (!socket || !conversations) return;

		const conversationsIds = conversations.map(conversation => conversation.id.toString());
		socket.emit('joinConversations', conversationsIds);
	};

	const getConversations = async () => {
		if (loading || !hasMore || (!initialCall && !lastId && !lastDate))
			return;

		setInitialCall(false);
		setLoading(true);

		try {
			let url = `http://localhost:5000/api/v1/conversations?limit=${LIMIT}`;
			if (lastId && lastDate) {
				url += `&lastId=${lastId}&lastDate=${lastDate}`;
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

			if (data.conversations.length < LIMIT)
				setHasMore(false);

			setLastId(data.lastId);
			setLastDate(data.lastDate);
			setConversations(prevConversations => [...prevConversations, ...data.conversations]);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setInitialCall(false);
		getConversations();
	}, []);

	useEffect(() => userJoinConversations(conversations), [socket, conversations]);

	return { loading, hasMore, conversations, getConversations };
};

export default useGetConversations;
