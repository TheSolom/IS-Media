import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { BASE_API_URL } from "../utils/api";

const useLogin = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const login = async (emailOrUsername, password) => {
		const success = handleInputErrors(emailOrUsername, password);
		if (!success)
			return;

		setLoading(true);

		try {
			const loginRes = await fetch(`${BASE_API_URL}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ emailOrUsername, password }),
				credentials: "include",
			});

			const loginData = await loginRes.json();
			if (!loginData.success) {
				const errMsg = loginData.cause?.[0]?.msg || loginData.message || 'Something went wrong';
				throw new Error(errMsg);
			}

			const userId = loginData.user?.id || loginData.userId;

			const userRes = await fetch(`${BASE_API_URL}/users/${userId}/profile`, {
				method: "GET",
				credentials: "include",
			});

			const userData = await userRes.json();
			if (!userData.success) {
				const errMsg = userData.cause?.[0]?.msg || userData.message || 'Failed to fetch user';
				throw new Error(errMsg);
			}

			const { user } = userData;

			localStorage.setItem("chat-user", JSON.stringify(user));
			setAuthUser(user);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, login };
};
export default useLogin;

function handleInputErrors(emailOrUsername, password) {
	if (!emailOrUsername || !password) {
		toast.error("Please fill in all fields");
		return false;
	}

	return true;
}
