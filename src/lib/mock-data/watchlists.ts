// ScoutCopilot — Mock watchlist data

import type { MockWatchlist } from './types'

export const watchlists: MockWatchlist[] = [
  {
    id: 'w1',
    name: 'Left-Back Targets U23',
    description: 'Young fullbacks for summer window recruitment',
    playerCount: 8,
    lastUpdated: '2h ago',
    alertCount: 2,
    category: 'position',
    players: [
      { id: 'p2', name: 'Enzo Valenti', club: 'Crescent Athletic', position: 'LB/LM', age: 23, nationality: 'Italy', image: '/avatars/player-2.webp', keyMetric: { value: '6.7', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-02-15', scoutScore: 88 },
      { id: 'p3', name: 'Dani Cortez', club: 'Atlético Ronda', position: 'LB/RB', age: 22, nationality: 'Spain', image: '/avatars/player-3.webp', keyMetric: { value: '87.6%', label: 'Pass Accuracy' }, alertStatus: 'form_change', addedDate: '2026-02-18', scoutScore: 76 },
      { id: 'p6', name: 'Bálint Varga', club: 'Southport City', position: 'LB', age: 22, nationality: 'Hungary', image: '/avatars/player-6.webp', keyMetric: { value: '5.8', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-03-01', scoutScore: 79 },
      { id: 'wp12', name: 'K. Papadopoulos', club: 'Olympique Azur', position: 'LB/CB', age: 21, nationality: 'Greece', image: '/avatars/player-14.webp', keyMetric: { value: '7.2', label: 'Prog. Carries/90' }, alertStatus: 'injury', addedDate: '2026-03-12', scoutScore: 82 },
    ],
  },
  {
    id: 'w2',
    name: 'Serie A Strikers',
    description: 'Monitoring top Serie A forwards for potential transfer targets',
    playerCount: 12,
    lastUpdated: '5h ago',
    alertCount: 0,
    category: 'transfer',
    players: [
      { id: 'wp4', name: 'Ousmane Diallo', club: 'Inter Azzurra', position: 'CF/LW', age: 28, nationality: 'Senegal', image: '/avatars/player-15.webp', keyMetric: { value: '0.68', label: 'npxG/90' }, alertStatus: 'price_change', addedDate: '2025-12-02', scoutScore: 92 },
      { id: 'wp5', name: 'Lars Henriksen', club: 'Northgate United', position: 'CF', age: 25, nationality: 'Denmark', image: '/avatars/player-16.webp', keyMetric: { value: '2.45', label: 'Succ. Dribbles' }, alertStatus: 'stable', addedDate: '2025-12-18', scoutScore: 85 },
    ],
  },
  {
    id: 'w3',
    name: 'January Window Shortlist',
    description: 'Priority targets approved by sporting director',
    playerCount: 5,
    lastUpdated: '12m ago',
    alertCount: 3,
    category: 'transfer',
    players: [
      { id: 'wp6', name: 'Luca Marchetti', club: 'Lazio Blu', position: 'LB/LWB', age: 26, nationality: 'Italy', image: '/avatars/player-13.webp', keyMetric: { value: '8.42', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2025-11-15', scoutScore: 88 },
      { id: 'wp7', name: 'Alessandro Conti', club: 'Inter Azzurra', position: 'LWB', age: 28, nationality: 'Italy', image: '/avatars/player-17.webp', keyMetric: { value: '3.12', label: 'Key Passes/90' }, alertStatus: 'injury', addedDate: '2025-12-10', scoutScore: 90 },
      { id: 'wp8', name: 'Nicolás Herrera', club: 'AS Roma Rossa', position: 'RW/AM', age: 23, nationality: 'Argentina', image: '/avatars/player-18.webp', keyMetric: { value: '4.18', label: 'SCA/90' }, alertStatus: 'price_change', addedDate: '2026-01-05', scoutScore: 87 },
    ],
  },
  {
    id: 'w4',
    name: 'Youth Academy Targets',
    description: 'U18 prospects from secondary leagues',
    playerCount: 15,
    lastUpdated: '1d ago',
    alertCount: 1,
    category: 'youth',
    players: [
      { id: 'p10', name: 'Mateo Rivas', club: 'Miami Coast FC', position: 'LB', age: 19, nationality: 'Argentina', image: '/avatars/player-10.webp', keyMetric: { value: '3.8', label: 'Prog. Carries/90' }, alertStatus: 'form_change', addedDate: '2026-03-10', scoutScore: 62 },
      { id: 'wp10', name: 'Jakub Nowicki', club: 'Wisła Kraków', position: 'CM', age: 17, nationality: 'Poland', image: '/avatars/player-19.webp', keyMetric: { value: '2.8', label: 'Key Passes/90' }, alertStatus: 'stable', addedDate: '2026-02-28', scoutScore: 71 },
      { id: 'wp11', name: 'Tomás Ferreira', club: 'Vitória Guimarães B', position: 'RW', age: 18, nationality: 'Portugal', image: '/avatars/player-20.webp', keyMetric: { value: '4.2', label: 'Succ. Dribbles' }, alertStatus: 'stable', addedDate: '2026-02-20', scoutScore: 68 },
    ],
  },
  {
    id: 'w5',
    name: 'Midfielder Replacements',
    description: 'Potential replacements for departing midfielders',
    playerCount: 6,
    lastUpdated: '3d ago',
    alertCount: 0,
    category: 'position',
    players: [
      { id: 'p7', name: 'Samir Benali', club: 'Midland Rovers', position: 'LB/LWB', age: 23, nationality: 'Algeria', image: '/avatars/player-7.webp', keyMetric: { value: '6.2', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-01-15', scoutScore: 85 },
      { id: 'p9', name: 'Stijn de Graaf', club: 'Harton Villa', position: 'LB/LWB', age: 24, nationality: 'Netherlands', image: '/avatars/player-9.webp', keyMetric: { value: '6.9', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-01-20', scoutScore: 81 },
    ],
  },
  {
    id: 'w6',
    name: 'Budget Options <€5M',
    description: 'High-value targets within limited transfer budget',
    playerCount: 9,
    lastUpdated: '1w ago',
    alertCount: 4,
    category: 'transfer',
    players: [
      { id: 'p5', name: 'Rémi Blanchard', club: 'Olympique Azur', position: 'LB/LM', age: 23, nationality: 'France', image: '/avatars/player-5.webp', keyMetric: { value: '4.3', label: 'Prog. Carries/90' }, alertStatus: 'price_change', addedDate: '2026-02-05', scoutScore: 54 },
      { id: 'p10', name: 'Mateo Rivas', club: 'Miami Coast FC', position: 'LB', age: 19, nationality: 'Argentina', image: '/avatars/player-10.webp', keyMetric: { value: '3.8', label: 'Prog. Carries/90' }, alertStatus: 'price_change', addedDate: '2026-03-01', scoutScore: 62 },
      { id: 'p8', name: 'Pablo Navarro', club: 'Sporting Castilla', position: 'LB', age: 23, nationality: 'Spain', image: '/avatars/player-8.webp', keyMetric: { value: '5.4', label: 'Prog. Carries/90' }, alertStatus: 'stable', addedDate: '2026-02-12', scoutScore: 73 },
    ],
  },
]
