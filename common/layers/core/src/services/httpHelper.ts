export const getAsync = async <T>(url: string): Promise<T> => {
    return await fetch(url)
        .then((response) => {
            return response.json();
        })
        .catch((error) => {
            console.error(error);
        });
};

export const postAsync = async <T>(url: string, body: T): Promise<T> => {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            return response.json();
        })
        .catch((error) => {
            console.error(error);
        });
};

export const putAsync = async <T>(url: string, body: T): Promise<T> => {
    return await fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            return response.json();
        })
        .catch((error) => {
            console.error(error);
        });
};

export const deleteAsync = async <T>(url: string): Promise<Response> => {
    return await fetch(url, {
        method: "DELETE",
    })
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
};
