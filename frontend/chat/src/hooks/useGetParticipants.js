import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useConversation from '../zustand/useConversation';
import { BASE_API_URL } from "../utils/api";

const useGetParticipants = () => {
	const {
		selectedConversation,
		participants, setParticipants
	} = useConversation();
	const [loading, setLoading] = useState(false);

	const getParticipants = async () => {
		if (!selectedConversation)
			return;

		setLoading(true);

		try {
			const res = await fetch(`${BASE_API_URL}/conversations/${selectedConversation.id}/participants`, {
				method: "GET",
				credentials: "include",
			});

			if (res.status === 204) {
				setLoading(false);
				return;
			}

			const data = await res.json();
			if (!data.success)
				throw new Error(data.message);

			setParticipants(data.participants);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setParticipants([]);
		getParticipants();
	}, [selectedConversation?.id]);

	return { loading, participants };
};

export default useGetParticipants;
