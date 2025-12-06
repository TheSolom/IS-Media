import { useState, useEffect } from 'react';
import useConversation from '../../zustand/useConversation';
import useSearchConversations from '../../hooks/useSearchConversations';
import useSearchUsers from '../../hooks/useSearchUsers';
import useGetFollowings from '../../hooks/useGetFollowings';
import useGetDMConversation from '../../hooks/useGetDMConversation.js';
import useCreateConversation from '../../hooks/useCreateConversation';
import useGetConversation from '../../hooks/useGetConversation';
import { MdChat } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useSocketContext } from '../../context/SocketContext';

const SearchInput = () => {
    const [searchConversation, setSearchConversation] = useState('');
    const { loading, conversations } =
        useSearchConversations(searchConversation);
    const [showForm, setShowForm] = useState(false);
    const [searchUser, setSearchUser] = useState('');
    const { loading: searchLoading, users } = useSearchUsers(searchUser);
    const { loading: followingLoading, followings } = useGetFollowings();
    const { loading: getDMConversationLoading, getDMConversation } =
        useGetDMConversation();
    const { loading: createConversationLoading, createConversation } =
        useCreateConversation();
    const { loading: getConversationLoading, getConversation } =
        useGetConversation();
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers } = useSocketContext();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowForm(false);
                setSearchUser('');
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (conversation) => {
        if (!searchConversation) return;

        if (conversation) {
            setSelectedConversation(conversation);
            setSearchConversation('');
        } else toast.error('No such conversation found!');
    };

    const handleCreateDMConversation = async (user) => {
        if (!user) return;

        let conversation = await getDMConversation(user.user_id);

        if (!conversation) {
            const conversationId = await createConversation(user);
            conversation = await getConversation(conversationId);
        }

        if (conversation) {
            setSelectedConversation(conversation);
            setSearchUser('');
            setShowForm(false);
        }
    };

    const handleToggleForm = () => {
        setShowForm(!showForm);
    };

    return (
        <div>
            <div className="divider">
                <input
                    type="text"
                    placeholder="Search conversations…"
                    className="input input-bordered input-xs rounded-full"
                    value={searchConversation}
                    onChange={(e) => setSearchConversation(e.target.value)}
                />
                <button
                    type="submit"
                    onClick={handleToggleForm}
                    className="btn btn-circle btn-xs bg-sky-700 text-white"
                >
                    <MdChat className="w-5 h-4" />
                </button>
            </div>
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-10">
                    <div className="flex items-center justify-center min-h-screen">
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="bg-white p-6 rounded-lg shadow-xl"
                        >
                            <button
                                className="btn btn-xs btn-circle bg-red-500 text-white relative float-right ml-3"
                                onClick={handleToggleForm}
                            >
                                X
                            </button>
                            <input
                                type="text"
                                placeholder="Search Users…"
                                className="input input-bordered input-xs rounded-full mb-4"
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                            />
                            {searchUser && users.length > 0 && (
                                <div className="flex flex-row flex-wrap gap-4 py-2 overflow-auto max-h-[70vh] max-w-[30vh] text-xs text-center">
                                    {users.map((user) => (
                                        <div
                                            className={`hover:bg-sky-100 rounded p-0 py-0 cursor-pointer`}
                                            onClick={() =>
                                                handleCreateDMConversation(user)
                                            }
                                            key={user.id}
                                        >
                                            <div
                                                className={`avatar ${
                                                    user.id in onlineUsers
                                                        ? 'online'
                                                        : ''
                                                }`}
                                            >
                                                <div className="w-5 rounded-full">
                                                    <img
                                                        src={
                                                            user.profile_picture
                                                        }
                                                        alt=""
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <p className="font-bold text-gray-500">
                                                    {user.username}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!searchUser && followings.length > 0 && (
                                <>
                                    <p className="text-center text-xs font-bold text-gray-500 mb-2">
                                        Suggested followings
                                    </p>
                                    <div className="py-1 flex flex-col overflow-auto">
                                        {followings.map((user) => (
                                            <div
                                                className={`flex gap-2 items-center hover:bg-sky-500 rounded p-5 py-0 cursor-pointer`}
                                                onClick={() =>
                                                    handleCreateDMConversation(
                                                        user,
                                                    )
                                                }
                                                key={user.id}
                                            >
                                                <div
                                                    className={`avatar ${
                                                        user.id in onlineUsers
                                                            ? 'online'
                                                            : ''
                                                    }`}
                                                >
                                                    <div className="w-5 rounded-full">
                                                        <img
                                                            src={
                                                                user.profile_picture
                                                            }
                                                            alt=""
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col flex-1 py-1">
                                                    <p className="font-bold text-gray-500 text-xs">
                                                        {user.username}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
            {searchConversation && conversations.length > 0 && (
                <div className="py-1 flex flex-col overflow-auto">
                    {conversations.map((conversation) => (
                        <div
                            className={`flex gap-2 items-center hover:bg-sky-500 rounded p-5 py-0 cursor-pointer ${
                                selectedConversation?.id === conversation.id
                                    ? 'bg-sky-500'
                                    : ''
                            }`}
                            onClick={() => handleSubmit(conversation)}
                            key={conversation.id}
                        >
                            <div
                                className={`avatar ${
                                    conversation.dm_receiver_id in onlineUsers
                                        ? 'online'
                                        : ''
                                }`}
                            >
                                <div className="w-5 rounded-full">
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
                    ))}
                </div>
            )}
            {/* {loading ? (
                <span className="loading loading-spinner mx-auto w-5"></span>
            ) : null} */}
        </div>
    );
};

export default SearchInput;
