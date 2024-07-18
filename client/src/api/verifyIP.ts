const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const verifyIP = async (UUID: string): Promise<Response> => {
    const response = await fetch(
        `${backendURL}/api/user/verifyIP/${UUID ?? '' }`, {
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

export default verifyIP;