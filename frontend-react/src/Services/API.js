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

// Funktion för att hämta alla PCs (PC-bygg)
export const getAllPCs = async (token) => {
    try {
        const response = await fetch(`${API_URL}/pcs`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, 
            },
        });

        if (response.ok) {
            return await response.json(); 
        } else {
            throw new Error("Error fetching PCs");
        }
    } catch (error) {
        console.error(error);
        throw error; 
    }
};

// Funktion för att skapa ett nytt PC-bygg
export const createPC = async (pcData, token) => {
    try {
        const response = await fetch(`${API_URL}/pcs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(pcData), 
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Error creating PC");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Funktion för att uppdatera ett PC-bygg
export const updatePC = async (pcId, pcData, token) => {
    try {
        const response = await fetch(`${API_URL}/pcs/${pcId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, 
            },
            body: JSON.stringify(pcData), 
        });

        if (response.ok) {
            return await response.json(); 
        } else {
            throw new Error("Error updating PC");
        }
    } catch (error) {
        console.error(error);
        throw error; 
    }
};

// Funktion för att ta bort ett PC-bygg
export const deletePC = async (pcId, token) => {
    try {
        const response = await fetch(`${API_URL}/pcs/${pcId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            return "PC deleted successfully"; 
        } else {
            throw new Error("Error deleting PC");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Funktion för att lägga till komponenter till ett PC-bygg
export const addComponentsToPC = async (pcId, componentIds, token) => {
    try {
        const response = await fetch(`${API_URL}/pcs/${pcId}/add-components`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, 
            },
            body: JSON.stringify(componentIds), 
        });

        if (response.ok) {
            return await response.json(); 
        } else {
            throw new Error("Error adding components to PC");
        }
    } catch (error) {
        console.error(error);
        throw error; 
    }
};

// Funktion för att uppdatera komponenter i ett befintligt PC-bygge
export const updateComponentsInPC = async (pcId, componentMap, token) => {
    try {
        const response = await fetch(`${API_URL}/pcs/${pcId}/components`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(componentMap), // Exempel: { "CPU": "guid1", "GPU": "guid2" }
        });

        if (response.ok) {
            return true; // eller return await response.json(); om backend skickar något
        } else {
            throw new Error("Error updating PC components");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const removeComponentFromPC = async (pcId, componentId, token) => {
    const response = await fetch(`${API_URL}/pcs/${pcId}/remove-component`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(componentId)
    });

    if (!response.ok) {
        throw new Error("Failed to remove component from PC");
    }

    return await response.json();
};