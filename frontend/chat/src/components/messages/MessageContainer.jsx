import { useEffect, useState } from 'react';
import useConversation from '../../zustand/useConversation';
import MessageInput from './MessageInput';
import Messages from './Messages';
import Participants from '../participants/participants';
import { TiMessages } from 'react-icons/ti';
import { useAuthContext } from '../../context/AuthContext';

const MessageContainer = () => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);

    useEffect(() => {
        return () => setSelectedConversation(null);
    }, [setSelectedConversation]);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    return (
        <div className="w-full flex flex-col">
            {!selectedConversation ? (
                <NoChatSelected />
            ) : (
                <>
                    <div className="bg-slate-500 px-4 py-2 mb-2 flex items-center">
                        <span className="text-gray-900 font-bold">
                            {selectedConversation.title}
                        </span>
                        <img
                            src={selectedConversation.image}
                            className="w-7 h-7 object-scale-down rounded-full ml-2"
                            alt="Conversation"
                        />

                        <div className="ml-auto relative">
                            <button
                                id="dropdownAvatarNameButton"
                                onClick={toggleDropdown}
                                className="flex items-center text-sm pe-1 font-medium text-gray-900 rounded-full hover:text-blue-600 dark:hover:text-blue-500 md:me-0 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-white"
                                type="button"
                            >
                                <span className="sr-only">Open user menu</span>
                                <svg
                                    className="w-2.5 h-2.5 ms-3"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 10 6"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 4 4 4-4"
                                    />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div
                                    id="dropdownAvatarName"
                                    className="z-10 absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
                                >
                                    {selectedConversation.description && (
                                        <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            <div className="truncate">
                                                {
                                                    selectedConversation.description
                                                }
                                            </div>
                                        </div>
                                    )}
                                    <ul
                                        className="py-2 text-sm text-gray-700 dark:text-gray-200"
                                        aria-labelledby="dropdownAvatarNameButton"
                                    >
                                        <li>
                                            <a
                                                href="#"
                                                onClick={() =>
                                                    setShowParticipants(
                                                        !showParticipants,
                                                    )
                                                }
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 dark:hover:text-white"
                                            >
                                                Participants
                                            </a>
                                        </li>
                                        {showParticipants && <Participants />}
                                        {!showParticipants && (
                                            <li>
                                                <a
                                                    href="#"
                                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 dark:hover:text-white"
                                                >
                                                    Settings
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <Messages />
                    <MessageInput />
                </>
            )}
        </div>
    );
};

export default MessageContainer;

const NoChatSelected = () => {
    const { authUser } = useAuthContext();

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="px-4 text-center sm:text-lg md:text-xl text-gray-500 font-semibold flex flex-col items-center gap-2">
                <p>Welcome 👋 {authUser.username}</p>
                <p>Select a chat to start messaging</p>
                <TiMessages className="text-3xl md:text-6xl text-center" />
            </div>
        </div>
    );
};
