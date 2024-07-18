const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const reverifyUser = async (email: string): Promise<Response> => {
    console.log('reverifyUser email', email);
    const respHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;

    const response = await fetch(
        backendURL + '/api/user/reverify/', {
            method: 'POST',
            headers: respHeaders,
            body: JSON.stringify({ email: email })
        }
    )
    console.log('reverifyUser response', response);
    const data = await response.json();
    console.log('reverifyUser data', data);

    if (response.ok) {
        return data;
    } else {
        throw data;
    }
}

export default reverifyUser;