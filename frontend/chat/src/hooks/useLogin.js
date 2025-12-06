import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useLogin = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const login = async (emailOrUsername, password) => {
		const success = handleInputErrors(emailOrUsername, password);
		if (!success)
			return;

		setLoading(true);

		try {
			const loginRes = await fetch("http://localhost:5000/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ emailOrUsername, password }),
				credentials: "include",
			});

			if (!loginRes.ok)
				throw new Error('Something went wrong');

			const loginData = await loginRes.json();
			if (!loginData.success)
				throw new Error(loginData.cause ? loginData.cause[0].msg : loginData.message);

			const { userId } = loginData;

			const userRes = await fetch(`http://localhost:5000/api/v1/users/${userId}/profile`, {
				method: "GET",
				credentials: "include",
			});

			const userData = await userRes.json();
			if (!userData.success)
				throw new Error(userData.cause[0].msg);

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
