import React, { useState } from 'react';
import './index.css';

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null);

  const influencers = [
    { name: 'Sarah Connor', role: 'CTO', dept: 'Engineering', pageRank: 0.312, betweenness: 18.2, badgeClass: 'badge-eng' },
    { name: 'Alex Mercer', role: 'CEO', dept: 'Executive', pageRank: 0.245, betweenness: 12.5, badgeClass: 'badge-exec' },
    { name: 'David Miller', role: 'Tech Lead', dept: 'Engineering', pageRank: 0.189, betweenness: 22.4, badgeClass: 'badge-eng' },
    { name: 'Claire Bennet', role: 'HR Director', dept: 'HR', pageRank: 0.145, betweenness: 15.0, badgeClass: 'badge-hr' },
    { name: 'Mark Sloan', role: 'VP Sales', dept: 'Sales', pageRank: 0.109, betweenness: 8.1, badgeClass: 'badge-sales' }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar Controls & ONA Metrics */}
      <aside className="sidebar">
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#06b6d4' }}>🌐 MailInfluence-ONA</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organizational Network Analysis</p>
        </div>

        <div>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>🏆 Top Leaders Informels (PageRank)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {influencers.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedNode(item)}
                style={{
                  background: 'var(--card-bg)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedNode?.name === item.name ? '1px solid var(--accent-cyan)' : '1px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{idx + 1}. {item.name}</span>
                  <span className={`badge ${item.badgeClass}`}>{item.dept}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  PageRank: <strong>{item.pageRank}</strong> | Intermédiarité: <strong>{item.betweenness}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedNode && (
          <div style={{ background: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent-purple)' }}>🔎 Détails du Nœud</h4>
            <div style={{ fontSize: '0.85rem' }}>
              <p style={{ margin: '4px 0' }}><strong>Nom:</strong> {selectedNode.name}</p>
              <p style={{ margin: '4px 0' }}><strong>Rôle:</strong> {selectedNode.role}</p>
              <p style={{ margin: '4px 0' }}><strong>Département:</strong> {selectedNode.dept}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Interactive Graph Visualizer Area */}
      <main className="graph-canvas" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🕸️</div>
          <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0' }}>Visualiseur de Graphe D'Influence Inter-Équipes</h3>
          <p style={{ maxWidth: '450px', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Représentation graphique dynamique des 50+ employés et leurs liaisons emails.
            Sélectionnez un nœud dans le menu latéral pour inspecter son impact ONA.
          </p>
        </div>
      </main>
    </div>
  );
}
