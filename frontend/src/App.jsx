import React, { useState, useEffect, useMemo } from 'react';
import './index.css';

export default function App() {
  const [data, setData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [backendOnline, setBackendOnline] = useState(false);
  const [simulatedPropagation, setSimulatedPropagation] = useState(null);
  const [resignationImpact, setResignationImpact] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [activeTab, setActiveTab] = useState('velocity'); // 'velocity' | 'crashtest' | 'tribes' | 'bridges' | 'audit' | 'influence' | 'busfactor' | 'silos'
  const [timeView, setTimeView] = useState('delta'); // 't1' | 't2' | 'delta'
  const [customResignedNodes, setCustomResignedNodes] = useState([5, 6]);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState('circle'); // 'circle' | 'departments' | 'tribes'

  // Fallback Mock data
  const mockData = {
    nodes: [
      { id: 0, name: 'Mark Sloan', email: 'mark@corp.com', dept: 'Sales', role: 'VP Sales', pageRank: 0.0705, betweenness: 1.1 },
      { id: 1, name: 'Lucas Scott', email: 'lucas@corp.com', dept: 'Sales', role: 'Sales Lead', pageRank: 0.0609, betweenness: 0.7 },
      { id: 2, name: 'Claire Bennet', email: 'claire@corp.com', dept: 'HR', role: 'HR Director', pageRank: 0.0635, betweenness: 1.0 },
      { id: 3, name: 'Rachel Green', email: 'rachel@corp.com', dept: 'HR', role: 'Talent Lead', pageRank: 0.0611, betweenness: 1.2 },
      { id: 4, name: 'Sarah Connor', email: 'sarah@corp.com', dept: 'Engineering', role: 'CTO', pageRank: 0.0696, betweenness: 1.6 },
      { id: 5, name: 'Sophia Lin', email: 'sophia@corp.com', dept: 'Product', role: 'Product Owner', pageRank: 0.0710, betweenness: 1.0 },
      { id: 6, name: 'Emma Watson', email: 'emma@corp.com', dept: 'Design', role: 'Lead UI/UX', pageRank: 0.0692, betweenness: 1.8 },
      { id: 7, name: 'Elena Rostova', email: 'elena@corp.com', dept: 'Engineering', role: 'Senior Dev', pageRank: 0.0650, betweenness: 1.4 },
      { id: 8, name: 'Harvey Specter', email: 'harvey@corp.com', dept: 'Legal', role: 'General Counsel', pageRank: 0.0640, betweenness: 1.4 },
      { id: 9, name: 'Alex Mercer', email: 'alex@corp.com', dept: 'Executive', role: 'CEO', pageRank: 0.0666, betweenness: 0.6 },
      { id: 10, name: 'James Vance', email: 'james@corp.com', dept: 'Product', role: 'Head of Product', pageRank: 0.0678, betweenness: 1.7 },
      { id: 11, name: 'David Miller', email: 'david@corp.com', dept: 'Engineering', role: 'Tech Lead', pageRank: 0.0711, betweenness: 0.6 },
      { id: 12, name: 'Michael Chang', email: 'michael@corp.com', dept: 'Finance', role: 'CFO', pageRank: 0.0699, betweenness: 1.3 },
      { id: 13, name: 'Donna Paulsen', email: 'donna@corp.com', dept: 'Executive', role: 'Chief of Staff', pageRank: 0.0674, betweenness: 1.3 },
      { id: 14, name: 'Louis Litt', email: 'louis@corp.com', dept: 'Legal', role: 'Senior Partner', pageRank: 0.0725, betweenness: 0.9 }
    ],
    edges: [
      { source: 0, target: 1, weight: 4.5 },
      { source: 2, target: 3, weight: 3.8 },
      { source: 4, target: 11, weight: 4.8 },
      { source: 5, target: 6, weight: 4.2 },
      { source: 8, target: 14, weight: 3.9 },
      { source: 9, target: 13, weight: 4.1 },
      { source: 10, target: 5, weight: 3.5 },
      { source: 11, target: 7, weight: 3.7 },
      { source: 12, target: 9, weight: 3.6 }
    ],
    silos: [
      { dept: 'Sales', members: 2, internalFlux: 387.6, externalFlux: 1501.3, isolationScore: 20.5, isSilo: false },
      { dept: 'HR', members: 2, internalFlux: 280.8, externalFlux: 1501.6, isolationScore: 15.8, isSilo: false },
      { dept: 'Engineering', members: 3, internalFlux: 1238.1, externalFlux: 2561.7, isolationScore: 32.6, isSilo: false }
    ],
    busFactor: [
      { nodeId: 5, name: 'Sophia Lin', dept: 'Product', role: 'Product Owner', inFlux: 913.9, outFlux: 847.3, overloadScore: 1829.9, isCritical: true },
      { nodeId: 6, name: 'Emma Watson', dept: 'Design', role: 'Lead UI/UX', inFlux: 892.7, outFlux: 788.6, overloadScore: 1792.2, isCritical: true },
      { nodeId: 11, name: 'David Miller', dept: 'Engineering', role: 'Tech Lead', inFlux: 818.9, outFlux: 910.5, overloadScore: 1639.2, isCritical: true }
    ],
    boundarySpanners: [
      { nodeId: 6, name: 'Emma Watson', dept: 'Design', role: 'Lead UI/UX', betweenness: 1.8, normalizedBetweenness: 100.0, externalDeptsCount: 7, bridgeScore: 642.5, isKeyBroker: true },
      { nodeId: 10, name: 'James Vance', dept: 'Product', role: 'Head of Product', betweenness: 1.7, normalizedBetweenness: 90.7, externalDeptsCount: 7, bridgeScore: 583.3, isKeyBroker: true }
    ],
    communities: [
      { id: 0, label: 'Tribu 1 (Sales & Co)', memberCount: 4, dominantDept: 'Sales', internalFlux: 2019.6, externalFlux: 300.5, cohesionScore: 87.0, memberIds: [0, 1, 2, 3] },
      { id: 1, label: 'Tribu 2 (Engineering & Co)', memberCount: 5, dominantDept: 'Engineering', internalFlux: 4057.9, externalFlux: 364.6, cohesionScore: 91.8, memberIds: [4, 5, 6, 7, 11] },
      { id: 2, label: 'Tribu 3 (Legal & Co)', memberCount: 6, dominantDept: 'Legal', internalFlux: 3169.1, externalFlux: 365.3, cohesionScore: 89.7, memberIds: [8, 9, 10, 12, 13, 14] }
    ],
    cascadingSimulation: {
      numResigned: 2,
      resignedNodeIds: [5, 6],
      brokenEdgesCount: 766,
      lostFlux: 2984.3,
      totalComponents: 1,
      isolatedEmployeesCount: 0,
      fragmentationIndex: 0.0,
      riskLevel: 'FAIBLE',
      impactSummary: 'Réseau résilient : 766 liaisons perdues sans fragmentation majeure.',
      components: [
        { sccId: 0, memberCount: 13, dominantDept: 'Engineering', isIsolated: false, memberIds: [0, 1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14] }
      ]
    },
    temporalReport: {
      healthScoreT1: 60.5,
      healthScoreT2: 61.2,
      deltaHealthScore: 0.7,
      crossDeptT1: 85.0,
      crossDeptT2: 86.5,
      deltaCrossDept: 1.5,
      risingLeadersCount: 5,
      decliningNodesCount: 6,
      executiveSummary: 'Évolution ONA : 5 leaders émergents détectés. Progression de connectivité transversale : +1.5% (Score Santé : +0.7 pts).',
      metrics: [
        { nodeId: 14, name: 'Louis Litt', dept: 'Legal', role: 'Senior Partner', pageRankT1: 0.0578, pageRankT2: 0.0677, deltaPageRank: 0.0098, deltaGrowthPct: 17.0, inFluxT1: 253.1, inFluxT2: 311.3, deltaFlux: 58.2, trend: '📈 LEADER ÉMERGENT' },
        { nodeId: 3, name: 'Rachel Green', dept: 'HR', role: 'Talent Lead', pageRankT1: 0.0574, pageRankT2: 0.0649, deltaPageRank: 0.0075, deltaGrowthPct: 13.1, inFluxT1: 232.2, inFluxT2: 281.6, deltaFlux: 49.4, trend: '📈 LEADER ÉMERGENT' },
        { nodeId: 2, name: 'Claire Bennet', dept: 'HR', role: 'HR Director', pageRankT1: 0.0597, pageRankT2: 0.0665, deltaPageRank: 0.0068, deltaGrowthPct: 11.4, inFluxT1: 258.9, inFluxT2: 295.8, deltaFlux: 36.9, trend: '📈 LEADER ÉMERGENT' },
        { nodeId: 12, name: 'Michael Chang', dept: 'Finance', role: 'CFO', pageRankT1: 0.0614, pageRankT2: 0.0665, deltaPageRank: 0.0051, deltaGrowthPct: 8.3, inFluxT1: 255.8, inFluxT2: 306.6, deltaFlux: 50.8, trend: '📈 LEADER ÉMERGENT' },
        { nodeId: 7, name: 'Elena Rostova', dept: 'Engineering', role: 'Senior Dev', pageRankT1: 0.0670, pageRankT2: 0.0716, deltaPageRank: 0.0046, deltaGrowthPct: 6.8, inFluxT1: 391.2, inFluxT2: 399.7, deltaFlux: 8.5, trend: '📈 LEADER ÉMERGENT' }
      ]
    },
    benchmark: {
      rowsProcessed: 2500,
      totalNodes: 15,
      totalEdges: 2500,
      parseTimeMs: 1.28,
      pageRankTimeMs: 0.11,
      totalTimeMs: 1.48
    },
    auditReport: {
      healthScore: 55.2,
      grade: 'C',
      density: 83.3,
      reciprocity: 84.6,
      crossDeptConnectivity: 76.2,
      resilienceScore: 0.0,
      executiveSummary: 'Risques de surcharge et de silos nécessitant un suivi managérial.',
      recommendations: [
        'Rééquilibrer la charge des 15 employés en Bus Factor critique pour sécuriser les projets.'
      ]
    }
  };

  useEffect(() => {
    fetch('http://localhost:8080/api/ona')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setBackendOnline(true);
        if (json.cascadingSimulation?.resignedNodeIds) {
          setCustomResignedNodes(json.cascadingSimulation.resignedNodeIds);
        }
      })
      .catch(() => {
        setData(mockData);
        setBackendOnline(false);
      });
  }, []);

  const currentData = data || mockData;
  const silosList = currentData.silos || mockData.silos;
  const busFactorList = currentData.busFactor || mockData.busFactor;
  const benchmark = currentData.benchmark || mockData.benchmark;
  const auditReport = currentData.auditReport || mockData.auditReport;
  const boundarySpanners = currentData.boundarySpanners || mockData.boundarySpanners;
  const communities = currentData.communities || mockData.communities;
  const cascading = currentData.cascadingSimulation || mockData.cascadingSimulation;
  const temporal = currentData.temporalReport || mockData.temporalReport;

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

  const getCommunityColor = (commId) => {
    const colors = ['#38bdf8', '#a855f7', '#34d399', '#f59e0b', '#ec4899', '#6366f1'];
    return colors[commId % colors.length];
  };

  // Dynamic Layout Positioning Engine (Circle, Department Clusters, Tribe Clusters)
  const nodePositions = useMemo(() => {
    const total = currentData.nodes.length;
    const positions = {};

    if (layoutMode === 'circle') {
      const cx = 375;
      const cy = 260;
      const radius = Math.min(220, 150 + total * 4);
      currentData.nodes.forEach((node, idx) => {
        const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
        positions[node.id] = {
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle)
        };
      });
    } else if (layoutMode === 'departments') {
      // Clustered by department
      const depts = [...new Set(currentData.nodes.map(n => n.dept))];
      const deptCenters = {};
      depts.forEach((d, i) => {
        const angle = (i / depts.length) * 2 * Math.PI - Math.PI / 2;
        deptCenters[d] = {
          x: 375 + 175 * Math.cos(angle),
          y: 260 + 155 * Math.sin(angle)
        };
      });
      const deptCounters = {};
      currentData.nodes.forEach((node) => {
        const d = node.dept;
        deptCounters[d] = (deptCounters[d] || 0);
        const center = deptCenters[d];
        const offsetAngle = deptCounters[d] * 1.3;
        const dist = 36 * (deptCounters[d] + 1) * 0.6;
        positions[node.id] = {
          x: center.x + dist * Math.cos(offsetAngle),
          y: center.y + dist * Math.sin(offsetAngle)
        };
        deptCounters[d]++;
      });
    } else if (layoutMode === 'tribes') {
      // Clustered by community
      const commCount = communities.length || 3;
      const commCenters = {};
      for (let c = 0; c < commCount; c++) {
        const angle = (c / commCount) * 2 * Math.PI - Math.PI / 2;
        commCenters[c] = {
          x: 375 + 160 * Math.cos(angle),
          y: 260 + 140 * Math.sin(angle)
        };
      }
      currentData.nodes.forEach((node, idx) => {
        let commId = 0;
        communities.forEach(c => {
          if (c.memberIds?.includes(node.id)) commId = c.id;
        });
        const center = commCenters[commId] || { x: 375, y: 260 };
        const angle = (idx * 1.5);
        const dist = 30 + (idx % 3) * 25;
        positions[node.id] = {
          x: center.x + dist * Math.cos(angle),
          y: center.y + dist * Math.sin(angle)
        };
      });
    }

    return positions;
  }, [currentData.nodes, layoutMode, communities]);

  // Filtered nodes matching search query
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return currentData.nodes
      .filter(n => n.name.toLowerCase().includes(q) || n.role.toLowerCase().includes(q) || n.dept.toLowerCase().includes(q))
      .map(n => n.id);
  }, [currentData.nodes, searchQuery]);

  const toggleResignedNode = (nodeId) => {
    if (customResignedNodes.includes(nodeId)) {
      setCustomResignedNodes(customResignedNodes.filter(id => id !== nodeId));
    } else {
      setCustomResignedNodes([...customResignedNodes, nodeId]);
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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Controls & ONA Metrics */}
      <aside className="sidebar">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#06b6d4', fontWeight: 800, letterSpacing: '-0.02em' }}>
              🌐 MailInfluence-ONA
            </h2>
            <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '12px', background: backendOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)', color: backendOnline ? '#34d399' : '#9ca3af', border: backendOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(156, 163, 175, 0.3)', fontWeight: 600 }}>
              {backendOnline ? '🟢 Engine C11' : '⚪ Démo'}
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
            Intelligence Réseau & Théorie des Graphes en C
          </p>
        </div>

        {/* Live Search Bar */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '10px', top: '7px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔍
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un collaborateur, rôle, équipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '8px', top: '6px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* 8 Navigation Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: 'rgba(11, 15, 25, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button className={`tab-btn ${activeTab === 'velocity' ? 'active' : ''}`} onClick={() => setActiveTab('velocity')}>
            📈 Vélocité
          </button>
          <button className={`tab-btn ${activeTab === 'crashtest' ? 'active' : ''}`} onClick={() => setActiveTab('crashtest')}>
            🌪️ Crash
          </button>
          <button className={`tab-btn ${activeTab === 'tribes' ? 'active' : ''}`} onClick={() => setActiveTab('tribes')}>
            🔮 Tribus
          </button>
          <button className={`tab-btn ${activeTab === 'bridges' ? 'active' : ''}`} onClick={() => setActiveTab('bridges')}>
            🌉 Ponts
          </button>
          <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            📑 Audit
          </button>
          <button className={`tab-btn ${activeTab === 'influence' ? 'active' : ''}`} onClick={() => setActiveTab('influence')}>
            🏆 Leaders
          </button>
          <button className={`tab-btn ${activeTab === 'busfactor' ? 'active' : ''}`} onClick={() => setActiveTab('busfactor')}>
            ⚠️ Risque
          </button>
          <button className={`tab-btn ${activeTab === 'silos' ? 'active' : ''}`} onClick={() => setActiveTab('silos')}>
            🏢 Silos
          </button>
        </div>

        {/* Tab 0: Vélocité & Analyse Temporelle */}
        {activeTab === 'velocity' && temporal && (
          <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '310px', overflowY: 'auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  ROI Réorganisation & Dynamique
                </span>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: '#047857', color: '#fff', fontWeight: 700 }}>
                  {temporal.risingLeadersCount} Leaders Émergents
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
                  {temporal.deltaCrossDept >= 0 ? `+${temporal.deltaCrossDept.toFixed(1)}%` : `${temporal.deltaCrossDept.toFixed(1)}%`}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#d1fae5' }}>
                  Connectivité Transversale
                </span>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#d1d5db', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                {temporal.executiveSummary}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '4px', background: 'rgba(11, 15, 25, 0.8)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setTimeView('t1')}
                style={{
                  flex: 1,
                  padding: '4px',
                  fontSize: '0.65rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: timeView === 't1' ? '#1e293b' : 'transparent',
                  color: timeView === 't1' ? '#38bdf8' : '#9ca3af',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                T1: Avant
              </button>
              <button
                onClick={() => setTimeView('t2')}
                style={{
                  flex: 1,
                  padding: '4px',
                  fontSize: '0.65rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: timeView === 't2' ? '#1e293b' : 'transparent',
                  color: timeView === 't2' ? '#38bdf8' : '#9ca3af',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                T2: Après
              </button>
              <button
                onClick={() => setTimeView('delta')}
                style={{
                  flex: 1,
                  padding: '4px',
                  fontSize: '0.65rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: timeView === 'delta' ? '#065f46' : 'transparent',
                  color: timeView === 'delta' ? '#34d399' : '#9ca3af',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Δ Dérivée
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {temporal.metrics
                .slice()
                .sort((a, b) => b.deltaGrowthPct - a.deltaGrowthPct)
                .map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const nodeObj = currentData.nodes.find(n => n.id === item.nodeId);
                      if (nodeObj) setSelectedNode(nodeObj);
                    }}
                    style={{
                      background: selectedNode?.id === item.nodeId ? 'rgba(30, 41, 59, 0.9)' : 'var(--card-bg)',
                      padding: '7px 9px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedNode?.id === item.nodeId ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{item.name}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: item.deltaGrowthPct >= 5.0 ? '#064e3b' : (item.deltaGrowthPct <= -5.0 ? '#7f1d1d' : '#1e293b'),
                        color: item.deltaGrowthPct >= 5.0 ? '#6ee7b7' : (item.deltaGrowthPct <= -5.0 ? '#fca5a5' : '#9ca3af'),
                        fontWeight: 700
                      }}>
                        {item.deltaGrowthPct >= 0 ? `+${item.deltaGrowthPct.toFixed(1)}%` : `${item.deltaGrowthPct.toFixed(1)}%`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>PR: {item.pageRankT1.toFixed(3)} → <strong>{item.pageRankT2.toFixed(3)}</strong></span>
                      <span style={{ color: item.deltaGrowthPct >= 5.0 ? '#34d399' : '#9ca3af', fontWeight: 600 }}>{item.trend}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 1: Crash Test (Tarjan SCC) */}
        {activeTab === 'crashtest' && cascading && (
          <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '310px', overflowY: 'auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${cascading.riskLevel === 'CRITIQUE' || cascading.riskLevel === 'CATASTROPHIQUE' ? '#ef4444' : '#f59e0b'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Crash Test Réseau (Tarjan)
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#7f1d1d',
                  color: '#fca5a5',
                  fontWeight: 700
                }}>
                  🚨 {cascading.riskLevel}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>
                  {cascading.fragmentationIndex.toFixed(1)}%
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Fragmentation Réseau
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#e2e8f0', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                {cascading.impactSummary}
              </p>
            </div>

            <div style={{ background: 'rgba(11, 15, 25, 0.8)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Départs Simulés:</span>
                <strong style={{ color: '#ef4444' }}>{customResignedNodes.length} personnes</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Liaisons Emails Rompues:</span>
                <strong>{cascading.brokenEdgesCount} flux</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Composantes Tarjan (SCC):</span>
                <strong>{cascading.totalComponents} îlots</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#fca5a5', display: 'block', marginBottom: '6px' }}>
                Simuler le départ de collaborateurs :
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {currentData.nodes.slice(0, 7).map((node) => {
                  const isResigned = customResignedNodes.includes(node.id);
                  return (
                    <div
                      key={node.id}
                      onClick={() => toggleResignedNode(node.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isResigned ? '#450a0a' : 'rgba(30, 41, 59, 0.7)',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: isResigned ? '1px solid #ef4444' : '1px solid var(--border-subtle)'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: isResigned ? '#fca5a5' : '#f3f4f6', textDecoration: isResigned ? 'line-through' : 'none' }}>
                        {node.name} ({node.dept})
                      </span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isResigned ? '#ef4444' : '#9ca3af' }}>
                        {isResigned ? '❌ DÉPART' : '🟢 ACTIF'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tribus Informelles (LPA) */}
        {activeTab === 'tribes' && communities && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>Tribus Informelles (LPA)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{communities.length} clans détectés</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '290px', overflowY: 'auto' }}>
              {communities.map((comm, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCommunity(selectedCommunity === comm.id ? null : comm.id);
                    setSelectedDept(null);
                  }}
                  style={{
                    background: selectedCommunity === comm.id ? '#1e293b' : 'var(--card-bg)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: selectedCommunity === comm.id ? `1px solid ${getCommunityColor(comm.id)}` : '1px solid var(--border-subtle)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: getCommunityColor(comm.id) }}>
                      {comm.label}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#064e3b',
                      color: '#6ee7b7',
                      fontWeight: 600
                    }}>
                      {comm.memberCount} membres
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: '#374151', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{
                      width: `${Math.min(100, comm.cohesionScore)}%`,
                      height: '100%',
                      background: getCommunityColor(comm.id),
                      borderRadius: '2px'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Interne: <strong>{comm.internalFlux.toFixed(0)}</strong></span>
                    <span>Cohésion: <strong style={{ color: '#38bdf8' }}>{comm.cohesionScore.toFixed(1)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Ponts Informels (Brandes) */}
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
                    onClick={() => { setSelectedNode(nodeObj); setSelectedDept(null); setSelectedCommunity(null); }}
                    style={{
                      background: selectedNode?.id === item.nodeId ? '#1e293b' : 'var(--card-bg)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedNode?.id === item.nodeId ? '1px solid #c084fc' : '1px solid var(--border-subtle)',
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
                        {item.isKeyBroker ? '🌉 CONNECTEUR' : '🔗 PASSERELLE'}
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

        {/* Tab 4: Audit de Santé Organisationnelle */}
        {activeTab === 'audit' && auditReport && (
          <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '290px', overflowY: 'auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
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

            <div style={{ background: 'rgba(11, 15, 25, 0.8)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

            <div style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <h5 style={{ margin: '0 0 4px 0', color: '#f59e0b', fontSize: '0.74rem' }}>💡 Recommandations RH & Management</h5>
              <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '0.68rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {auditReport.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 5: Leaders Informels (PageRank) */}
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
                    onClick={() => { setSelectedNode(item); setSelectedDept(null); setSelectedCommunity(null); }}
                    style={{
                      background: selectedNode?.id === item.id ? '#1e293b' : 'var(--card-bg)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedNode?.id === item.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
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

        {/* Tab 6: Bus Factor & Risque de Surcharge */}
        {activeTab === 'busfactor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b' }}>Risque de Surcharge (Max-Heap)</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Top Risques</span>
            </div>
            <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '290px', overflowY: 'auto' }}>
              {busFactorList.map((item, idx) => {
                const nodeObj = currentData.nodes.find(n => n.id === item.nodeId) || { id: item.nodeId, name: item.name, dept: item.dept, role: item.role, pageRank: 0.07, betweenness: 1.0 };
                return (
                  <div
                    key={idx}
                    onClick={() => { setSelectedNode(nodeObj); setSelectedDept(null); setSelectedCommunity(null); }}
                    style={{
                      background: selectedNode?.id === item.nodeId ? '#1e293b' : 'var(--card-bg)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedNode?.id === item.nodeId ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
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

        {/* Tab 7: Silos Organisationnels */}
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
                  onClick={() => { setSelectedDept(selectedDept === silo.dept ? null : silo.dept); setSelectedCommunity(null); }}
                  style={{
                    background: selectedDept === silo.dept ? '#1f2937' : 'rgba(11, 15, 25, 0.8)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: selectedDept === silo.dept ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
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
          <div style={{ background: 'rgba(17, 24, 39, 0.95)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h4 style={{ margin: 0, color: '#c084fc', fontSize: '0.85rem' }}>🔎 Inspecteur Collaborateur</h4>
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
          <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '10px', borderRadius: '8px', border: '1px solid #0284c7' }}>
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
      <main className="graph-canvas" onMouseMove={handleMouseMove}>
        {/* Header Controls & Benchmark */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f9fafb', fontWeight: 800, letterSpacing: '-0.02em' }}>
              🕸️ Visualiseur Interactif du Graphe ONA
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {activeTab === 'velocity' ? `Mode Analyse Temporelle (Vue: ${timeView.toUpperCase()}) : Leaders émergents et dérivée d'influence.` :
               activeTab === 'crashtest' ? `Mode Crash Test : ${customResignedNodes.length} départs simulés (Composantes de Tarjan).` :
               selectedCommunity !== null ? `Filtrage actif sur : Tribu ${selectedCommunity + 1}` : 
               selectedDept ? `Filtrage actif sur : ${selectedDept}` : 
               'Survolez un employé ou une liaison pour inspecter les métriques en temps réel.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Layout Mode Selector */}
            <div style={{ display: 'flex', background: 'rgba(17, 24, 39, 0.8)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setLayoutMode('circle')}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: layoutMode === 'circle' ? '#1e293b' : 'transparent',
                  color: layoutMode === 'circle' ? '#38bdf8' : '#9ca3af',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ⭕ Roue
              </button>
              <button
                onClick={() => setLayoutMode('departments')}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: layoutMode === 'departments' ? '#1e293b' : 'transparent',
                  color: layoutMode === 'departments' ? '#38bdf8' : '#9ca3af',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🏢 Équipes
              </button>
              <button
                onClick={() => setLayoutMode('tribes')}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: layoutMode === 'tribes' ? '#1e293b' : 'transparent',
                  color: layoutMode === 'tribes' ? '#38bdf8' : '#9ca3af',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔮 Tribus
              </button>
            </div>

            {/* Benchmark Badge */}
            {benchmark && (
              <div style={{
                background: 'rgba(17, 24, 39, 0.85)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.75rem',
                backdropFilter: 'blur(8px)'
              }}>
                <span>⚡ <strong>{benchmark.rowsProcessed.toLocaleString()}</strong> emails</span>
                <span style={{ color: 'var(--border-subtle)' }}>|</span>
                <span>Parsing: <strong style={{ color: '#38bdf8' }}>{benchmark.parseTimeMs.toFixed(2)} ms</strong></span>
                <span style={{ color: 'var(--border-subtle)' }}>|</span>
                <span>PageRank: <strong style={{ color: '#34d399' }}>{benchmark.pageRankTimeMs.toFixed(2)} ms</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Interactive SVG Graph Visualization */}
        <div style={{ flex: 1, background: 'rgba(11, 15, 25, 0.65)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
          
          {/* Real-time Hover Tooltip */}
          {hoveredNode && (
            <div className="graph-tooltip" style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}>
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.82rem' }}>{hoveredNode.name}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>{hoveredNode.role} • <span style={{ color: getDeptColor(hoveredNode.dept) }}>{hoveredNode.dept}</span></div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px', paddingTop: '4px', fontSize: '0.68rem', display: 'flex', gap: '8px' }}>
                <span>PR: <strong>{hoveredNode.pageRank?.toFixed(4)}</strong></span>
                <span>Betweenness: <strong>{hoveredNode.betweenness?.toFixed(1)}</strong></span>
              </div>
            </div>
          )}

          {hoveredEdge && (
            <div className="graph-tooltip" style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.78rem' }}>
                {hoveredEdge.srcNode?.name} ➔ {hoveredEdge.tgtNode?.name}
              </div>
              <div style={{ color: '#38bdf8', fontSize: '0.72rem', marginTop: '2px' }}>
                Volume échangé: <strong>{hoveredEdge.weight?.toFixed(1)} emails</strong>
              </div>
            </div>
          )}

          <svg width="100%" height="100%" viewBox="0 0 750 520" style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
              <marker id="arrow-highlight" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
              </marker>
            </defs>

            {/* Render Edges */}
            {currentData.edges.map((edge, idx) => {
              const sourcePos = nodePositions[edge.source] || { x: 375, y: 260 };
              const targetPos = nodePositions[edge.target] || { x: 375, y: 260 };

              const srcNode = currentData.nodes[edge.source];
              const tgtNode = currentData.nodes[edge.target];
              const isInternal = srcNode?.dept === tgtNode?.dept;

              const isSourceResigned = activeTab === 'crashtest' && customResignedNodes.includes(edge.source);
              const isTargetResigned = activeTab === 'crashtest' && customResignedNodes.includes(edge.target);
              const isBrokenEdge = isSourceResigned || isTargetResigned;

              const activeCommunityObj = selectedCommunity !== null ? communities.find(c => c.id === selectedCommunity) : null;
              const isCommunityEdge = activeCommunityObj && 
                activeCommunityObj.memberIds?.includes(edge.source) && 
                activeCommunityObj.memberIds?.includes(edge.target);

              const isMatchSearch = matchingNodeIds.length > 0 && (matchingNodeIds.includes(edge.source) || matchingNodeIds.includes(edge.target));
              const isSelected = (selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)) ||
                                 (selectedDept && (srcNode?.dept === selectedDept || tgtNode?.dept === selectedDept)) ||
                                 isCommunityEdge ||
                                 isMatchSearch;

              return (
                <line
                  key={idx}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={isBrokenEdge ? '#7f1d1d' : (isSelected ? (isCommunityEdge ? getCommunityColor(selectedCommunity) : (isInternal ? '#3b82f6' : '#38bdf8')) : '#334155')}
                  strokeWidth={isBrokenEdge ? 1.0 : (edge.weight ? Math.max(1.2, Math.min(4.0, edge.weight * 0.8)) : 1.5)}
                  strokeDasharray={isBrokenEdge ? '2,4' : (isInternal ? 'none' : '4,2')}
                  markerEnd={isBrokenEdge ? 'none' : (isSelected ? 'url(#arrow-highlight)' : 'url(#arrow)')}
                  opacity={isBrokenEdge ? 0.25 : (selectedNode || selectedDept || selectedCommunity !== null || matchingNodeIds.length > 0 ? (isSelected ? 0.95 : 0.08) : 0.65)}
                  onMouseEnter={() => setHoveredEdge({ ...edge, srcNode, tgtNode })}
                  onMouseLeave={() => setHoveredEdge(null)}
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                />
              );
            })}

            {/* Render Nodes */}
            {currentData.nodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 375, y: 260 };

              const isResigned = activeTab === 'crashtest' && customResignedNodes.includes(node.id);
              const activeCommunityObj = selectedCommunity !== null ? communities.find(c => c.id === selectedCommunity) : null;
              const isNodeInCommunity = activeCommunityObj?.memberIds?.includes(node.id);

              const temporalMetric = temporal?.metrics?.find(m => m.nodeId === node.id);
              const isRisingLeader = temporalMetric && temporalMetric.deltaGrowthPct >= 5.0;
              const isMatchSearch = matchingNodeIds.includes(node.id);

              const isSelected = selectedNode?.id === node.id || 
                                 (selectedDept && node.dept === selectedDept) ||
                                 isNodeInCommunity ||
                                 isMatchSearch;

              let nodePageRank = node.pageRank || 0.06;
              if (activeTab === 'velocity' && temporalMetric) {
                if (timeView === 't1') nodePageRank = temporalMetric.pageRankT1;
                else if (timeView === 't2') nodePageRank = temporalMetric.pageRankT2;
              }

              const radius = 20 + nodePageRank * 45;
              const deptColor = getDeptColor(node.dept);
              const isCriticalBusFactor = busFactorList.find(b => b.nodeId === node.id)?.isCritical;
              const isKeyBridge = boundarySpanners.find(b => b.nodeId === node.id)?.isKeyBroker;

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${pos.x}, ${pos.y})`} 
                  onClick={() => {
                    if (activeTab === 'crashtest') {
                      toggleResignedNode(node.id);
                    } else {
                      setSelectedNode(node);
                      setSelectedDept(null);
                    }
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glowing Green ring for Rising Leaders in Velocity Mode */}
                  {activeTab === 'velocity' && isRisingLeader && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.0"
                      strokeDasharray="3,3"
                      opacity="0.9"
                    />
                  )}

                  {/* Warning pulse ring for critical Bus Factor */}
                  {isCriticalBusFactor && !isResigned && activeTab !== 'velocity' && (
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
                  {isKeyBridge && !isResigned && activeTab !== 'velocity' && (
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
                    fill={isResigned ? '#3f1010' : (isSelected ? '#1e293b' : '#111827')}
                    stroke={isResigned ? '#ef4444' : (isSelected ? (selectedCommunity !== null ? getCommunityColor(selectedCommunity) : '#38bdf8') : (activeTab === 'velocity' && isRisingLeader ? '#22c55e' : deptColor))}
                    strokeWidth={isSelected ? 3.5 : (activeTab === 'velocity' && isRisingLeader ? 3 : 2)}
                    strokeDasharray={isResigned ? '3,3' : 'none'}
                    opacity={isResigned ? 0.6 : 1.0}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={isResigned ? '#fca5a5' : '#f9fafb'}
                    fontSize="10"
                    fontWeight="700"
                    style={{ pointerEvents: 'none' }}
                  >
                    {isResigned ? '❌ ' + node.name.split(' ')[0] : node.name.split(' ')[0]}
                  </text>
                  <text
                    textAnchor="middle"
                    dy={radius + 14}
                    fill={isResigned ? '#f87171' : deptColor}
                    fontSize="9"
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
