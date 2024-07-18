const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const verifyUser = async (UUID:string): Promise<Response> => {
    const respHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;

    const response = await fetch(
        `${backendURL}/api/user/verify/${UUID ?? '' }`, {
            method: 'GET',
            headers: respHeaders,
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