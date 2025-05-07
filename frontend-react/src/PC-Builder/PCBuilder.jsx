import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    getAllPCs,
    createPC,
    addComponentsToPC,
    deletePC,
    updatePC,
    fetchInventory,
    removeComponentFromPC
} from "../services/API";

const ComponentTypeEnum = {
    GPU: "GPU",
    CPU: "CPU",
    PSU: "PSU",
    Motherboard: "Motherboard",
    RAM: "RAM",
    SSD: "SSD",
    Case: "Case",
    CPUCooler: "CPUCooler",
    Other: "Other"
};

const PCBuilder = () => {
    const [pcs, setPcs] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddComponentsModal, setShowAddComponentsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAvailableComponentsModal, setShowAvailableComponentsModal] = useState(false);
    const [currentPCId, setCurrentPCId] = useState(null);
    const [currentPCComponents, setCurrentPCComponents] = useState([]);
    const [pcName, setPcName] = useState("");
    const [pcDescription, setPcDescription] = useState("");
    const [pcPrice, setPcPrice] = useState("");
    const [pcImageURL, setPcImageURL] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchPCs();
        fetchComponents();
    }, []);

    const fetchPCs = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            const response = await getAllPCs(token);
            setPcs(response || []);
        } catch (error) {
            console.error("Error fetching PCs:", error);
        }
    };

    const fetchComponents = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            const response = await fetchInventory(token);
            setAvailableComponents(response.components || []);
        } catch (error) {
            console.error("Error fetching components:", error);
        }
    };

    const handleDeletePC = async (pcId) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            await deletePC(pcId, token);
            fetchPCs();
        } catch (error) {
            console.error("Error deleting PC:", error);
        }
    };

    const handleCreatePC = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token || !pcName) return;
        try {
            const pcData = { name: pcName };
            const createdPC = await createPC(pcData, token);
            if (createdPC && createdPC.id) {
                fetchPCs();
                setPcName("");
                setShowCreateModal(false);
            } else {
                console.error("PC creation failed, no ID returned");
            }
        } catch (error) {
            console.error("Error creating PC:", error);
        }
    };

    const handleUpdatePC = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token || !pcName || !pcDescription || !pcPrice) return;
        try {
            const updatedPCData = {
                name: pcName,
                description: pcDescription,
                price: parseInt(pcPrice),
                imageURL: pcImageURL
            };
            await updatePC(currentPCId, updatedPCData, token);
            fetchPCs();
            setPcName("");
            setPcDescription("");
            setPcPrice("");
            setPcImageURL("");
            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating PC:", error);
        }
    };

    const handleAddComponent = async (componentId) => {
        const token = localStorage.getItem("accessToken");
        if (!token || !currentPCId || !componentId) return;
        try {
            await addComponentsToPC(currentPCId, [componentId], token);
            await fetchPCs();
            await fetchComponents();
        } catch (error) {
            console.error("Error adding component to PC:", error);
        }
    };

    const handleRemoveComponent = async (componentId) => {
        const token = localStorage.getItem("accessToken");
        if (!token || !currentPCId || !componentId) return;

        try {
            await removeComponentFromPC(currentPCId, componentId, token);

            setCurrentPCComponents((prev) => prev.filter(c => c.id !== componentId));

            fetchPCs();
            fetchComponents();
        } catch (error) {
            console.error("Error removing component from PC:", error);
        }
    };

    return (
        <div>
            <h1>Alla dina PC-bygg</h1>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Skapa nytt PC-bygg
            </Button>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>PC Namn</th>
                        <th>Beskrivning</th>
                        <th>Pris</th>
                        <th>Komponenter</th>
                        <th>Åtgärder</th>
                    </tr>
                </thead>
                <tbody>
                    {pcs.length > 0 ? pcs.map((pc) => (
                        <tr key={pc.id}>
                            <td>{pc.name}</td>
                            <td>{pc.description}</td>
                            <td>{pc.price} kr</td>
                            <td>
                                {pc.components && pc.components.length > 0 ? (
                                    <ul className="mb-0">
                                        {pc.components.map((component) => (
                                            <li key={component.id}>{component.type}: {component.name}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>Inga komponenter</span>
                                )}
                            </td>
                            <td>
                                <Button
                                    variant="info"
                                    onClick={() => {
                                        setCurrentPCId(pc.id);
                                        setPcName(pc.name);
                                        setPcDescription(pc.description);
                                        setPcPrice(pc.price);
                                        setPcImageURL(pc.imageURL || "");
                                        setShowEditModal(true);
                                    }}
                                >
                                    Redigera
                                </Button>{" "}
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setCurrentPCId(pc.id);
                                        setCurrentPCComponents(pc.components || []);
                                        setShowAddComponentsModal(true);
                                    }}
                                >
                                    Visa komponenter
                                </Button>{" "}
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        setCurrentPCId(pc.id);
                                        setShowAvailableComponentsModal(true);
                                    }}
                                >
                                    Lägg till komponent
                                </Button>{" "}
                                <Button variant="danger" onClick={() => handleDeletePC(pc.id)}>
                                    Ta bort
                                </Button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5">Inga PC-bygg tillgängliga.</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Skapa nytt PC-bygg</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formPCName">
                            <Form.Label>PC Namn</Form.Label>
                            <Form.Control
                                type="text"
                                value={pcName}
                                onChange={(e) => setPcName(e.target.value)}
                                placeholder="Skriv namn på PC:n"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Stäng
                    </Button>
                    <Button variant="primary" onClick={handleCreatePC}>
                        Skapa PC
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Redigera PC</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formPCName">
                            <Form.Label>PC Namn</Form.Label>
                            <Form.Control
                                type="text"
                                value={pcName}
                                onChange={(e) => setPcName(e.target.value)}
                                placeholder="Skriv namn på PC:n"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPCDescription">
                            <Form.Label>Beskrivning</Form.Label>
                            <Form.Control
                                type="text"
                                value={pcDescription}
                                onChange={(e) => setPcDescription(e.target.value)}
                                placeholder="Beskriv PC:n"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPCPrice">
                            <Form.Label>Pris</Form.Label>
                            <Form.Control
                                type="number"
                                value={pcPrice}
                                onChange={(e) => setPcPrice(e.target.value)}
                                placeholder="Pris"
                            />
                        </Form.Group>
                        <Form.Group controlId="formPCImageURL">
                            <Form.Label>Bild URL</Form.Label>
                            <Form.Control
                                type="text"
                                value={pcImageURL}
                                onChange={(e) => setPcImageURL(e.target.value)}
                                placeholder="Bildens URL"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Stäng
                    </Button>
                    <Button variant="primary" onClick={handleUpdatePC}>
                        Uppdatera PC
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAddComponentsModal} onHide={() => setShowAddComponentsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Komponenter i detta bygge</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentPCComponents.length > 0 ? (
                        <ul>
                            {currentPCComponents.map((component) => (
                                <li key={component.id}>
                                    {component.type}: {component.name}
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="ms-2"
                                        onClick={() => handleRemoveComponent(component.id)}
                                    >
                                        Ta bort från bygge
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Inga komponenter kopplade till detta bygge.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddComponentsModal(false)}>
                        Stäng
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAvailableComponentsModal} onHide={() => setShowAvailableComponentsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Tillgängliga komponenter</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {availableComponents.length > 0 ? (
                        <ul>
                            {availableComponents.map((component) => (
                                <li key={component.id}>
                                    {component.type}: {component.name} — {component.manufacturer}
                                    <Button
                                        size="sm"
                                        className="ms-2"
                                        onClick={() => handleAddComponent(component.id)}
                                    >
                                        Lägg till i bygge
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Inga tillgängliga komponenter just nu.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAvailableComponentsModal(false)}>
                        Stäng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PCBuilder;