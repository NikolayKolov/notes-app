const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const editNoteItem = async (noteId: number, checklistId: string, isDone: boolean, jwt: string): Promise<Response> => {
    const respHeaders: HeadersInit = {
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
    };

    if (backendURL) respHeaders["Access-Control-Allow-Origin"] = backendURL;

    const response = await fetch(
        `${backendURL}/api/note/editnoteitem/${noteId}&${checklistId}`, {
            method: 'POST',
            headers: respHeaders,
            body: JSON.stringify({ isDone })
        }
    )

    return response;
}

export default editNoteItem;