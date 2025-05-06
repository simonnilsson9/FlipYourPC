const API_URL = "https://localhost:7177/api";
const token = () => localStorage.getItem("accessToken");

export const fetchInventory = async () => {
    const res = await fetch(`${API_URL}/inventory/inventory`, {
        headers: {
            "Authorization": `Bearer ${token()}`,
            "Content-Type": "application/json"
        }
    });
    return await res.json();
};

export const deleteComponent = async (id) => {
    return await fetch(`${API_URL}/components/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token()}`
        }
    });
};

export const saveComponent = async (component) => {
    const isUpdate = component.id;
    const url = isUpdate ? `${API_URL}/components/${component.id}` : `${API_URL}/components`;
    const method = isUpdate ? "PUT" : "POST";

    return await fetch(url, {
        method,
        headers: {
            "Authorization": `Bearer ${token()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(component)
    });
};
