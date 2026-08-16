import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [data, setData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [simulatedPropagation, setSimulatedPropagation] = useState(null);
  const [resignationImpact, setResignationImpact] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [activeTab, setActiveTab] = useState('influence'); // 'influence' | 'busfactor' | 'silos'

  // Mode secours (Mock data)
  const mockData = {
    nodes: [
      { id: 0, name: 'Sarah Connor', email: 'sarah@company.com', dept: 'Engineering', role: 'CTO', pageRank: 0.2193, betweenness: 3.0 },
      { id: 1, name: 'Alex Mercer', email: 'alex@company.com', dept: 'Executive', role: 'CEO', pageRank: 0.1563, betweenness: 3.0 },
      { id: 2, name: 'David Miller', email: 'david@company.com', dept: 'Engineering', role: 'Tech Lead', pageRank: 0.2930, betweenness: 4.0 },
      { id: 3, name: 'Claire Bennet', email: 'claire@company.com', dept: 'HR', role: 'HR Director', pageRank: 0.1629, betweenness: 2.0 },
      { id: 4, name: 'Mark Sloan', email: 'mark@company.com', dept: 'Sales', role: 'VP Sales', pageRank: 0.1685, betweenness: 2.0 }
    ],
    edges: [
      { source: 0, target: 2, weight: 4.5 },
      { source: 2, target: 0, weight: 3.8 },
      { source: 0, target: 1, weight: 2.5 },
      { source: 1, target: 3, weight: 3.0 },
      { source: 3, target: 4, weight: 1.8 },
      { source: 4, target: 2, weight: 2.0 },
      { source: 2, target: 1, weight: 1.2 }
    ],
    silos: [
      { dept: 'Engineering', members: 2, internalFlux: 8.3, externalFlux: 5.7, isolationScore: 59.3, isSilo: true },
      { dept: 'Executive', members: 1, internalFlux: 0.0, externalFlux: 6.7, isolationScore: 0.0, isSilo: false },
      { dept: 'HR', members: 1, internalFlux: 0.0, externalFlux: 4.8, isolationScore: 0.0, isSilo: false },
      { dept: 'Sales', members: 1, internalFlux: 0.0, externalFlux: 3.8, isolationScore: 0.0, isSilo: false }
    ],
    busFactor: [
      { nodeId: 2, name: 'David Miller', dept: 'Engineering', role: 'Tech Lead', inFlux: 6.5, outFlux: 5.0, overloadScore: 16.8, isCritical: true },
      { nodeId: 0, name: 'Sarah Connor', dept: 'Engineering', role: 'CTO', inFlux: 3.8, outFlux: 7.0, overloadScore: 10.2, isCritical: false },
      { nodeId: 1, name: 'Alex Mercer', dept: 'Executive', role: 'CEO', inFlux: 3.7, outFlux: 3.0, overloadScore: 9.8, isCritical: false },
      { nodeId: 3, name: 'Claire Bennet', dept: 'HR', role: 'HR Director', inFlux: 3.0, outFlux: 1.8, overloadScore: 7.2, isCritical: false },
      { nodeId: 4, name: 'Mark Sloan', dept: 'Sales', role: 'VP Sales', inFlux: 1.8, outFlux: 2.0, overloadScore: 5.4, isCritical: false }
    ]
  };

  useEffect(() => {
    fetch('http://localhost:8080/api/ona')
      ? fetch('http://localhost:8080/api/ona')
          .then((res) => res.json())
          .then((json) => {
            setData(json);
            setBackendOnline(true);
          })
          .catch(() => {
            setData(mockData);
            setBackendOnline(false);
          })
      : setData(mockData);
  }, []);

  const currentData = data || mockData;
  const silosList = currentData.silos || mockData.silos;
  const busFactorList = currentData.busFactor || mockData.busFactor;

  const getBadgeClass = (dept) => {
    switch (dept) {
      case 'Engineering': return 'badge-eng';
      case 'Executive': return 'badge-exec';
      case 'HR': return 'badge-hr';
      case 'Sales': return 'badge-sales';
      default: return 'badge-eng';
    }
  };

  const getDeptColor = (dept) => {
    switch (dept) {
      case 'Engineering': return '#3b82f6';
      case 'Executive': return '#a855f7';
      case 'HR': return '#10b981';
      case 'Sales': return '#f97316';
      default: return '#06b6d4';
    }
  };

  const handleSimulatePropagation = (node) => {
    const level1 = currentData.edges
      .filter((e) => e.source === node.id)
      .map((e) => currentData.nodes.find((n) => n.id === e.target))
      .filter(Boolean);

    setSimulatedPropagation({
      origin: node.name,
      reachableCount: level1.length + 1,
      reachables: level1
    });
    setResignationImpact(null);
  };

  const handleSimulateResignation = (node) => {
    const brokenEdges = currentData.edges.filter(
      (e) => e.source === node.id || e.target === node.id
    ).length;

    setResignationImpact({
      target: node.name,
      brokenEdges
    });
    setSimulatedPropagation(null);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Controls & ONA Metrics */}
      <aside className="sidebar">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#06b6d4', fontWeight: 700 }}>
              🌐 MailInfluence-ONA
            </h2>
            <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '12px', background: backendOnline ? '#064e3b' : '#374151', color: backendOnline ? '#34d399' : '#9ca3af', fontWeight: 600 }}>
              {backendOnline ? '🟢 Engine C' : '⚪ Démo'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
            Analyse Réseau & Intelligence Organisationnelle
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: '#0b0f19', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`tab-btn ${activeTab === 'influence' ? 'active' : ''}`}
            onClick={() => setActiveTab('influence')}
          >
            🏆 Leaders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'busfactor' ? 'active' : ''}`}
            onClick={() => setActiveTab('busfactor')}
          >
            ⚠️ Bus Factor
          </button>
          <button 
            className={`tab-btn ${activeTab === 'silos' ? 'active' : ''}`}
            onClick={() => setActiveTab('silos')}
          >
            🏢 Silos
          </button>
        </div>

        {/* Tab 1: Leaders Informels (PageRank) */}
        {activeTab === 'influence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f3f4f6' }}>Classement PageRank C</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Power Iteration</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {currentData.nodes
                .slice()
                .sort((a, b) => b.pageRank - a.pageRank)
                .map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => { setSelectedNode(item); setSelectedDept(null); }}
                    style={{
                      background: selectedNode?.id === item.id ? '#1e293b' : 'var(--card-bg)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedNode?.id === item.id ? '1px solid var(--accent-cyan)' : '1px solid #374151',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{idx + 1}. {item.name}</span>
                      <span className={`badge ${getBadgeClass(item.dept)}`}>{item.dept}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      PageRank: <strong style={{ color: 'var(--accent-cyan)' }}>{item.pageRank.toFixed(4)}</strong> | Betweenness: <strong>{item.betweenness}</strong>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 2: Bus Factor & Risque de Surcharge (Max-Heap C) */}
        {activeTab === 'busfactor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b' }}>Risque de Surcharge & Bus Factor</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max-Heap C</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {busFactorList.map((item, idx) => {
                const nodeObj = currentData.nodes.find(n => n.id === item.nodeId) || { id: item.nodeId, name: item.name, dept: item.dept, role: item.role, pageRank: 0.2, betweenness: 2.0 };
                return (
                  <div
                    key={idx}
                    onClick={() => { setSelectedNode(nodeObj); setSelectedDept(null); }}
                    style={{
                      background: selectedNode?.id === item.nodeId ? '#1e293b' : 'var(--card-bg)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedNode?.id === item.nodeId ? '1px solid #f59e0b' : '1px solid #374151',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{item.name}</span>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: item.isCritical ? '#7f1d1d' : '#064e3b',
                        color: item.isCritical ? '#fca5a5' : '#6ee7b7',
                        fontWeight: 600
                      }}>
                        {item.isCritical ? '🚨 CRITIQUE' : '🟢 NORMAL'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Reçu: <strong>{item.inFlux}</strong> | Émis: <strong>{item.outFlux}</strong></span>
                      <span>Score: <strong style={{ color: item.isCritical ? '#f87171' : '#34d399' }}>{item.overloadScore.toFixed(1)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Silos Organisationnels & Isolation (Homophily C) */}
        {activeTab === 'silos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>Isolation Inter-Équipes</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Homophily C</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {silosList.map((silo, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedDept(selectedDept === silo.dept ? null : silo.dept)}
                  style={{
                    background: selectedDept === silo.dept ? '#1f2937' : '#0b0f19',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: selectedDept === silo.dept ? '1px solid #38bdf8' : '1px solid #1f2937',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.78rem', color: getDeptColor(silo.dept) }}>
                      {silo.dept} ({silo.members} pers.)
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: silo.isSilo ? '#7f1d1d' : '#064e3b',
                      color: silo.isSilo ? '#fca5a5' : '#6ee7b7',
                      fontWeight: 600
                    }}>
                      {silo.isSilo ? '⚠️ SILO' : '✅ CONNECTÉ'}
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '5px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, silo.isolationScore)}%`,
                      height: '100%',
                      background: silo.isSilo ? '#ef4444' : '#10b981',
                      borderRadius: '3px'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Interne: {silo.internalFlux}</span>
                    <span>Isolation: <strong>{silo.isolationScore.toFixed(1)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Inspecteur de Nœud */}
        {selectedNode && (
          <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h4 style={{ margin: 0, color: 'var(--accent-purple)', fontSize: '0.85rem' }}>🔎 Inspecteur de Nœud</h4>
              <button 
                onClick={() => setSelectedNode(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <p style={{ margin: 0 }}><strong>Nom:</strong> {selectedNode.name}</p>
              <p style={{ margin: 0 }}><strong>Poste:</strong> {selectedNode.role}</p>
              <p style={{ margin: 0 }}><strong>Département:</strong> {selectedNode.dept}</p>
              <p style={{ margin: 0 }}><strong>PageRank (C):</strong> {selectedNode.pageRank?.toFixed(4) || 'N/A'}</p>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
              <button
                className="action-btn"
                onClick={() => handleSimulatePropagation(selectedNode)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  background: 'var(--accent-cyan)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                📢 BFS Propagation
              </button>
              <button
                className="action-btn"
                onClick={() => handleSimulateResignation(selectedNode)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                🔮 Démission
              </button>
            </div>
          </div>
        )}

        {/* Résultats des Simulations */}
        {(simulatedPropagation || resignationImpact) && (
          <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #0284c7' }}>
            {simulatedPropagation && (
              <div>
                <h5 style={{ margin: '0 0 4px 0', color: '#38bdf8', fontSize: '0.8rem' }}>📢 Résultat BFS Propagation</h5>
                <p style={{ fontSize: '0.75rem', margin: 0 }}>
                  Origine: <strong>{simulatedPropagation.origin}</strong>
                </p>
                <p style={{ fontSize: '0.75rem', margin: '3px 0' }}>
                  Employés atteints: <strong>{simulatedPropagation.reachableCount} / {currentData.nodes.length}</strong>
                </p>
              </div>
            )}
            {resignationImpact && (
              <div>
                <h5 style={{ margin: '0 0 4px 0', color: '#f87171', fontSize: '0.8rem' }}>🔮 Impact Démission (What-If)</h5>
                <p style={{ fontSize: '0.75rem', margin: 0 }}>
                  Membre: <strong>{resignationImpact.target}</strong>
                </p>
                <p style={{ fontSize: '0.75rem', margin: '3px 0' }}>
                  Liaisons emails rompues: <strong>{resignationImpact.brokenEdges} liaisons</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Interactive Graph Visualizer Canvas Area */}
      <main className="graph-canvas">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f9fafb', fontWeight: 700 }}>
              🕸️ Visualiseur Interactif du Graphe ONA
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {selectedDept ? `Filtrage actif sur : ${selectedDept}` : 'Cliquez sur un employé ou un onglet à gauche pour explorer l\'influence et le flux d\'emails.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>🔵 Nœuds: <strong>{currentData.nodes.length}</strong></span>
            <span>➡️ Liaisons: <strong>{currentData.edges.length}</strong></span>
            <span>🏢 Équipes: <strong>{silosList.length}</strong></span>
          </div>
        </div>

        {/* Dynamic Interactive SVG Graph Visualization */}
        <div style={{ flex: 1, background: '#0b0f19', borderRadius: '12px', border: '1px solid #1f2937', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 750 520" style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="32" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker id="arrow-highlight" viewBox="0 0 10 10" refX="32" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
              </marker>
            </defs>

            {/* Render Edges */}
            {currentData.edges.map((edge, idx) => {
              const positions = [
                { x: 230, y: 170 }, // Sarah (0)
                { x: 380, y: 380 }, // Alex (1)
                { x: 210, y: 340 }, // David (2)
                { x: 530, y: 350 }, // Claire (3)
                { x: 510, y: 180 }  // Mark (4)
              ];
              const sourcePos = positions[edge.source % positions.length];
              const targetPos = positions[edge.target % positions.length];

              const srcNode = currentData.nodes[edge.source];
              const tgtNode = currentData.nodes[edge.target];
              const isInternal = srcNode?.dept === tgtNode?.dept;

              const isHighlighted = (selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)) ||
                                    (selectedDept && (srcNode?.dept === selectedDept || tgtNode?.dept === selectedDept));

              return (
                <line
                  key={idx}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={isHighlighted ? (isInternal ? '#3b82f6' : '#06b6d4') : '#374151'}
                  strokeWidth={edge.weight ? Math.max(1.5, edge.weight * 0.8) : 2}
                  strokeDasharray={isInternal ? 'none' : '4,2'}
                  markerEnd={isHighlighted ? "url(#arrow-highlight)" : "url(#arrow)"}
                  opacity={selectedNode || selectedDept ? (isHighlighted ? 0.95 : 0.15) : 0.75}
                  style={{ transition: 'all 0.2s ease' }}
                />
              );
            })}

            {/* Render Nodes */}
            {currentData.nodes.map((node, idx) => {
              const positions = [
                { x: 230, y: 170 }, // Sarah (0)
                { x: 380, y: 380 }, // Alex (1)
                { x: 210, y: 340 }, // David (2)
                { x: 530, y: 350 }, // Claire (3)
                { x: 510, y: 180 }  // Mark (4)
              ];
              const pos = positions[node.id % positions.length];
              const isSelected = selectedNode?.id === node.id || (selectedDept && node.dept === selectedDept);
              const radius = 24 + (node.pageRank || 0) * 45;
              const deptColor = getDeptColor(node.dept);
              const isCriticalBusFactor = busFactorList.find(b => b.nodeId === node.id)?.isCritical;

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${pos.x}, ${pos.y})`} 
                  onClick={() => { setSelectedNode(node); setSelectedDept(null); }} 
                  style={{ cursor: 'pointer' }}
                >
                  {/* Warning pulse ring for critical Bus Factor */}
                  {isCriticalBusFactor && (
                    <circle
                      r={radius + 6}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                      opacity="0.8"
                    />
                  )}

                  <circle
                    r={radius}
                    fill={isSelected ? '#1e293b' : '#111827'}
                    stroke={isSelected ? '#06b6d4' : deptColor}
                    strokeWidth={isSelected ? 3.5 : 2}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#f9fafb"
                    fontSize="11"
                    fontWeight="700"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.name.split(' ')[0]}
                  </text>
                  <text
                    textAnchor="middle"
                    dy={radius + 15}
                    fill={deptColor}
                    fontSize="10"
                    fontWeight="600"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.dept}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </main>
    </div>
  );
}
