const API_URL = import.meta.env.VITE_API_URL;
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

    const response = await fetch(url, {
        method,
        headers: {
            "Authorization": `Bearer ${token()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(component)
    });

    const data = await response.json().catch(() => ({}));

    return {
        success: response.ok,
        status: response.status,
        data: data
    };
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
export const createPC = async (pcData) => {
    const response = await fetch(`${API_URL}/pcs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token()}`
        },
        body: JSON.stringify(pcData)
    });

    const data = await response.json().catch(() => ({}));

    return {
        success: response.ok,
        status: response.status,
        data: data
    };
};

// Funktion för att uppdatera ett PC-bygg
export const updatePC = async (pcId, pcData) => {
    const response = await fetch(`${API_URL}/pcs/${pcId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(pcData),
    });

    const data = await response.json().catch(() => ({}));

    return {
        success: response.ok,
        status: response.status,
        data: data
    };
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

// Funktion för att uppdatera användaren
export const updateUser = async (userUpdateData) => {
    const response = await fetch(`${API_URL}/users/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify(userUpdateData)
    });

    const data = await response.json().catch(() => ({}));

    return {
        success: response.ok,
        status: response.status,
        data: data
    };
};

// Funktion för att hämta användardata baserat på ID
export const getUserById = async (userId, token) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Error fetching user");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getAllUsers = async (token) => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Error fetching users");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchMyUser = async () => {
    const response = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token()}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) throw new Error("Error fetching current user");
    return await response.json();
};

// Funktion för att byta lösenord
export const changePassword = async (passwordData) => {
    try {
        const response = await fetch(`${API_URL}/users/change-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token()}`,
            },
            body: JSON.stringify(passwordData),
        });

        const responseData = await response.json().catch(() => null);

        if (!response.ok) {
            // ModelState errors
            if (responseData?.errors) {
                throw { type: "validation", errors: responseData.errors };
            }
            // Generic error message
            throw new Error(responseData?.error || responseData?.message || "Error changing password");
        }

        return responseData; // Success (ex: { message: "Lösenordet har uppdaterats." })
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};

export const updateUserRole = async (roleData) => {
    const response = await fetch(`${API_URL}/users/update-role`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(roleData)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update user role");
    }

    return await response.text();
};

export const deleteUser = async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token()}`
        }
    });

    if (!response.ok) {
        const data = await response.text();
        throw new Error(data || "Kunde inte radera användare");
    }

    return true;
};

export const updateUserAsAdmin = async (userId, userData) => {
    const response = await fetch(`${API_URL}/users/admin-update-user/${userId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json().catch(() => ({}));

    return {
        success: response.ok,
        status: response.status,
        data: data
    };
};

export const changePasswordAsAdmin = async (data) => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/users/admin-change-password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const responseData = await response.json().catch(() => ({}));

    return {
        success: response.ok,
        status: response.status,
        data: responseData
    };
};

export const exportInventory = async () => {
    const res = await fetch(`${API_URL}/export/export-excel`, {
        headers: {
            "Authorization": `Bearer ${token()}`
        }
    });

    if (!res.ok) {
        throw new Error("Kunde inte hämta exportfilen.");
    }

    const blob = await res.blob();
    return blob;
};

export const exportPCs = async (queryString = "") => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/export/export-pcs?${queryString}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Exportmisslyckande");
    }

    const blob = await response.blob();
    return blob;
};

export const calculateVAT = async (pcId, token) => {
    const response = await fetch(`${API_URL}/pcs/${pcId}/calculate-vat`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Kunde inte beräkna moms.");
    }

    return await response.json();
};
