import React, { useState } from 'react';
import { GripVertical, Plus, X, Save, Download, Upload, Trash2, Building2 } from 'lucide-react';

export default function PatchPanelManager() {
    const [sites, setSites] = useState([
        {
            id: 1,
            name: 'Main Building',
            panels: [
                {
                    id: 1,
                    name: 'Patch Panel 1',
                    totalPorts: 48,
                    labels: [
                        { id: 1, port: 1, label: 'Server Room A', color: '#3b82f6' },
                        { id: 2, port: 5, label: 'Office Floor 1', color: '#10b981' },
                        { id: 3, port: 12, label: 'Conference Room', color: '#f59e0b' }
                    ]
                }
            ]
        }
    ]);
    const [activeSiteId, setActiveSiteId] = useState(1);
    const [activePanelId, setActivePanelId] = useState(1);
    const [draggedItem, setDraggedItem] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showNewSiteForm, setShowNewSiteForm] = useState(false);
    const [newLabel, setNewLabel] = useState({ port: '', label: '', color: '#3b82f6' });
    const [newSiteName, setNewSiteName] = useState('');

    const activeSite = sites.find(s => s.id === activeSiteId);
    const panels = activeSite?.panels || [];
    const activePanel = panels.find(p => p.id === activePanelId);
    const labels = activePanel?.labels || [];
    const totalPorts = activePanel?.totalPorts || 48;

    const updateActiveSite = (updates) => {
        setSites(sites.map(s =>
            s.id === activeSiteId ? { ...s, ...updates } : s
        ));
    };

    const updateActivePanel = (updates) => {
        const newPanels = panels.map(p =>
            p.id === activePanelId ? { ...p, ...updates } : p
        );
        updateActiveSite({ panels: newPanels });
    };

    const addNewSite = () => {
        if (!newSiteName.trim()) return;
        const newId = Math.max(...sites.map(s => s.id), 0) + 1;
        const newSite = {
            id: newId,
            name: newSiteName,
            panels: [
                {
                    id: 1,
                    name: 'Patch Panel 1',
                    totalPorts: 48,
                    labels: []
                }
            ]
        };
        setSites([...sites, newSite]);
        setActiveSiteId(newId);
        setActivePanelId(1);
        setNewSiteName('');
        setShowNewSiteForm(false);
    };

    const deleteSite = (id) => {
        if (sites.length === 1) {
            alert('Cannot delete the last site');
            return;
        }
        setSites(sites.filter(s => s.id !== id));
        if (activeSiteId === id) {
            const newActiveSite = sites.find(s => s.id !== id);
            setActiveSiteId(newActiveSite.id);
            setActivePanelId(newActiveSite.panels[0].id);
        }
    };

    const addNewPanel = () => {
        const newId = Math.max(...panels.map(p => p.id), 0) + 1;
        const newPanel = {
            id: newId,
            name: `Patch Panel ${newId}`,
            totalPorts: 48,
            labels: []
        };
        updateActiveSite({ panels: [...panels, newPanel] });
        setActivePanelId(newId);
    };

    const deletePanel = (id) => {
        if (panels.length === 1) {
            alert('Cannot delete the last panel in a site');
            return;
        }
        const newPanels = panels.filter(p => p.id !== id);
        updateActiveSite({ panels: newPanels });
        if (activePanelId === id) {
            setActivePanelId(newPanels[0].id);
        }
    };

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetItem) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetItem.id) return;

        const newLabels = labels.map(item => {
            if (item.id === draggedItem.id) {
                return { ...item, port: targetItem.port };
            }
            if (item.id === targetItem.id) {
                return { ...item, port: draggedItem.port };
            }
            return item;
        });

        updateActivePanel({ labels: newLabels });
        setDraggedItem(null);
    };

    const handleAddLabel = () => {
        if (newLabel.port && newLabel.label) {
            const port = parseInt(newLabel.port);
            if (port >= 1 && port <= totalPorts) {
                const newLabelObj = {
                    id: Date.now(),
                    port: port,
                    label: newLabel.label,
                    color: newLabel.color
                };
                updateActivePanel({ labels: [...labels, newLabelObj] });
                setNewLabel({ port: '', label: '', color: '#3b82f6' });
                setShowAddForm(false);
            }
        }
    };

    const handleDeleteLabel = (id) => {
        updateActivePanel({ labels: labels.filter(item => item.id !== id) });
    };

    const exportConfig = () => {
        const dataStr = JSON.stringify({ sites }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'patch-panels-config.json';
        link.click();
    };

    const importConfig = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.sites) {
                        setSites(data.sites);
                        setActiveSiteId(data.sites[0].id);
                        setActivePanelId(data.sites[0].panels[0].id);
                    }
                } catch (error) {
                    alert('Invalid file format');
                }
            };
            reader.readAsText(file);
        }
    };

    const sortedLabels = [...labels].sort((a, b) => a.port - b.port);
    const usedPorts = labels.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6">
                    <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white rounded"></div>
                        </div>
                        Patch Panel Label Manager
                    </h1>

                    {/* Site Selection */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Building2 className="text-gray-400" size={20} />
                            <h3 className="text-white font-semibold">Sites</h3>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center">
                            {sites.map(site => (
                                <div key={site.id} className="relative group">
                                    <button
                                        onClick={() => {
                                            setActiveSiteId(site.id);
                                            setActivePanelId(site.panels[0].id);
                                        }}
                                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${activeSiteId === site.id
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        <Building2 size={16} />
                                        <input
                                            type="text"
                                            value={site.name}
                                            onChange={(e) => {
                                                setSites(sites.map(s =>
                                                    s.id === site.id ? { ...s, name: e.target.value } : s
                                                ));
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-transparent border-none outline-none w-32 text-center"
                                        />
                                    </button>
                                    {sites.length > 1 && (
                                        <button
                                            onClick={() => deleteSite(site.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {showNewSiteForm ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Site name (e.g., 3F Server)"
                                        value={newSiteName}
                                        onChange={(e) => setNewSiteName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addNewSite()}
                                        className="bg-gray-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={addNewSite}
                                        className="px-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setShowNewSiteForm(false)}
                                        className="px-3 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNewSiteForm(true)}
                                    className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2 transition"
                                >
                                    <Plus size={20} />
                                    New Site
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Panel Tabs */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="text-gray-400 text-sm">Patch Panels in {activeSite?.name}</div>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center">
                            {panels.map(panel => (
                                <div key={panel.id} className="relative group">
                                    <button
                                        onClick={() => setActivePanelId(panel.id)}
                                        className={`px-4 py-2 rounded-lg transition ${activePanelId === panel.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="text"
                                            value={panel.name}
                                            onChange={(e) => {
                                                const newPanels = panels.map(p =>
                                                    p.id === panel.id ? { ...p, name: e.target.value } : p
                                                );
                                                updateActiveSite({ panels: newPanels });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-transparent border-none outline-none w-32 text-center"
                                        />
                                    </button>
                                    {panels.length > 1 && (
                                        <button
                                            onClick={() => deletePanel(panel.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addNewPanel}
                                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition"
                            >
                                <Plus size={20} />
                                New Panel
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-700 rounded-lg p-4">
                            <label className="block text-gray-400 text-sm mb-2">Total Ports</label>
                            <input
                                type="number"
                                value={totalPorts}
                                onChange={(e) => updateActivePanel({ totalPorts: Math.max(1, parseInt(e.target.value) || 0) })}
                                className="w-full bg-gray-600 text-white text-2xl font-bold rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                            />
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-2">Ports Labeled</div>
                            <div className="text-2xl font-bold text-green-400">{usedPorts} / {totalPorts}</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-2">Available Ports</div>
                            <div className="text-2xl font-bold text-blue-400">{totalPorts - usedPorts}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Plus size={20} />
                            Add Label
                        </button>
                        <button
                            onClick={exportConfig}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Download size={20} />
                            Export All
                        </button>
                        <label className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer">
                            <Upload size={20} />
                            Import
                            <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                        </label>
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="bg-gray-700 rounded-lg p-4 mb-6">
                            <h3 className="text-white font-semibold mb-3">Add New Label</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input
                                    type="number"
                                    placeholder="Port #"
                                    value={newLabel.port}
                                    onChange={(e) => setNewLabel({ ...newLabel, port: e.target.value })}
                                    className="bg-gray-600 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max={totalPorts}
                                />
                                <input
                                    type="text"
                                    placeholder="Label"
                                    value={newLabel.label}
                                    onChange={(e) => setNewLabel({ ...newLabel, label: e.target.value })}
                                    className="bg-gray-600 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={newLabel.color}
                                        onChange={(e) => setNewLabel({ ...newLabel, color: e.target.value })}
                                        className="w-12 h-10 bg-gray-600 rounded cursor-pointer"
                                    />
                                    <button
                                        onClick={handleAddLabel}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 transition"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Labels List */}
                    <div className="space-y-2">
                        <h3 className="text-white font-semibold mb-3">Port Labels (Drag to Reorder)</h3>
                        {sortedLabels.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">
                                No labels added yet. Click "Add Label" to get started.
                            </div>
                        ) : (
                            sortedLabels.map((item) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, item)}
                                    className="bg-gray-700 rounded-lg p-4 flex items-center gap-4 cursor-move hover:bg-gray-600 transition"
                                    style={{ borderLeft: `4px solid ${item.color}` }}
                                >
                                    <GripVertical className="text-gray-400" size={20} />
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-gray-400 text-xs">Port</div>
                                            <div className="text-white font-bold text-lg">#{item.port}</div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="text-gray-400 text-xs">Label</div>
                                            <div className="text-white font-semibold">{item.label}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteLabel(item.id)}
                                        className="text-red-400 hover:text-red-300 transition"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Visual Patch Panel */}
                <div className="bg-gray-600 rounded-lg shadow-2xl p-6">
                    <div className="bg-blue-400 text-gray-800 font-bold text-center py-2 mb-4 rounded">
                        {activePanel?.name || 'PANEL1'}
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="grid grid-cols-12 gap-1">
                            {Array.from({ length: totalPorts }, (_, i) => {
                                const portNum = i + 1;
                                const label = labels.find(l => l.port === portNum);
                                const row = Math.floor(i / 48);

                                return (
                                    <div key={i} className="flex flex-col items-center">
                                        {/* Port number on top for first row, bottom for second row */}
                                        {row === 0 && (
                                            <div className="text-white text-[10px] font-bold mb-1">{portNum}</div>
                                        )}
                                        <div
                                            className="w-full aspect-[3/2] rounded flex items-center justify-center text-[9px] font-bold border border-gray-700"
                                            style={{
                                                backgroundColor: label ? label.color : '#4b5563',
                                                color: label ? 'white' : '#9ca3af'
                                            }}
                                            title={label ? `Port ${portNum}: ${label.label}` : `Port ${portNum}`}
                                        >
                                            <div className="truncate px-1 text-center">
                                                {label ? label.label : ''}
                                            </div>
                                        </div>
                                        {row === 1 && (
                                            <div className="text-white text-[10px] font-bold mt-1">{portNum}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}