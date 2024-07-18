import { UserCreateRequestType } from "../validators/userValidator";

const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const registerUser = async (props: UserCreateRequestType): Promise<Response> => {
    const respHeaders: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;

    const response = await fetch(
        backendURL + '/api/user/register', {
            method: 'POST',
            headers: respHeaders,
            body: JSON.stringify(props)
        }
    )

    return response;
}

export default registerUser;