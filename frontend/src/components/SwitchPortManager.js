import React, { useState } from 'react';
import { Edit2, Save, X, Plus, Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';

const SwitchPortManager = () => {
    const [switches, setSwitches] = useState([
        // {
        //     id: 1,
        //     name: 'Switch01',
        //     collapsed: false,
        //     ports: [
        //         { id: 1, port: 'Port01', device: 'D003', ap: '', panel: '', location: 'VACANT', vlan: '2' },
        //         { id: 2, port: 'Port02', device: 'D004', ap: 'A01', panel: 'Patch Panel 1 | Port 04', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 3, port: 'Port03', device: 'D005', ap: 'A02', panel: 'Patch Panel 1 | Port 05', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 4, port: 'Port04', device: 'D006', ap: 'A03', panel: 'Patch Panel 1 | Port 06', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 5, port: 'Port05', device: 'D007', ap: 'A04', panel: 'Patch Panel 1 | Port 07', location: 'DWATIMESS', vlan: '43' },
        //         { id: 6, port: 'Port06', device: 'D008', ap: 'A05', panel: 'Patch Panel 1 | Port 08', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 7, port: 'Port07', device: 'D009', ap: 'A06', panel: 'Patch Panel 1 | Port 09', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 8, port: 'Port08', device: 'D010', ap: 'A07', panel: 'Patch Panel 1 | Port 10', location: 'ANC', vlan: '88' },
        //         { id: 9, port: 'Port09', device: 'D012', ap: 'A08', panel: 'Patch Panel 1 | Port 12', location: 'ANC', vlan: '88' },
        //         { id: 10, port: 'Port10', device: 'D013', ap: 'A09', panel: 'Patch Panel 1 | Port 13', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 11, port: 'Port11', device: 'D015', ap: 'A10', panel: 'Patch Panel 1 | Port 15', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 12, port: 'Port12', device: 'D016', ap: 'A11', panel: 'Patch Panel 1 | Port 16', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 13, port: 'Port13', device: 'D017', ap: 'A12', panel: 'Patch Panel 1 | Port 17', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 14, port: 'Port14', device: 'D019', ap: 'A13', panel: 'Patch Panel 1 | Port 19', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 15, port: 'Port15', device: 'D020', ap: 'A14', panel: 'Patch Panel 1 | Port 20', location: 'LANDSCAPE SOLUTION', vlan: '61' },
        //         { id: 16, port: 'Port16', device: 'D021', ap: 'A15', panel: 'Patch Panel 1 | Port 21', location: 'DWATIMESS', vlan: '43' },
        //         { id: 17, port: 'Port17', device: 'D022', ap: 'A16', panel: 'Patch Panel 1 | Port 22', location: 'ALLEGRA', vlan: '70' },
        //         { id: 18, port: 'Port18', device: 'D023', ap: 'A17', panel: 'Patch Panel 1 | Port 23', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 19, port: 'Port19', device: 'D024', ap: 'A18', panel: 'Patch Panel 1 | Port 24', location: 'GLOSSARY', vlan: '43' },
        //         { id: 20, port: 'Port20', device: 'D027', ap: 'A19', panel: 'Patch Panel 1 | Port 27', location: 'GENESIS CAPITAL', vlan: '63' },
        //         { id: 21, port: 'Port21', device: 'D028', ap: 'A20', panel: 'Patch Panel 1 | Port 28', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 22, port: 'Port22', device: 'D026', ap: 'A21', panel: 'Patch Panel 1 | Port 29', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 23, port: 'Port23', device: 'D030', ap: 'A22', panel: 'Patch Panel 1 | Port 30', location: 'GLOSSARY', vlan: '43' },
        //         { id: 24, port: 'Port24', device: 'D031', ap: 'A23', panel: 'Patch Panel 1 | Port 31', location: 'ANC', vlan: '88' },
        //         { id: 25, port: 'Port25', device: 'D032', ap: 'A24', panel: 'Patch Panel 1 | Port 32', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 26, port: 'Port26', device: 'D033', ap: 'A25', panel: 'Patch Panel 1 | Port 33', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 27, port: 'Port27', device: 'D034', ap: 'A26', panel: 'Patch Panel 1 | Port 34', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 28, port: 'Port28', device: 'P2_43', ap: 'A27', panel: 'Patch Panel 2 | Port 43', location: 'GENERAL HOMECARE', vlan: '83' },
        //         { id: 29, port: 'Port29', device: 'P2_44', ap: 'A28', panel: 'Patch Panel 2 | Port 44', location: 'PACIFIC SMILES', vlan: '42' },
        //         { id: 30, port: 'Port30', device: 'P2_45', ap: 'A29', panel: 'Patch Panel 2 | Port 45', location: 'ANC', vlan: '88' },
        //         { id: 31, port: 'Port31', device: 'P2_46', ap: 'A30', panel: 'Patch Panel 2 | Port 46', location: 'ALLEGRA', vlan: '70' },
        //         { id: 32, port: 'Port32', device: 'P2_47', ap: 'A31', panel: 'Patch Panel 2 | Port 47', location: 'GLOSSARY', vlan: '43' },
        //         { id: 33, port: 'Port33', device: 'D035', ap: 'A32', panel: 'Patch Panel 1 | Port 35', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 34, port: 'Port34', device: 'D036', ap: 'A33', panel: 'Patch Panel 1 | Port 36', location: 'VACANT', vlan: '2' },
        //         { id: 35, port: 'Port35', device: 'D037', ap: 'A34', panel: 'Patch Panel 1 | Port 37', location: 'ANC', vlan: '88' },
        //         { id: 36, port: 'Port36', device: 'D038', ap: 'A35', panel: 'Patch Panel 1 | Port 38', location: 'DWATIMESS', vlan: '43' },
        //         { id: 37, port: 'Port37', device: 'D039', ap: 'A36', panel: 'Patch Panel 1 | Port 39', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 38, port: 'Port38', device: 'D040', ap: 'A37', panel: 'Patch Panel 1 | Port 40', location: 'GENESIS CAPITAL', vlan: '63' },
        //         { id: 39, port: 'Port39', device: 'D041', ap: 'A38', panel: 'Patch Panel 1 | Port 41', location: 'ALLEGRA', vlan: '70' },
        //         { id: 40, port: 'Port40', device: 'D042', ap: 'A39', panel: 'Patch Panel 1 | Port 42', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 41, port: 'Port41', device: 'D043', ap: 'A40', panel: 'Patch Panel 1 | Port 43', location: 'GLOSSARY', vlan: '43' },
        //         { id: 42, port: 'Port42', device: 'D044', ap: 'A41', panel: 'Patch Panel 1 | Port 44', location: 'PACIFIC SMILES', vlan: '42' },
        //         { id: 43, port: 'Port43', device: 'D045', ap: 'A42', panel: 'Patch Panel 1 | Port 45', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 44, port: 'Port44', device: 'D046', ap: 'A43', panel: 'Patch Panel 1 | Port 46', location: 'ANC', vlan: '88' },
        //         { id: 45, port: 'Port45', device: 'D047', ap: 'A44', panel: 'Patch Panel 1 | Port 47', location: 'LANDSCAPE SOLUTION', vlan: '61' },
        //         { id: 46, port: 'Port46', device: 'D048', ap: 'A45', panel: 'Patch Panel 1 | Port 48', location: 'GENERAL HOMECARE', vlan: '83' },
        //         { id: 47, port: 'Port47', device: 'D049', ap: 'A46', panel: 'Patch Panel 2 | Port 01', location: 'EARLY SETTLERS', vlan: '57' },
        //         { id: 48, port: 'Port48', device: 'D050', ap: 'A47', panel: 'Patch Panel 2 | Port 02', location: 'DWATIMESS', vlan: '43' },
        //         { id: 49, port: 'Port49', device: 'D051', ap: 'A48', panel: 'Patch Panel 2 | Port 03', location: 'ALLEGRA', vlan: '70' },
        //         { id: 50, port: 'Port50', device: 'D052', ap: 'A49', panel: 'Patch Panel 2 | Port 04', location: 'VACANT', vlan: '2' },
        //     ]
        // }
    ]);

    const [editingPort, setEditingPort] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddSwitch, setShowAddSwitch] = useState(false);
    const [newSwitch, setNewSwitch] = useState({ name: '', portCount: 24 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVlan, setFilterVlan] = useState('');

    const allPorts = switches.flatMap(sw => sw.ports.map(p => ({ ...p, switchName: sw.name })));
    const vlans = [...new Set(allPorts.map(p => p.vlan))].filter(v => v).sort((a, b) => a - b);

    const toggleSwitch = (switchId) => {
        setSwitches(switches.map(sw =>
            sw.id === switchId ? { ...sw, collapsed: !sw.collapsed } : sw
        ));
    };

    const startEdit = (switchId, port) => {
        setEditingPort({ switchId, portId: port.id });
        setEditForm({ ...port });
    };

    const cancelEdit = () => {
        setEditingPort(null);
        setEditForm({});
    };

    const saveEdit = () => {
        setSwitches(switches.map(sw =>
            sw.id === editingPort.switchId
                ? {
                    ...sw,
                    ports: sw.ports.map(p =>
                        p.id === editingPort.portId ? editForm : p
                    )
                }
                : sw
        ));
        setEditingPort(null);
        setEditForm({});
    };

    const addSwitch = () => {
        if (newSwitch.name && newSwitch.portCount > 0) {
            const newPorts = Array.from({ length: parseInt(newSwitch.portCount) }, (_, i) => ({
                id: i + 1,
                port: `Port${String(i + 1).padStart(2, '0')}`,
                device: `D${String(100 + i).padStart(3, '0')}`,
                ap: '',
                panel: '',
                location: 'VACANT',
                vlan: '2'
            }));

            const newSw = {
                id: switches.length + 1,
                name: newSwitch.name,
                collapsed: false,
                ports: newPorts
            };

            setSwitches([...switches, newSw]);
            setNewSwitch({ name: '', portCount: 24 });
            setShowAddSwitch(false);
        }
    };

    const filterPorts = (ports, switchName) => {
        return ports.filter(port => {
            const matchesSearch = !searchTerm ||
                Object.values(port).some(val =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                ) || switchName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesVlan = !filterVlan || port.vlan === filterVlan;
            return matchesSearch && matchesVlan;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-6">
                    <h1 className="text-3xl font-bold text-white mb-6">Switch Port Manager</h1>

                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search ports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={filterVlan}
                                    onChange={(e) => setFilterVlan(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">All VLANs</option>
                                    {vlans.map(vlan => (
                                        <option key={vlan} value={vlan} className="text-gray-900">VLAN {vlan}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setShowAddSwitch(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add Switch
                            </button>
                        </div>
                    </div>

                    {showAddSwitch && (
                        <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/30">
                            <h3 className="text-white font-semibold mb-3">Add New Switch</h3>
                            <div className="flex gap-3 flex-wrap">
                                <input
                                    type="text"
                                    placeholder="Switch Name (e.g., Switch02)"
                                    value={newSwitch.name}
                                    onChange={(e) => setNewSwitch({ ...newSwitch, name: e.target.value })}
                                    className="flex-1 min-w-48 px-3 py-2 bg-white/30 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <input
                                    type="number"
                                    placeholder="Port Count"
                                    value={newSwitch.portCount}
                                    onChange={(e) => setNewSwitch({ ...newSwitch, portCount: e.target.value })}
                                    className="w-32 px-3 py-2 bg-white/30 border border-white/40 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <button
                                    onClick={addSwitch}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddSwitch(false);
                                        setNewSwitch({ name: '', portCount: 24 });
                                    }}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {switches.map((sw) => {
                    const filteredSwitchPorts = filterPorts(sw.ports, sw.name);
                    if (filteredSwitchPorts.length === 0 && (searchTerm || filterVlan)) return null;

                    return (
                        <div key={sw.id} className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden mb-6">
                            <div
                                className="bg-white/20 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/25 transition-colors"
                                onClick={() => toggleSwitch(sw.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {sw.collapsed ? <ChevronRight className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                                    <h2 className="text-2xl font-bold text-white">{sw.name}</h2>
                                    <span className="px-3 py-1 bg-blue-500/50 rounded-full text-white text-sm">
                                        {sw.ports.length} ports
                                    </span>
                                </div>
                            </div>

                            {!sw.collapsed && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/20">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-white font-semibold">Port</th>
                                                <th className="px-4 py-3 text-left text-white font-semibold">Device</th>
                                                <th className="px-4 py-3 text-left text-white font-semibold">AP</th>
                                                <th className="px-4 py-3 text-left text-white font-semibold">Panel Port</th>
                                                <th className="px-4 py-3 text-left text-white font-semibold">Location</th>
                                                <th className="px-4 py-3 text-left text-white font-semibold">VLAN</th>
                                                <th className="px-4 py-3 text-left text-white font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSwitchPorts.map((port, idx) => {
                                                const isEditing = editingPort?.switchId === sw.id && editingPort?.portId === port.id;
                                                return (
                                                    <tr key={port.id} className={`${idx % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/15 transition-colors`}>
                                                        <td className="px-4 py-3">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.port}
                                                                    onChange={(e) => setEditForm({ ...editForm, port: e.target.value })}
                                                                    className="w-full px-2 py-1 bg-white/30 border border-white/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                />
                                                            ) : (
                                                                <span className="text-white">{port.port}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.device}
                                                                    onChange={(e) => setEditForm({ ...editForm, device: e.target.value })}
                                                                    className="w-full px-2 py-1 bg-white/30 border border-white/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                />
                                                            ) : (
                                                                <span className="text-white">{port.device}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.ap}
                                                                    onChange={(e) => setEditForm({ ...editForm, ap: e.target.value })}
                                                                    className="w-full px-2 py-1 bg-white/30 border border-white/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                />
                                                            ) : (
                                                                <span className="text-white">{port.ap}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.panel}
                                                                    onChange={(e) => setEditForm({ ...editForm, panel: e.target.value })}
                                                                    className="w-full px-2 py-1 bg-white/30 border border-white/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                />
                                                            ) : (
                                                                <span className="text-white">{port.panel}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.location}
                                                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                                    className="w-full px-2 py-1 bg-white/30 border border-white/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                />
                                                            ) : (
                                                                <span className="text-white">{port.location}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={editForm.vlan}
                                                                    onChange={(e) => setEditForm({ ...editForm, vlan: e.target.value })}
                                                                    className="w-20 px-2 py-1 bg-white/30 border border-white/40 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                />
                                                            ) : (
                                                                <span className="px-2 py-1 bg-blue-500/50 rounded text-white text-sm font-medium">
                                                                    {port.vlan}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {isEditing ? (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={saveEdit}
                                                                        className="p-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                                                    >
                                                                        <Save className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEdit}
                                                                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => startEdit(sw.id, port)}
                                                                    className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="mt-6 text-center text-white/70 text-sm">
                    Total Switches: {switches.length} | Total Ports: {switches.reduce((sum, sw) => sum + sw.ports.length, 0)}
                </div>
            </div>
        </div>
    );
};

export default SwitchPortManager;