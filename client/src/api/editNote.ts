const backendURL = import.meta.env.VITE_BACKEND_URL || "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const editNote = async (note: any, jwt: string): Promise<Response> => {
    const response = await fetch(
        backendURL + '/api/note/edit/'+note.id, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`
            },
            body: JSON.stringify(note)
        }
    )

    return response;
}

export default editNote;