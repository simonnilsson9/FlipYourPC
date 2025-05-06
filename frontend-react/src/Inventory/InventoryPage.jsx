import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { fetchInventory, deleteComponent, saveComponent } from "../Services/API";

const InventoryPage = () => {
    const [components, setComponents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentComponent, setCurrentComponent] = useState(null);
    const [totalValue, setTotalValue] = useState(0);
    const [infoMessage, setInfoMessage] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        if (token) {
            loadInventory();
        }
    }, []);

    const loadInventory = async () => {
        try {
            const data = await fetchInventory();

            if (data.statusCode === "Unauthorized" || !data) {
                setInfoMessage("Du måste vara inloggad för att se ditt lager.");
                return;
            }

            if (data.components?.length === 0) {
                setInfoMessage("Ditt lager är tomt. Lägg till en komponent!");
            } else {
                setComponents(data.components);
                calculateTotalValue(data.components);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setInfoMessage("Ett fel uppstod vid hämtning av lagret.");
        }
    };

    const calculateTotalValue = (components) => {
        const value = components.reduce((acc, c) => acc + c.price * c.totalStock, 0);
        setTotalValue(value);
    };

    const handleAddComponent = () => {
        setCurrentComponent(null);
        setShowModal(true);
    };

    const handleEditComponent = (component) => {
        setCurrentComponent(component);
        setShowModal(true);
    };

    const handleDeleteComponent = async (id) => {
        try {
            const response = await deleteComponent(id);
            if (response.ok) {
                loadInventory();
            }
        } catch (error) {
            console.error("Error deleting component:", error);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            const filtered = components.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setComponents(filtered);
        } else {
            loadInventory();
        }
    };

    const handleSaveComponent = async () => {
        if (!currentComponent?.name || !currentComponent?.price || !currentComponent?.manufacturer || !currentComponent?.totalStock || !currentComponent?.type) {
            alert("Alla fält måste fyllas i.");
            return;
        }

        const componentPayload = {
            id: currentComponent?.id,
            name: currentComponent.name,
            price: parseInt(currentComponent.price),
            manufacturer: currentComponent.manufacturer,
            totalStock: parseInt(currentComponent.totalStock),
            type: currentComponent.type
        };

        try {
            const response = await saveComponent(componentPayload);
            if (response.ok) {
                setShowModal(false);
                loadInventory();
            } else {
                const errorText = await response.text();
                console.error("Failed to save component:", errorText);
                alert("Kunde inte spara komponenten. Kontrollera data eller försök igen.");
            }
        } catch (error) {
            console.error("Error saving component:", error);
            alert("Ett fel uppstod när komponenten skulle sparas.");
        }
    };

    if (!token) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">
                    Du måste vara inloggad för att kunna använda lagret.
                    <br />
                    <Link to="/login">Klicka här för att logga in</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h1>Lager</h1>

            <div className="d-flex justify-content-between mb-4">
                <Button variant="primary" onClick={handleAddComponent}>Lägg till komponent</Button>
                <div className="d-flex">
                    <input
                        type="text"
                        placeholder="Sök komponent"
                        className="form-control me-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Sök</Button>
                </div>
            </div>

            {infoMessage && <div className="alert alert-info">{infoMessage}</div>}

            <h4>Totalt lagervärde: {totalValue} kr</h4>

            {components.length > 0 && (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Namn</th>
                            <th>Pris</th>
                            <th>Antal i lager</th>
                            <th>Typ</th>
                            <th>Åtgärder</th>
                        </tr>
                    </thead>
                    <tbody>
                        {components.map((component) => (
                            <tr key={component.id}>
                                <td>{component.name}</td>
                                <td>{component.price} kr</td>
                                <td>{component.totalStock}</td>
                                <td>{component.type}</td>
                                <td>
                                    <Button variant="info" onClick={() => handleEditComponent(component)}>Redigera</Button>{' '}
                                    <Button variant="danger" onClick={() => handleDeleteComponent(component.id)}>Ta bort</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentComponent?.id ? "Redigera komponent" : "Lägg till komponent"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Komponentnamn</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentComponent?.name || ''}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formPrice">
                            <Form.Label>Pris</Form.Label>
                            <Form.Control
                                type="number"
                                value={currentComponent?.price || ''}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, price: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formManufacturer">
                            <Form.Label>Tillverkare</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentComponent?.manufacturer || ''}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, manufacturer: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formTotalStock">
                            <Form.Label>Antal i lager</Form.Label>
                            <Form.Control
                                type="number"
                                value={currentComponent?.totalStock || ''}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, totalStock: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formType">
                            <Form.Label>Komponenttyp</Form.Label>
                            <Form.Control
                                as="select"
                                value={currentComponent?.type || ''}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, type: e.target.value })}
                            >
                                <option value="">Välj typ</option>
                                <option value="GPU">Grafikkort</option>
                                <option value="PSU">Nätaggregat</option>
                                <option value="CPU">Processor</option>
                                <option value="Motherboard">Moderkort</option>
                                <option value="RAM">RAM</option>
                                <option value="SSD">SSD</option>
                                <option value="Case">Chassi</option>
                                <option value="CPUCooler">CPU-Kylare</option>
                                <option value="Other">Annat</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Stäng</Button>
                    <Button variant="primary" onClick={handleSaveComponent}>
                        {currentComponent?.id ? "Spara ändringar" : "Lägg till komponent"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default InventoryPage;