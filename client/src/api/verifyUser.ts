const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const verifyUser = async (UUID:string): Promise<Response> => {
    const response = await fetch(
        `${backendURL}/api/user/verify/${UUID ?? '' }`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        }
    )

    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        throw data;
    }
}

export default verifyUser;