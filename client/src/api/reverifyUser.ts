const reverifyUser = async (email: string): Promise<Response> => {
    console.log('reverifyUser email', email);
    const response = await fetch(
        '/api/user/reverify/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email })
        }
    )
    console.log('reverifyUser response', response);
    const data = await response.json();
    console.log('reverifyUser data', data);

    if (response.ok) {
        return data;
    } else {
        throw data;
    }
}

export default reverifyUser;