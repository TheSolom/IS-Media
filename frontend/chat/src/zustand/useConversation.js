import { create } from "zustand";

const useConversation = create((set) => ({
	selectedConversation: null,
	setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
	participants: [],
	setParticipants: (participants) => set({ participants }),
	messages: [],
	setMessages: (messages) => set({ messages }),
	lastMessageId: null,
	setLastMessageId: (id) => set({ lastMessageId: id }),
	lastMessageDate: null,
	setLastMessageDate: (date) => set({ lastMessageDate: date }),
	loading: false,
	setLoading: (loading) => set({ loading }),
	hasMore: true,
	setHasMore: (hasMore) => set({ hasMore }),
}));

export default useConversation;