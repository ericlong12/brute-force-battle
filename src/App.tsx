import { useState, useEffect } from 'react';
import './styles.css';
import { LiveAttack } from './modes/LiveAttack';
import { DefenderControls } from './modes/DefenderControls';
import { HashLab } from './modes/HashLab';
import { Scenarios } from './modes/Scenarios';

const modes = [
	{ id: 'live', name: 'Live Attack', component: <LiveAttack /> },
	{ id: 'defender', name: 'Defender Controls', component: <DefenderControls /> },
	{ id: 'hashlab', name: 'Hash Lab', component: <HashLab /> },
	{ id: 'scenarios', name: 'Scenarios', component: <Scenarios /> },
];

export function App() {
	const [mode, setMode] = useState(modes[0].id);
	const [theme, setTheme] = useState<'light' | 'dark'>('light');
	useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

	return (
		<div className="app-shell">
			<button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span></button>
			<header className="app-header">
				<h1>Brute Force Battle</h1>
				<div className="subtitle">Understand how password length, hashing, and defenses shift cracking probability.</div>
				<div className="meta"><span>Modes: Offline brute force, Online defenses, Hash/KDF comparisons, Scenario presets.</span></div>
			</header>
			<nav className="mode-nav">
				{modes.map(m => (
					<button key={m.id} onClick={() => setMode(m.id)} className={`mode-btn ${mode === m.id ? 'active' : ''}`}>{m.name}</button>
				))}
			</nav>
			<main className="main-panel">
				{modes.find(m => m.id === mode)?.component}
			</main>
		</div>
	);
}
