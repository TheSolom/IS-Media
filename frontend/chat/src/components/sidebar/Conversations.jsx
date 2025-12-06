import { useEffect, useRef, useCallback } from 'react';
import useGetConversations from '../../hooks/useGetConversations';
import Conversation from './Conversation';

const Conversations = () => {
    const { loading, hasMore, conversations, getConversations } =
        useGetConversations();
    const containerRef = useRef(null);

    const handleScroll = useCallback(() => {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (
            scrollTop + clientHeight >= scrollHeight - 5 &&
            !loading &&
            hasMore
        ) {
            getConversations();
        }
    }, [getConversations, loading, hasMore]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    return (
        <div className="py-2 flex flex-col overflow-auto" ref={containerRef}>
            {conversations.map((conversation) => (
                <Conversation
                    key={conversation.id}
                    conversation={conversation}
                />
            ))}
            {loading && (
                <span className="loading loading-spinner mx-auto"></span>
            )}
            {!loading && !hasMore && (
                <span className=" text-center text-gray-500 py-2">
                    No more conversations
                </span>
            )}
        </div>
    );
};

export default Conversations;
