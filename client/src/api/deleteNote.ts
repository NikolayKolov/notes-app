const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const deleteNoteById = async (noteId: string, jwt: string): Promise<Response> => {
    const respHeaders: HeadersInit = {
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
    }

    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;

    const response = await fetch(
        backendURL + '/api/note/delete/'+noteId, {
            method: 'POST',
            headers: respHeaders,
        }
    );

    return response;
}

export default deleteNoteById;