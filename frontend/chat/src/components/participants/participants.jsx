import { useRef } from 'react';
import useGetParticipants from '../../hooks/useGetParticipants.js';
import { useSocketContext } from '../../context/SocketContext';

const Participants = () => {
    const { loading, participants } = useGetParticipants();
    const containerRef = useRef(null);
    const { onlineUsers } = useSocketContext();

    return (
        <li>
            <div
                className="px-4 py-2 flex flex-col overflow-auto max-h-[calc(100vh-250px)]"
                ref={containerRef}
            >
                {participants.map((participant) => (
                    <div
                        key={participant.id}
                        className={`avatar ${
                            participant.user_id in onlineUsers ? 'online' : ''
                        } flex items-center w-12 h-15 object-scale-down rounded-full gap-1 py-1 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`}
                    >
                        <img src={participant.profile_picture} />
                        <span>{participant.username}</span>
                        {participant.role !== 'normal' ? (
                            <span className="badge badge-info badge-xs ml-2">
                                {participant.role}
                            </span>
                        ) : (
                            ''
                        )}
                    </div>
                ))}
                {loading && (
                    <span className="loading loading-spinner mx-auto"></span>
                )}
            </div>
        </li>
    );
};

export default Participants;
