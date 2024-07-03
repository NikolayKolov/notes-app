const editNoteItem = async (noteId: number, checklistId: string, isDone: boolean, jwt: string): Promise<Response> => {
    const response = await fetch(
        `/api/note/editnoteitem/${noteId}&${checklistId}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`
            },
            body: JSON.stringify({ isDone })
        }
    )

    return response;
}

export default editNoteItem;