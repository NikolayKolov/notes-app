import { CreateNoteType } from "../validators/noteValidator";

const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const createNote = async (user: CreateNoteType, jwt: string): Promise<Response> => {
    const respHeaders: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
    };

    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;

    const response = await fetch(
        backendURL + '/api/note/create', {
            method: 'POST',
            headers: respHeaders,
            body: JSON.stringify(user)
        }
    )

    return response;
}

export default createNote;