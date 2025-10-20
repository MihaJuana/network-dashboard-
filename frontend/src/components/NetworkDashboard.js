import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import RackDiagramBuilder from './RackDiagramBuilder';
import PatchPanelLabelManager from './PatchPanelLabelManager';
import SwitchPortManager from './SwitchPortManager.js';

// Icon replacements (if lucide-react not installed)
const Network = ({ className }) => <span className={className}>🌐</span>;
const Server = ({ className }) => <span className={className}>🖥️</span>;
const DrawerIcon = ({ className }) => <span className={className}>📥</span>;

const NetworkDashboard = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Define navigation tabs with route paths
    const tabs = [
        { id: 'rackbuilder', label: 'Rack Diagram', icon: Server, path: '/rackbuilder' },
        { id: 'patch_panel', label: 'Patch Panel Manager', icon: DrawerIcon, path: '/patch_panel' },
        { id: 'switch_manager', label: 'Switch Port Manager', icon: DrawerIcon, path: '/switch_manager' },

    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '5px' }}>
            <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px', marginBottom: '24px', position: 'sticky', top: 0, zIndex: 1000, transition: 'box-shadow 0.2s ease-in-out', boxShadow: scrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                                <Network className="w-8 h-8" style={{ color: '#2563eb' }} />
                                IT - INFRASTRUCTURE
                            </h1>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Last Updated</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                    <div style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <nav style={{ display: 'flex', gap: '32px', padding: '0 24px' }}>
                            {tabs.map(tab => (
                                <NavLink
                                    key={tab.id}
                                    to={tab.path}
                                    style={({ isActive }) => ({
                                        padding: '16px 4px',
                                        borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: isActive ? '#2563eb' : '#6b7280',
                                        textDecoration: 'none'
                                    })}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div style={{ padding: '24px' }}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/rackbuilder" replace />} />
                            <Route path="/rackbuilder" element={<RackDiagramBuilder />} />
                            <Route path="/patch_panel" element={<PatchPanelLabelManager />} />
                            <Route path="/switch_manager" element={<SwitchPortManager />} />
                            <Route path="*" element={<div>404 - Page Not Found</div>} />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkDashboard;