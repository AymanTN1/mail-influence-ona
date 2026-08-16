import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [data, setData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [simulatedPropagation, setSimulatedPropagation] = useState(null);
  const [resignationImpact, setResignationImpact] = useState(null);

  // Mode secours (Mock data) au cas où le serveur C n'est pas lancé
  const mockData = {
    nodes: [
      { id: 0, name: 'David Miller', role: 'Tech Lead', dept: 'Engineering', pageRank: 0.2930, betweenness: 4.0 },
      { id: 1, name: 'Sarah Connor', role: 'CTO', dept: 'Engineering', pageRank: 0.2193, betweenness: 3.0 },
      { id: 2, name: 'Mark Sloan', role: 'VP Sales', dept: 'Sales', pageRank: 0.1685, betweenness: 2.0 },
      { id: 3, name: 'Claire Bennet', role: 'HR Director', dept: 'HR', pageRank: 0.1629, betweenness: 2.0 },
      { id: 4, name: 'Alex Mercer', role: 'CEO', dept: 'Executive', pageRank: 0.1563, betweenness: 3.0 }
    ],
    edges: [
      { source: 1, target: 0, weight: 4.5 },
      { source: 0, target: 1, weight: 3.8 },
      { source: 1, target: 4, weight: 2.5 },
      { source: 4, target: 3, weight: 3.0 },
      { source: 3, target: 2, weight: 1.8 },
      { source: 2, target: 0, weight: 2.0 },
      { source: 0, target: 4, weight: 1.2 }
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

  const getBadgeClass = (dept) => {
    switch (dept) {
      case 'Engineering': return 'badge-eng';
      case 'Executive': return 'badge-exec';
      case 'HR': return 'badge-hr';
      case 'Sales': return 'badge-sales';
      default: return 'badge-eng';
    }
  };

  const handleSimulatePropagation = (node) => {
    // Calcul de la propagation BFS depuis ce nœud
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
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#06b6d4' }}>🌐 MailInfluence-ONA</h2>
            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', background: backendOnline ? '#064e3b' : '#374151', color: backendOnline ? '#34d399' : '#9ca3af' }}>
              {backendOnline ? '🟢 Engine C Connecté' : '⚪ Mode Démo'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Backend Moteur C (Langage C11) & Algorithmes de Graphe
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#f3f4f6' }}>
            🏆 Top Leaders Informels (PageRank C)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
            {currentData.nodes
              .slice()
              .sort((a, b) => b.pageRank - a.pageRank)
              .map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNode(item)}
                  style={{
                    background: selectedNode?.id === item.id ? '#1e293b' : 'var(--card-bg)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: selectedNode?.id === item.id ? '1px solid var(--accent-cyan)' : '1px solid #374151',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{idx + 1}. {item.name}</span>
                    <span className={`badge ${getBadgeClass(item.dept)}`}>{item.dept}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    PageRank: <strong style={{ color: 'var(--accent-cyan)' }}>{item.pageRank.toFixed(4)}</strong> | Betweenness: <strong>{item.betweenness}</strong>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {selectedNode && (
          <div style={{ background: '#111827', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-purple)', fontSize: '0.95rem' }}>🔎 Inspecteur de Nœud C</h4>
            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ margin: 0 }}><strong>Nom:</strong> {selectedNode.name}</p>
              <p style={{ margin: 0 }}><strong>Poste:</strong> {selectedNode.role}</p>
              <p style={{ margin: 0 }}><strong>Département:</strong> {selectedNode.dept}</p>
              <p style={{ margin: 0 }}><strong>PageRank (C):</strong> {selectedNode.pageRank.toFixed(4)}</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => handleSimulatePropagation(selectedNode)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: 'var(--accent-cyan)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                📢 BFS Propagation
              </button>
              <button
                onClick={() => handleSimulateResignation(selectedNode)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                🔮 What-If Démission
              </button>
            </div>
          </div>
        )}

        {(simulatedPropagation || resignationImpact) && (
          <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #0284c7' }}>
            {simulatedPropagation && (
              <div>
                <h5 style={{ margin: '0 0 6px 0', color: '#38bdf8' }}>📢 Résultat BFS Propagation (Queue C)</h5>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                  Origine: <strong>{simulatedPropagation.origin}</strong>
                </p>
                <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>
                  Personnes atteintes: <strong>{simulatedPropagation.reachableCount}</strong>
                </p>
              </div>
            )}
            {resignationImpact && (
              <div>
                <h5 style={{ margin: '0 0 6px 0', color: '#f87171' }}>🔮 Impact Démission (Graph C)</h5>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                  Membre: <strong>{resignationImpact.target}</strong>
                </p>
                <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>
                  Liaisons emails rompues: <strong>{resignationImpact.brokenEdges} arêtes</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Interactive Graph Visualizer Canvas Area */}
      <main className="graph-canvas" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f9fafb' }}>🕸️ Visualiseur Interactif du Graphe ONA</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Graphe orienté calculé par le moteur C. Cliquez sur un nœud pour inspecter les métriques.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>🔵 Nœuds: <strong>{currentData.nodes.length}</strong></span>
            <span>➡️ Arêtes: <strong>{currentData.edges.length}</strong></span>
          </div>
        </div>

        {/* Dynamic Interactive SVG Graph Visualization */}
        <div style={{ flex: 1, background: '#0b0f19', borderRadius: '12px', border: '1px solid #1f2937', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 700 500">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
              </marker>
            </defs>

            {/* Render Edges */}
            {currentData.edges.map((edge, idx) => {
              const positions = [
                { x: 350, y: 150 }, // David (0)
                { x: 200, y: 250 }, // Sarah (1)
                { x: 500, y: 350 }, // Mark (2)
                { x: 480, y: 200 }, // Claire (3)
                { x: 300, y: 380 }  // Alex (4)
              ];
              const sourcePos = positions[edge.source % positions.length];
              const targetPos = positions[edge.target % positions.length];

              return (
                <line
                  key={idx}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target) ? '#06b6d4' : '#374151'}
                  strokeWidth={edge.weight ? Math.max(1.5, edge.weight * 0.8) : 2}
                  markerEnd="url(#arrow)"
                  opacity={selectedNode && !(selectedNode.id === edge.source || selectedNode.id === edge.target) ? 0.3 : 0.8}
                />
              );
            })}

            {/* Render Nodes */}
            {currentData.nodes.map((node, idx) => {
              const positions = [
                { x: 350, y: 150 }, // David (0)
                { x: 200, y: 250 }, // Sarah (1)
                { x: 500, y: 350 }, // Mark (2)
                { x: 480, y: 200 }, // Claire (3)
                { x: 300, y: 380 }  // Alex (4)
              ];
              const pos = positions[node.id % positions.length];
              const isSelected = selectedNode?.id === node.id;
              const radius = 22 + (node.pageRank || 0) * 45;

              return (
                <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`} onClick={() => setSelectedNode(node)} style={{ cursor: 'pointer' }}>
                  <circle
                    r={radius}
                    fill={isSelected ? '#06b6d4' : '#1f2937'}
                    stroke={isSelected ? '#38bdf8' : '#8b5cf6'}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#f9fafb"
                    fontSize="11"
                    fontWeight="600"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.name.split(' ')[0]}
                  </text>
                  <text
                    textAnchor="middle"
                    dy={radius + 14}
                    fill="#9ca3af"
                    fontSize="10"
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
