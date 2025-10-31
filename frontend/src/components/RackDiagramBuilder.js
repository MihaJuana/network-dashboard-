import React, { useState, useRef, useEffect } from "react";

// ✅ Fix this part
const API_URL = process.env.REACT_APP_API_URL || "/api";


export default function RackDiagramBuilder() {
    const [sites, setSites] = useState([]);
    const [rackData, setRackData] = useState({}); // { siteId: { rackId: { size, slots: [] } } }
    const [rackNames, setRackNames] = useState({});
    const [rackEdit, setRackEdit] = useState(null);
    const [collapsedSites, setCollapsedSites] = useState({});
    const [siteRackSizes, setSiteRackSizes] = useState({}); // per-site selected size for adding racks

    const draggedElement = useRef(null);

    useEffect(() => {
        handleLoadData();
    }, []);

    const equipmentLibrary = [
        { type: "server", text: "🖥️ Server (1U)", u: 1 },
        { type: "switch", text: "🔀 Switch (1U)", u: 1 },
        { type: "router", text: "🌐 Router (2U)", u: 2 },
        { type: "firewall", text: "🛡️ Firewall (2U)", u: 2 },
        { type: "storage", text: "💾 Storage Array (3U)", u: 3 },
        { type: "ups", text: "🔋 UPS (4U)", u: 4 },
        { type: "patchpanel", text: "🔗 Patch Panel (2U)", u: 2 },
        { type: "loadbalancer", text: "⚖️ Load Balancer (1U)", u: 1 },
        { type: "nas", text: "📦 NAS (2U)", u: 2 },
        { type: "kvm", text: "⌨️ KVM Switch (1U)", u: 1 },
        { type: "pdu", text: "🔌 PDU (1U)", u: 1 },
        { type: "modem", text: "📡 Modem (1U)", u: 1 },
        { type: "rackcooler", text: "❄️ Rack Cooler (2U)", u: 2 },
        { type: "mediaserver", text: "▶️ Media Server (2U)", u: 2 },
        { type: "database", text: "🗄️ Database (3U)", u: 3 },
        { type: "voip", text: "☎️ VoIP Gateway (1U)", u: 1 },
    ];

    const rackOptions = [24, 36, 42, 48];
    const DEFAULT_RACK_SIZE = 42;
    const UNIT_HEIGHT = 30;

    // const addSite = () => {
    //     const newSite = { id: null, location: "", floor: "" };
    //     setSites((prev) => [...prev, newSite]);
    //     setRackData((prev) => ({ ...prev, [newSite.id || "temp_" + Date.now()]: {} }));
    // };


    const addSite = () => {
        // ✅ Always generate a unique temporary ID for each new site
        const tempId = "temp_" + Math.random().toString(36).substr(2, 9);

        const newSite = { id: tempId, location: "", floor: "" };

        // ✅ Add new site to the sites list
        setSites((prev) => [...prev, newSite]);

        // ✅ Create a fresh empty rack set for this site
        setRackData((prev) => ({
            ...prev,
            [tempId]: {},
        }));

        // ✅ Initialize default rack size for this site
        setSiteRackSizes((prev) => ({
            ...prev,
            [tempId]: DEFAULT_RACK_SIZE,
        }));

        // ✅ Collapse state initialization (optional)
        setCollapsedSites((prev) => ({
            ...prev,
            [tempId]: false,
        }));
    };


    const deleteSite = async (siteId) => {
  if (String(siteId).startsWith("temp_")) {
    // frontend-only site → just remove locally
    setSites((prev) => prev.filter((s) => s.id !== siteId));
    return;
  }

  if (!window.confirm("Are you sure you want to delete this site?")) return;

  try {
    const res = await fetch(`${API_URL}/delete/site/${siteId}`, { method: "DELETE" });
    const text = await res.text();
    let json;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Server returned invalid JSON: ${text.slice(0, 100)}`);
    }

    if (!res.ok) throw new Error(json.error || "Delete failed");

    setSites((prev) => prev.filter((s) => s.id !== siteId));
    handleLoadData();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Delete error: " + err.message);
  }
};


    const addRack = (siteId) => {
        const size = siteRackSizes[siteId] || DEFAULT_RACK_SIZE;
        const rackId = `rack-${Date.now()}`;
        setRackData((prev) => {
            const siteRacks = { ...(prev[siteId] || {}) };
            siteRacks[rackId] = { size, slots: Array(size).fill(null) };
            return { ...prev, [siteId]: siteRacks };
        });
    };

    const handleDragStart = (e, item) => {
        draggedElement.current = item;
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleDrop = (siteId, rackId, slotIndex) => {
        const item = draggedElement.current;
        if (!item) return;

        setRackData((prev) => {
            const siteRacks = { ...(prev[siteId] || {}) };
            const rack = { ...(siteRacks[rackId] || {}) };
            const slots = [...(rack.slots || [])];

            // Ensure within bounds and enough consecutive slots
            if (slotIndex < 0 || slotIndex + item.u > slots.length) {
                alert("Not enough space in rack!");
                return prev;
            }

            const fits = slots.slice(slotIndex, slotIndex + item.u).every((slot) => slot === null);
            if (!fits) {
                alert("Not enough consecutive space in rack!");
                return prev;
            }

            for (let i = 0; i < item.u; i++) {
                slots[slotIndex + i] = { ...item, occupied: i > 0, text: item.text || "" };
            }

            rack.slots = slots;
            siteRacks[rackId] = rack;
            return { ...prev, [siteId]: siteRacks };
        });

        draggedElement.current = null;
    };

    const removeEquipment = (siteId, rackId, slotIndex) => {
        setRackData((prev) => {
            const siteRacks = { ...(prev[siteId] || {}) };
            const rack = { ...(siteRacks[rackId] || {}) };
            const slots = [...(rack.slots || [])];
            const item = slots[slotIndex];
            if (!item) return prev;

            const uSize = item.u || 1;
            for (let i = 0; i < uSize; i++) {
                if (slotIndex + i < slots.length) slots[slotIndex + i] = null;
            }

            rack.slots = slots;
            siteRacks[rackId] = rack;
            return { ...prev, [siteId]: siteRacks };
        });
    };

    const deleteRack = async (siteId, rackId) => {
        if (!window.confirm("Are you sure you want to delete this rack?")) return;
        try {
            const res = await fetch(`${API_URL}/delete/rack/${rackId}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Delete failed");
            setRackData((prev) => {
                const siteRacks = { ...(prev[siteId] || {}) };
                delete siteRacks[rackId];
                return { ...prev, [siteId]: siteRacks };
            });
            setRackNames((prev) => {
                const copy = { ...prev };
                delete copy[rackId];
                return copy;
            });
            handleLoadData(); // Refresh data to ensure consistency
        } catch (err) {
            alert("Delete error: " + err.message);
        }
    };

    const toggleCollapse = (siteId) => {
        setCollapsedSites((prev) => ({ ...prev, [siteId]: !prev[siteId] }));
    };

    const updateSiteField = (siteId, field, value) => {
        setSites((prev) => prev.map((s) => (s.id === siteId ? { ...s, [field]: value } : s)));
    };

    const updateEquipmentText = (siteId, rackId, slotIndex, text) => {
        setRackData((prev) => {
            const siteRacks = { ...(prev[siteId] || {}) };
            const rack = { ...(siteRacks[rackId] || {}) };
            const slots = [...(rack.slots || [])];
            const slot = slots[slotIndex];
            if (!slot || slot.occupied) return prev; // Only edit the anchor slot
            slots[slotIndex] = { ...slot, text };
            rack.slots = slots;
            siteRacks[rackId] = rack;
            return { ...prev, [siteId]: siteRacks };
        });
    };

    const updateSiteRackSize = (siteId, size) => {
        setSiteRackSizes((prev) => ({ ...prev, [siteId]: size }));
    };

    const handleSaveAll = async () => {
        try {
            const validRackData = {};
            sites.forEach((site) => {
                if (rackData[site.id]) {
                    validRackData[site.id] = rackData[site.id];
                }
            });

            const payload = { sites, rackData: validRackData, rackNames };
            const res = await fetch(`${API_URL}/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) {
                alert("Save failed: " + (json.error || JSON.stringify(json)));
                return;
            }

            // ✅ Update local site IDs using backend mappings
            if (json.site_map) {
                const idMap = json.site_map;
                const updatedSites = sites.map((s) => ({
                    ...s,
                    id: idMap[s.id] || s.id,
                }));

                const updatedRackData = {};
                Object.entries(rackData).forEach(([siteId, racks]) => {
                    const newId = idMap[siteId] || siteId;
                    updatedRackData[newId] = racks;
                });

                setSites(updatedSites);
                setRackData(updatedRackData);
            }

            // ✅ Clear stale data and reload from backend
            setSites([]);
            setRackData({});
            setRackNames({});
            await handleLoadData();

            alert("Save successful ✅");
        } catch (err) {
            alert("Save error: " + err.message);
        }
    };


    const handleLoadData = async () => {
        try {
            const res = await fetch(`${API_URL}/load-layout`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const json = await res.json();
            if (json.sites && json.rackData) {
                setSites(json.sites.map((site) => ({ ...site })));
                setRackData(json.rackData);
                setRackNames(json.rackNames || {});
                const sizes = {};
                Object.keys(json.rackData).forEach((siteId) => {
                    const siteRacks = json.rackData[siteId] || {};
                    const anyRack = Object.values(siteRacks)[0];
                    sizes[siteId] = anyRack ? anyRack.size || DEFAULT_RACK_SIZE : DEFAULT_RACK_SIZE;
                });
                setSiteRackSizes(sizes);
            } else {
                alert("Loaded data shape not recognized. Inspect console for details.");
                console.log("Loaded raw:", json);
            }
        } catch (err) {
            alert("Load error: " + err.message);
            console.error(err);
        }
    };

    // Calculate total used units based on equipment U values
    const calculateUsedUnits = (slots) => {
        return slots.reduce((total, slot) => {
            if (slot && !slot.occupied) {
                return total + slot.u; // Sum the U value of the main equipment slot
            }
            return total;
        }, 0);
    };

    return (
        <div style={styles.layout}>
            <aside style={styles.equipmentPanel}>
                <h2 style={styles.panelTitle}>🛠️ Equipment Library</h2>

                {/* ✅ Scrollable container */}
                <div style={styles.equipmentScrollContainer}>
                    {equipmentLibrary.map((item, idx) => (
                        <div
                            key={idx}
                            style={styles.equipmentItem}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                        >
                            {item.text}
                        </div>
                    ))}
                </div>
            </aside>


            <main style={styles.workspace}>
                <div style={styles.header}>
                    <h1 style={styles.headerTitle}>🏢 Rack Diagram Builder</h1>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button style={styles.btnPrimary} onClick={addSite}>
                            ➕ Add New Site
                        </button>
                    </div>
                </div>

                <div style={styles.sitesGrid}>
                    {sites.map((site) => (
                        <div key={site.id} style={styles.siteCard}>
                            <div style={styles.siteHeader}>
                                <h3 style={styles.siteTitle}>📍 {site.location || "New Site"}</h3>
                                <div style={styles.siteHeaderActions}>
                                    <button style={styles.collapseBtn} onClick={() => toggleCollapse(site.id)}>
                                        {!collapsedSites[site.id] ? "▶️ Expand" : "▼ Collapse"} (
                                        {Object.keys(rackData[site.id] || {}).length} racks)
                                    </button>
                                    <button
                                        style={{ ...styles.collapseBtn, background: "rgba(231,76,60,0.3)" }}
                                        onClick={() => deleteSite(site.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {collapsedSites[site.id] && (
                                <div style={styles.siteContent}>
                                    <div style={styles.siteInputs}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Location</label>
                                            <input
                                                style={styles.input}
                                                value={site.location}
                                                onChange={(e) => updateSiteField(site.id, "location", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div style={styles.row}>
                                        <div style={{ ...styles.inputGroup, marginRight: 12 }}>
                                            <label style={styles.label}>Rack Size (for new racks)</label>
                                            <select
                                                style={styles.input}
                                                value={siteRackSizes[site.id] || DEFAULT_RACK_SIZE}
                                                onChange={(e) => updateSiteRackSize(site.id, parseInt(e.target.value))}
                                            >
                                                {rackOptions.map((size) => (
                                                    <option key={size} value={size}>
                                                        {size}U
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            style={{ ...styles.btnPrimary, ...styles.btnSmall }}
                                            onClick={() => addRack(site.id)}
                                        >
                                            ➕ Add Rack to Site
                                        </button>
                                    </div>

                                    <div style={styles.rackGrid}>
                                        {rackData[site.id] &&
                                            Object.entries(rackData[site.id]).map(([rackId, rack], rackIndex) => {
                                                const totalSlots = rack.size;
                                                const usedUnits = calculateUsedUnits(rack.slots);
                                                const freeSlots = totalSlots - usedUnits; // Corrected free space
                                                const rackHeight = totalSlots * UNIT_HEIGHT;

                                                return (
                                                    <div key={rackId} style={styles.rackContainer}>
                                                        <div style={styles.rackHeader}>
                                                            {rackEdit === rackId ? (
                                                                <input
                                                                    style={styles.rackNameInput}
                                                                    type="text"
                                                                    value={rackNames[rackId] || `Rack ${rackIndex + 1}`}
                                                                    onChange={(e) =>
                                                                        setRackNames((prev) => ({ ...prev, [rackId]: e.target.value }))
                                                                    }
                                                                    onBlur={() => setRackEdit(null)}
                                                                    onKeyPress={(e) => e.key === "Enter" && setRackEdit(null)}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <h4
                                                                    style={styles.rackTitle}
                                                                    onDoubleClick={() => setRackEdit(rackId)}
                                                                >
                                                                    {rackNames[rackId] || `Rack ${rackIndex + 1}`} — {totalSlots}U
                                                                    total, {freeSlots}U free
                                                                </h4>
                                                            )}

                                                            <div style={styles.rackActions}>
                                                                <button style={styles.actionBtn} onClick={() => setRackEdit(rackId)}>
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    style={{ ...styles.actionBtn, background: "rgba(46, 204, 113,0.3)" }}
                                                                    onClick={handleSaveAll}
                                                                >
                                                                    💾
                                                                </button>
                                                                <button
                                                                    style={{ ...styles.actionBtn, ...styles.dangerBtn }}
                                                                    onClick={() => deleteRack(site.id, rackId)}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div
                                                            style={{
                                                                ...styles.rackBody,
                                                                height: `${rackHeight}px`,
                                                                overflowY: "auto", // Add scroll for large racks
                                                            }}
                                                        >
                                                            <div style={styles.rackRail}>
                                                                {(rack.slots || []).map((_, i) => (
                                                                    <div
                                                                        key={i}
                                                                        style={{
                                                                            ...styles.screwHole,
                                                                            height: `${UNIT_HEIGHT}px`,
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>

                                                            <div style={styles.rackSlots}>
                                                                {(rack.slots || []).map((slot, sIdx) => (
                                                                    <div
                                                                        key={sIdx}
                                                                        style={{
                                                                            ...styles.rackSlot,
                                                                            height: `${UNIT_HEIGHT}px`,
                                                                            ...(slot && slot.occupied ? styles.rackSlotOccupied : {}),
                                                                        }}
                                                                        onDragOver={(e) => e.preventDefault()}
                                                                        onDrop={() => handleDrop(site.id, rackId, sIdx)}
                                                                    >
                                                                        {slot && !slot.occupied ? (
                                                                            <div
                                                                                style={{
                                                                                    ...styles.equipmentInRack,
                                                                                    ...styles[
                                                                                    `equipment${slot.type
                                                                                        .charAt(0)
                                                                                        .toUpperCase() + slot.type.slice(1)}` || "Server"
                                                                                    ],
                                                                                    display: "flex",
                                                                                    justifyContent: "flex-start",
                                                                                    alignItems: "center",
                                                                                }}
                                                                            >
                                                                                <input
                                                                                    style={styles.equipmentInput}
                                                                                    value={slot.text || ""}
                                                                                    onChange={(e) =>
                                                                                        updateEquipmentText(site.id, rackId, sIdx, e.target.value)
                                                                                    }
                                                                                />
                                                                                <button
                                                                                    style={styles.removeBtn}
                                                                                    onClick={() => removeEquipment(site.id, rackId, sIdx)}
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </div>
                                                                        ) : slot && slot.occupied ? null : (
                                                                            <span style={styles.slotLabel}>U{sIdx + 1}</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div style={styles.rackRail}>
                                                                {(rack.slots || []).map((_, i) => (
                                                                    <div
                                                                        key={i}
                                                                        style={{
                                                                            ...styles.screwHole,
                                                                            height: `${UNIT_HEIGHT}px`,
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

/* styles (kept from your draft, updated for heights) */
const styles = {
    layout: {
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "#f0f2f5",
    },

    equipmentPanel: {
        position: "sticky", // ✅ changed to sticky
        top: 120, // 👈 adjust this if your top navbar/header height differs
        left: 30, // 👈 keep it aligned exactly like your screenshot
        width: "220px",
        height: "calc(100vh - 140px)", // 👈 makes it full height but below the header
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "#fff",
        padding: "20px",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        zIndex: 999,
    },

    panelTitle: {
        fontSize: "1.3rem",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: "15px",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        paddingBottom: "8px",
        userSelect: "none",
    },

    // ✅ Scrollable inner section — equipment list only scrolls, not the header
    equipmentScrollContainer: {
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: "5px",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.4) transparent",
    },

    // ✅ Custom scrollbar styling (for Webkit browsers)
    "@global::-webkit-scrollbar": {
        width: "8px",
    },
    "@global::-webkit-scrollbar-track": {
        background: "transparent",
    },
    "@global::-webkit-scrollbar-thumb": {
        background: "rgba(255,255,255,0.4)",
        borderRadius: "10px",
        transition: "background 0.2s",
    },
    "@global::-webkit-scrollbar-thumb:hover": {
        background: "rgba(255,255,255,0.6)",
    },


    equipmentItem: {
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        color: "#fff",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        cursor: "grab",
        transition: "background 0.2s ease",
        userSelect: "none",
    },

    workspace: {
        flex: 1,
        padding: "25px",
        marginLeft: "280px", // ✅ unchanged — keeps same layout position
        overflowY: "auto",
    },


    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
        background: "#fff",
        padding: "15px 25px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },

    headerTitle: {
        fontSize: "1.8rem",
        color: "#2c3e50",
        fontWeight: "300",
        margin: 0,
    },

    btnPrimary: {
        padding: "10px 20px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: "500",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "#fff",
        transition: "background 0.2s",
    },

    btnSmall: {
        padding: "6px 12px",
        fontSize: "0.85rem",
        marginTop: "10px",
    },

    sitesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(950px, 1fr))",
        gap: "20px",
    },

    siteCard: {
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        overflow: "hidden",
    },

    siteHeader: {
        background: "linear-gradient(135deg, #2c3e50, #3498db)",
        color: "#fff",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    siteTitle: {
        fontSize: "1.2rem",
        fontWeight: "500",
        margin: 0,
    },

    siteHeaderActions: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
    },

    collapseBtn: {
        background: "rgba(255,255,255,0.15)",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        padding: "6px 12px",
        borderRadius: "4px",
        fontSize: "0.85rem",
        transition: "background 0.2s",
    },

    siteContent: {
        padding: "20px",
    },

    siteInputs: {
        display: "grid",
        gridTemplateColumns: "0fr 0fr",
        gap: "10px",
        marginBottom: "15px",
    },

    inputGroup: {
        display: "flex",
        flexDirection: "column",
    },

    label: {
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: "6px",
        fontSize: "0.9rem",
    },

    input: {
        padding: "10px",
        border: "1px solid #e0e6ed",
        borderRadius: "6px",
        fontSize: "0.9rem",
        outline: "none",
        transition: "border-color 0.2s",
    },

    row: {
        display: "flex",
        alignItems: "flex-end",
        marginBottom: "10px",
    },

    rackGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(280px, 1fr))",
        gap: "10px",
        marginTop: "20px",
    },

    rackContainer: {
        width: "280px",
        background: "#fff",
        borderRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    },

    rackHeader: {
        background: "linear-gradient(135deg, #e74c3c, #c0392b)",
        color: "#fff",
        padding: "12px 15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    rackTitle: {
        fontSize: "1rem",
        fontWeight: "500",
        cursor: "pointer",
        margin: 0,
    },

    rackNameInput: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "#fff",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "0.9rem",
        outline: "none",
    },

    rackActions: {
        display: "flex",
        gap: "8px",
    },

    actionBtn: {
        background: "rgba(255,255,255,0.15)",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "0.8rem",
        transition: "background 0.2s",
    },

    dangerBtn: {
        background: "rgba(231,76,60,0.3)",
    },

    rackBody: {
        display: "flex",
        background: "#1a1a1a",
        borderLeft: "3px solid #34495e",
        borderRight: "3px solid #34495e",
    },

    rackRail: {
        display: "flex",
        flexDirection: "column-reverse",
        width: "20px",
        background: "linear-gradient(180deg, #34495e, #2c3e50)",
        alignItems: "center",
        padding: 0,
    },

    screwHole: {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: "#95a5a6",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
    },

    rackSlots: {
        flex: 1,
        display: "flex",
        flexDirection: "column-reverse",
        padding: "0 4px",
    },

    rackSlot: {
        background: "#2b2b2b",
        color: "#bdc3c7",
        borderBottom: "1px dashed #34495e",
        padding: "0 10px",
        fontSize: "0.85rem",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s",
        cursor: "pointer",
    },

    slotLabel: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },

    rackSlotOccupied: {
        background: "transparent",
        border: "none",
        padding: 0,
    },

    equipmentInRack: {
        background: "linear-gradient(135deg, #3498db, #2980b9)",
        color: "#fff",
        borderRadius: "6px",
        padding: "6px 10px",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        fontSize: "0.85rem",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    },

    equipmentServer: {
        background: "linear-gradient(135deg, #3498db, #2980b9)",
    },

    equipmentSwitch: {
        background: "linear-gradient(135deg, #27ae60, #229954)",
    },

    equipmentRouter: {
        background: "linear-gradient(135deg, #9b59b6, #8e44ad)",
    },

    equipmentFirewall: {
        background: "linear-gradient(135deg, #e74c3c, #c0392b)",
    },

    equipmentStorage: {
        background: "linear-gradient(135deg, #f39c12, #e67e22)",
    },

    equipmentUps: {
        background: "linear-gradient(135deg, #f1c40f, #f39c12)",
    },

    equipmentPatchpanel: {
        background: "linear-gradient(135deg, #8e44ad, #9b59b6)",
    },

    equipmentInput: {
        border: "none",
        background: "transparent",
        color: "#fff",
        flex: 1,
        fontSize: "0.85rem",
        padding: "2px",
        outline: "none",
        textAlign: "left",
    },

    removeBtn: {
        background: "rgba(255,255,255,0.15)",
        border: "none",
        color: "#fff",
        marginLeft: "8px",
        cursor: "pointer",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        transition: "background 0.2s",
    },
};