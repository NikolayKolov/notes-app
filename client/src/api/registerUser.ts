import { UserCreateRequestType } from "../validators/userValidator";

const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const registerUser = async (props: UserCreateRequestType): Promise<Response> => {

    const response = await fetch(
        backendURL + '/api/user/register', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(props)
        }
    )

    return response;
}

export default registerUser;