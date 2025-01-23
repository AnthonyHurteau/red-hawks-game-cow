export const getAsync = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    const data = (await response.json()) as T;
    return data;
};

export const postAsync = async <T>(url: string, body: T): Promise<T> => {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = (await response.json()) as T;
    return data;
};

export const putAsync = async <T>(url: string, body: T): Promise<T> => {
    const response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = (await response.json()) as T;
    return data;
};

export const deleteAsync = async <T>(url: string, body: T): Promise<Response> => {
    const response = await fetch(url, {
        method: "DELETE",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response;
};
