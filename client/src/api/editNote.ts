const backendURL = import.meta.env.VITE_BACKEND_URL || "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const editNote = async (note: any, jwt: string): Promise<Response> => {
    const respHeaders: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
    };

    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;

    const response = await fetch(
        backendURL + '/api/note/edit/'+note.id, {
            method: 'POST',
            headers: respHeaders,
            body: JSON.stringify(note)
        }
    )

    return response;
}

export default editNote;