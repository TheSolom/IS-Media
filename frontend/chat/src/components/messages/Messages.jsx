import { useEffect, useRef, useCallback } from 'react';
import useGetMessages from '../../hooks/useGetMessages';
import Message from './Message';
import MessageSkeleton from '../skeletons/MessageSkeleton';
import useListenMessages from '../../hooks/useListenMessages';
import useConversation from '../../zustand/useConversation';

const Messages = () => {
    const { selectedConversation } = useConversation();
    const { loading, hasMore, messages, getMessages } = useGetMessages();
    useListenMessages();
    const containerRef = useRef(null);

    const handleScroll = useCallback(() => {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        if (
            scrollTop + clientHeight >= scrollHeight - 5 &&
            !loading &&
            hasMore
        ) {
            getMessages();
        }
    }, [getMessages, selectedConversation?.id, loading, hasMore]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    return (
        <div className="py-2 flex flex-col overflow-auto" ref={containerRef}>
            {messages.map((message) => (
                <Message key={message.id} message={message} />
            ))}
            {loading &&
                [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
            {!loading && messages.length === 0 && (
                <p className="text-center text-gray-500 h-[calc(100vh-220px)] flex items-center justify-center">
                    Send a message to start the conversation
                </p>
            )}
            {!loading && !hasMore && messages.length > 0 && (
                <span className="text-center text-gray-500 py-2">
                    No more messages
                </span>
            )}
        </div>
    );
};

export default Messages;
