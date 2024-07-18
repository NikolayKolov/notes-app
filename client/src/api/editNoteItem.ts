const backendURL = import.meta.env.VITE_BACKEND_URL || "";

const editNoteItem = async (noteId: number, checklistId: string, isDone: boolean, jwt: string): Promise<Response> => {
    const response = await fetch(
        `${backendURL}/api/note/editnoteitem/${noteId}&${checklistId}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ isDone })
        }
    )

    return response;
}

export default editNoteItem;