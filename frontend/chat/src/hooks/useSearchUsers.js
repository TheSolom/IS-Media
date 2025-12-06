import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useSearchUsers = (username) => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);

            try {
                const res = await fetch(`http://localhost:5000/api/v1/users/${username}/search`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();
                if (!data.success)
                    throw new Error(data.message);

                setUsers(data.users);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (username)
            getUsers(username);
    }, [username]);

    return { loading, users };
};

export default useSearchUsers;
