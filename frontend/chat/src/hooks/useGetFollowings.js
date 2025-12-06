import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetFollowings = () => {
    const [loading, setLoading] = useState(false);
    const [followings, setFollowings] = useState([]);

    useEffect(() => {
        const getFollowings = async () => {
            setLoading(true);

            try {
                const res = await fetch(`http://localhost:5000/api/v1/users/followings`, {
                    method: "GET",
                    credentials: "include",
                });

                if (res.status === 204)
                    return setFollowings([]);

                const data = await res.json();
                if (!data.success)
                    throw new Error(data.message);

                setFollowings(data.followings);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        getFollowings();
    }, []);

    return { loading, followings };
};

export default useGetFollowings;
