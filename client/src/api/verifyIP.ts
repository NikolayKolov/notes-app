const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const verifyIP = async (UUID: string): Promise<Response> => {
    const respHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;
    
    const response = await fetch(
        `${backendURL}/api/user/verifyIP/${UUID ?? '' }`, {
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

export default verifyIP;