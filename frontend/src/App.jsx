import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [data, setData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [simulatedPropagation, setSimulatedPropagation] = useState(null);
  const [resignationImpact, setResignationImpact] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [activeTab, setActiveTab] = useState('bridges'); // 'bridges' | 'audit' | 'influence' | 'busfactor' | 'silos'

  // Mode secours (Mock data)
  const mockData = {
    nodes: [
      { id: 0, name: 'Sarah Connor', email: 'sarah@corp.com', dept: 'Engineering', role: 'CTO', pageRank: 0.0654, betweenness: 12.5 },
      { id: 1, name: 'Alex Mercer', email: 'alex@corp.com', dept: 'Executive', role: 'CEO', pageRank: 0.0666, betweenness: 18.0 },
      { id: 2, name: 'David Miller', email: 'david@corp.com', dept: 'Engineering', role: 'Tech Lead', pageRank: 0.0711, betweenness: 24.5 },
      { id: 3, name: 'Claire Bennet', email: 'claire@corp.com', dept: 'HR', role: 'HR Director', pageRank: 0.0644, betweenness: 14.0 },
      { id: 4, name: 'Mark Sloan', email: 'mark@corp.com', dept: 'Sales', role: 'VP Sales', pageRank: 0.0642, betweenness: 11.0 }
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
      { dept: 'Engineering', members: 3, internalFlux: 237.9, externalFlux: 2469.4, isolationScore: 8.8, isSilo: false },
      { dept: 'Executive', members: 2, internalFlux: 41.9, externalFlux: 1847.3, isolationScore: 2.2, isSilo: false },
      { dept: 'HR', members: 2, internalFlux: 67.7, externalFlux: 1783.7, isolationScore: 3.7, isSilo: false },
      { dept: 'Sales', members: 2, internalFlux: 53.9, externalFlux: 1753.2, isolationScore: 3.0, isSilo: false }
    ],
    busFactor: [
      { nodeId: 2, name: 'David Miller', dept: 'Engineering', role: 'Tech Lead', inFlux: 527.7, outFlux: 490.7, overloadScore: 1156.6, isCritical: true },
      { nodeId: 0, name: 'Sarah Connor', dept: 'Engineering', role: 'CTO', inFlux: 482.2, outFlux: 471.3, overloadScore: 1052.3, isCritical: true },
      { nodeId: 1, name: 'Alex Mercer', dept: 'Executive', role: 'CEO', inFlux: 488.9, outFlux: 504.4, overloadScore: 1070.3, isCritical: true },
      { nodeId: 3, name: 'Claire Bennet', dept: 'HR', role: 'HR Director', inFlux: 472.0, outFlux: 488.2, overloadScore: 1027.0, isCritical: true },
      { nodeId: 4, name: 'Mark Sloan', dept: 'Sales', role: 'VP Sales', inFlux: 470.3, outFlux: 425.6, overloadScore: 1028.6, isCritical: true }
    ],
    boundarySpanners: [
      { nodeId: 2, name: 'David Miller', dept: 'Engineering', role: 'Tech Lead', betweenness: 24.5, normalizedBetweenness: 13.5, externalDeptsCount: 5, bridgeScore: 38.4, isKeyBroker: true },
      { nodeId: 1, name: 'Alex Mercer', dept: 'Executive', role: 'CEO', betweenness: 18.0, normalizedBetweenness: 9.8, externalDeptsCount: 4, bridgeScore: 29.2, isKeyBroker: true },
      { nodeId: 3, name: 'Claire Bennet', dept: 'HR', role: 'HR Director', betweenness: 14.0, normalizedBetweenness: 7.7, externalDeptsCount: 4, bridgeScore: 23.1, isKeyBroker: true },
      { nodeId: 0, name: 'Sarah Connor', dept: 'Engineering', role: 'CTO', betweenness: 12.5, normalizedBetweenness: 6.8, externalDeptsCount: 3, bridgeScore: 18.7, isKeyBroker: false },
      { nodeId: 4, name: 'Mark Sloan', dept: 'Sales', role: 'VP Sales', betweenness: 11.0, normalizedBetweenness: 6.0, externalDeptsCount: 3, bridgeScore: 16.5, isKeyBroker: false }
    ],
    benchmark: {
      rowsProcessed: 2500,
      totalNodes: 15,
      totalEdges: 2500,
      parseTimeMs: 1.33,
      pageRankTimeMs: 0.03,
      totalTimeMs: 1.48
    },
    auditReport: {
      healthScore: 64.0,
      grade: 'C',
      density: 100.0,
      reciprocity: 100.0,
      crossDeptConnectivity: 96.0,
      resilienceScore: 0.0,
      executiveSummary: 'Risques de surcharge et de silos nécessitant un suivi managérial.',
      recommendations: [
        'Rééquilibrer la charge des 15 employés en Bus Factor critique pour sécuriser les projets.'
      ]
    }
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
  const benchmark = currentData.benchmark || mockData.benchmark;
  const auditReport = currentData.auditReport || mockData.auditReport;
  const boundarySpanners = currentData.boundarySpanners || mockData.boundarySpanners;

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
      case 'Product': return '#eab308';
      case 'Finance': return '#06b6d4';
      case 'Legal': return '#ec4899';
      case 'Design': return '#8b5cf6';
      default: return '#06b6d4';
    }
  };

  const getNodePos = (idx, total) => {
    const cx = 375;
    const cy = 260;
    const radius = Math.min(220, 150 + total * 4);
    const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
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
              {backendOnline ? '🟢 Engine C11' : '⚪ Démo'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
            Intelligence Réseau & Théorie des Graphes en C
          </p>
        </div>

        {/* 5 Navigation Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', background: '#0b0f19', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`tab-btn ${activeTab === 'bridges' ? 'active' : ''}`}
            onClick={() => setActiveTab('bridges')}
            style={{ fontSize: '0.68rem', padding: '6px 2px' }}
          >
            🌉 Ponts
          </button>
          <button 
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
            style={{ fontSize: '0.68rem', padding: '6px 2px' }}
          >
            📑 Audit
          </button>
          <button 
            className={`tab-btn ${activeTab === 'influence' ? 'active' : ''}`}
            onClick={() => setActiveTab('influence')}
            style={{ fontSize: '0.68rem', padding: '6px 2px' }}
          >
            🏆 Leaders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'busfactor' ? 'active' : ''}`}
            onClick={() => setActiveTab('busfactor')}
            style={{ fontSize: '0.68rem', padding: '6px 2px' }}
          >
            ⚠️ Risque
          </button>
          <button 
            className={`tab-btn ${activeTab === 'silos' ? 'active' : ''}`}
            onClick={() => setActiveTab('silos')}
            style={{ fontSize: '0.68rem', padding: '6px 2px' }}
          >
            🏢 Silos
          </button>
        </div>

        {/* Tab 1: Ponts Informels & Boundary Spanners (Brandes O(V*E)) */}
        {activeTab === 'bridges' && boundarySpanners && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c084fc' }}>Connecteurs Informels (Brandes)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Top Passerelles</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '290px', overflowY: 'auto' }}>
              {boundarySpanners.map((item, idx) => {
                const nodeObj = currentData.nodes.find(n => n.id === item.nodeId) || { id: item.nodeId, name: item.name, dept: item.dept, role: item.role, pageRank: 0.07, betweenness: item.betweenness };
                return (
                  <div
                    key={idx}
                    onClick={() => { setSelectedNode(nodeObj); setSelectedDept(null); }}
                    style={{
                      background: selectedNode?.id === item.nodeId ? '#1e293b' : 'var(--card-bg)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedNode?.id === item.nodeId ? '1px solid #c084fc' : '1px solid #374151',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{idx + 1}. {item.name}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: item.isKeyBroker ? '#581c87' : '#1e1b4b',
                        color: item.isKeyBroker ? '#e9d5ff' : '#c7d2fe',
                        fontWeight: 600
                      }}>
                        {item.isKeyBroker ? '🌉 CONNECTEUR CLÉ' : '🔗 PASSERELLE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Intermédiarité: <strong style={{ color: '#c084fc' }}>{item.betweenness.toFixed(1)}</strong></span>
                      <span>Depts: <strong>{item.externalDeptsCount} liés</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Audit de Santé Organisationnelle (Score 0-100) */}
        {activeTab === 'audit' && auditReport && (
          <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '290px', overflowY: 'auto' }}>
            {/* Score Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #06b6d4',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Score Global de Santé Réseau
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', margin: '2px 0' }}>
                {auditReport.healthScore.toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>/ 100</span>
              </div>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: auditReport.healthScore >= 75 ? '#064e3b' : '#7c2d12',
                color: auditReport.healthScore >= 75 ? '#6ee7b7' : '#fdba74',
                fontWeight: 700
              }}>
                GRADE : {auditReport.grade}
              </span>
            </div>

            {/* Sub-scores breakdown */}
            <div style={{ background: '#0b0f19', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Densité Globale:</span>
                <strong>{auditReport.density.toFixed(1)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Réciprocité Bilatérale:</span>
                <strong>{auditReport.reciprocity.toFixed(1)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Connectivité Transversale:</span>
                <strong>{auditReport.crossDeptConnectivity.toFixed(1)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Résilience Bus Factor:</span>
                <strong>{auditReport.resilienceScore.toFixed(1)}%</strong>
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ background: '#111827', padding: '10px', borderRadius: '8px', border: '1px solid #374151' }}>
              <h5 style={{ margin: '0 0 4px 0', color: '#f59e0b', fontSize: '0.74rem' }}>💡 Recommandations RH & Management</h5>
              <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '0.68rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {auditReport.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Leaders Informels (PageRank) */}
        {activeTab === 'influence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f3f4f6' }}>Classement PageRank C</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Power Iteration</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '290px', overflowY: 'auto' }}>
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
                      PageRank: <strong style={{ color: 'var(--accent-cyan)' }}>{item.pageRank.toFixed(4)}</strong> | Betweenness: <strong>{item.betweenness.toFixed(1)}</strong>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: Bus Factor & Risque de Surcharge (Max-Heap C) */}
        {activeTab === 'busfactor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b' }}>Risque de Surcharge (Max-Heap)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Top Risques</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '290px', overflowY: 'auto' }}>
              {busFactorList.map((item, idx) => {
                const nodeObj = currentData.nodes.find(n => n.id === item.nodeId) || { id: item.nodeId, name: item.name, dept: item.dept, role: item.role, pageRank: 0.07, betweenness: 10.0 };
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
                      <span>Reçu: <strong>{item.inFlux.toFixed(1)}</strong> | Émis: <strong>{item.outFlux.toFixed(1)}</strong></span>
                      <span>Score: <strong style={{ color: item.isCritical ? '#f87171' : '#34d399' }}>{item.overloadScore.toFixed(1)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: Silos Organisationnels & Isolation (Homophily C) */}
        {activeTab === 'silos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>Isolation Inter-Équipes</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Homophily C</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '290px', overflowY: 'auto' }}>
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
                    <span>Interne: {silo.internalFlux.toFixed(1)}</span>
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
              <h4 style={{ margin: 0, color: '#c084fc', fontSize: '0.85rem' }}>🔎 Inspecteur de Collaborateur</h4>
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
              <p style={{ margin: 0 }}><strong>Betweenness (Brandes):</strong> {selectedNode.betweenness ? selectedNode.betweenness.toFixed(1) : 'N/A'}</p>
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
        {/* Header with Benchmark stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f9fafb', fontWeight: 700 }}>
              🕸️ Visualiseur Interactif du Graphe ONA
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {selectedDept ? `Filtrage actif sur : ${selectedDept}` : 'Cliquez sur un collaborateur ou un onglet pour analyser les flux et les connecteurs.'}
            </p>
          </div>

          {/* Benchmark Badge */}
          {benchmark && (
            <div style={{
              background: '#111827',
              border: '1px solid #06b6d4',
              padding: '6px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.78rem'
            }}>
              <span>⚡ <strong>{benchmark.rowsProcessed.toLocaleString()}</strong> emails</span>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <span>Parsing: <strong style={{ color: '#38bdf8' }}>{benchmark.parseTimeMs.toFixed(2)} ms</strong></span>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <span>PageRank: <strong style={{ color: '#34d399' }}>{benchmark.pageRankTimeMs.toFixed(2)} ms</strong></span>
            </div>
          )}
        </div>

        {/* Dynamic Interactive SVG Graph Visualization */}
        <div style={{ flex: 1, background: '#0b0f19', borderRadius: '12px', border: '1px solid #1f2937', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 750 520" style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
              <marker id="arrow-highlight" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c084fc" />
              </marker>
            </defs>

            {/* Render Edges */}
            {currentData.edges.map((edge, idx) => {
              const totalNodes = currentData.nodes.length;
              const sourcePos = getNodePos(edge.source % totalNodes, totalNodes);
              const targetPos = getNodePos(edge.target % totalNodes, totalNodes);

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
                  stroke={isHighlighted ? (isInternal ? '#3b82f6' : '#c084fc') : '#334155'}
                  strokeWidth={edge.weight ? Math.max(1.2, Math.min(4.0, edge.weight * 0.8)) : 1.5}
                  strokeDasharray={isInternal ? 'none' : '4,2'}
                  markerEnd={isHighlighted ? "url(#arrow-highlight)" : "url(#arrow)"}
                  opacity={selectedNode || selectedDept ? (isHighlighted ? 0.95 : 0.1) : 0.65}
                  style={{ transition: 'all 0.2s ease' }}
                />
              );
            })}

            {/* Render Nodes */}
            {currentData.nodes.map((node, idx) => {
              const totalNodes = currentData.nodes.length;
              const pos = getNodePos(idx, totalNodes);
              const isSelected = selectedNode?.id === node.id || (selectedDept && node.dept === selectedDept);
              const radius = 20 + (node.pageRank || 0) * 45;
              const deptColor = getDeptColor(node.dept);
              const isCriticalBusFactor = busFactorList.find(b => b.nodeId === node.id)?.isCritical;
              const isKeyBridge = boundarySpanners.find(b => b.nodeId === node.id)?.isKeyBroker;

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

                  {/* Purple aura ring for Key Boundary Spanners / Brokers */}
                  {isKeyBridge && (
                    <circle
                      r={radius + 9}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                      opacity="0.9"
                    />
                  )}

                  <circle
                    r={radius}
                    fill={isSelected ? '#1e293b' : '#111827'}
                    stroke={isSelected ? '#c084fc' : deptColor}
                    strokeWidth={isSelected ? 3.5 : 2}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#f9fafb"
                    fontSize={totalNodes > 10 ? '9.5' : '11'}
                    fontWeight="700"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.name.split(' ')[0]}
                  </text>
                  <text
                    textAnchor="middle"
                    dy={radius + 14}
                    fill={deptColor}
                    fontSize={totalNodes > 10 ? '8.5' : '10'}
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
