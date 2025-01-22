export const getAsync = async (url: string): Promise<Response> => {
    const response = await fetch(url);
    return response;
};

export const postAsync = async <T>(url: string, body: T): Promise<Response> => {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response;
};

export const putAsync = async <T>(url: string, body: T): Promise<Response> => {
    const response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response;
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
