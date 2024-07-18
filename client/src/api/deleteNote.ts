const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const deleteNoteById = async (noteId: string, jwt: string): Promise<Response> => {
    const response = await fetch(
        backendURL + '/api/note/delete/'+noteId, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
        }
    );

    return response;
}

export default deleteNoteById;