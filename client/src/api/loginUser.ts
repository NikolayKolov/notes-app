const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const loginUser = async (email: string, password: string): Promise<Response> => {
    const formBody = {
        email,
        password
    };

    const respHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;

    console.log('Login User email', email);
    console.log('Login User backendURL', backendURL);
    console.log('Login User VITE_BACKEND_URL', import.meta.env.VITE_BACKEND_URL);

    const response = await fetch(
        backendURL + '/api/user/login', {
            method: 'POST',
            headers: respHeaders,
            body: JSON.stringify(formBody)
        }
    )

    return response;
}

export default loginUser;