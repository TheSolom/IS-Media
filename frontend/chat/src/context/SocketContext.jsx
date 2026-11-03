import { createContext, useState, useEffect, useContext } from 'react';
import { useAuthContext } from './AuthContext';
import io from 'socket.io-client';
import { API_URL } from '../utils/api';

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { authUser } = useAuthContext();

    useEffect(() => {
        if (authUser) {
            const socket = io(API_URL, {
                query: {
                    userId: authUser.id,
                },
            });

            setSocket(socket);

            socket.on('getOnlineUsers', (users) => {
                setOnlineUsers(users);
            });

            return () => socket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
