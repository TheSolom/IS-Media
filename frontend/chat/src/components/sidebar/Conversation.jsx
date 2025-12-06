import { useSocketContext } from '../../context/SocketContext';
import useConversation from '../../zustand/useConversation';

const Conversation = ({ conversation, lastIdx }) => {
    const {
        selectedConversation,
        setSelectedConversation,
        setMessages,
        setLastMessageId,
        setLastMessageDate,
        setHasMore,
    } = useConversation();

    const isSelected = selectedConversation?.id === conversation.id;
    const { onlineUsers } = useSocketContext();
    const isOnline = conversation.dm_receiver_id in onlineUsers;

    const handleSelectConversation = () => {
        if (isSelected) return;

        setSelectedConversation(conversation);
        setMessages([]);
        setLastMessageId(null);
        setLastMessageDate(null);
        setHasMore(true);
    };

    return (
        <>
            <div
                className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer
                ${isSelected ? 'bg-sky-500' : ''}
            `}
                onClick={handleSelectConversation}
            >
                <div className={`avatar ${isOnline ? 'online' : ''}`}>
                    <div className="w-12 rounded-full">
                        <img src={conversation.image} alt="" />
                    </div>
                </div>

                <div className="flex flex-col flex-1">
                    <div className="flex gap-3 justify-between">
                        <p className="font-bold text-gray-500">
                            {conversation.title}
                        </p>
                    </div>
                </div>
            </div>

            {!lastIdx && <div className="divider my-0 py-0 h-1" />}
        </>
    );
};

export default Conversation;
