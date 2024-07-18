import { CreateNoteType } from "../validators/noteValidator";

const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const createNote = async (user: CreateNoteType, jwt: string): Promise<Response> => {
    const response = await fetch(
        backendURL + '/api/note/create', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`
            },
            body: JSON.stringify(user)
        }
    )

    return response;
}

export default createNote;