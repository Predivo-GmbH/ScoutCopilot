// ScoutCopilot — Mock squad data

import type { SquadPosition, SquadPlayer, MockSquad, FormationType, FormationSlot, MockPlayerReport } from './types'

export const positionLabels: Record<SquadPosition, string> = {
  GK: 'positionLabels.goalkeeper',
  CB: 'positionLabels.centreBack',
  LB: 'positionLabels.leftBack',
  RB: 'positionLabels.rightBack',
  CDM: 'positionLabels.defensiveMidfielder',
  CM: 'positionLabels.centralMidfielder',
  CAM: 'positionLabels.attackingMidfielder',
  LW: 'positionLabels.leftWinger',
  RW: 'positionLabels.rightWinger',
  ST: 'positionLabels.striker',
}

export const formations: Record<FormationType, FormationSlot[]> = {
  '4-3-3': [
    { position: 'GK', label: 'GK', x: 50, y: 8 },
    { position: 'LB', label: 'LB', x: 15, y: 25 },
    { position: 'CB', label: 'CB', x: 38, y: 22 },
    { position: 'CB', label: 'CB', x: 62, y: 22 },
    { position: 'RB', label: 'RB', x: 85, y: 25 },
    { position: 'CM', label: 'CM', x: 30, y: 48 },
    { position: 'CDM', label: 'CDM', x: 50, y: 40 },
    { position: 'CM', label: 'CM', x: 70, y: 48 },
    { position: 'LW', label: 'LW', x: 18, y: 72 },
    { position: 'ST', label: 'ST', x: 50, y: 78 },
    { position: 'RW', label: 'RW', x: 82, y: 72 },
  ],
  '4-4-2': [
    { position: 'GK', label: 'GK', x: 50, y: 8 },
    { position: 'LB', label: 'LB', x: 15, y: 25 },
    { position: 'CB', label: 'CB', x: 38, y: 22 },
    { position: 'CB', label: 'CB', x: 62, y: 22 },
    { position: 'RB', label: 'RB', x: 85, y: 25 },
    { position: 'LW', label: 'LM', x: 15, y: 50 },
    { position: 'CM', label: 'CM', x: 38, y: 48 },
    { position: 'CM', label: 'CM', x: 62, y: 48 },
    { position: 'RW', label: 'RM', x: 85, y: 50 },
    { position: 'ST', label: 'ST', x: 38, y: 78 },
    { position: 'ST', label: 'ST', x: 62, y: 78 },
  ],
  '3-5-2': [
    { position: 'GK', label: 'GK', x: 50, y: 8 },
    { position: 'CB', label: 'CB', x: 30, y: 22 },
    { position: 'CB', label: 'CB', x: 50, y: 20 },
    { position: 'CB', label: 'CB', x: 70, y: 22 },
    { position: 'LB', label: 'LWB', x: 12, y: 45 },
    { position: 'CDM', label: 'CDM', x: 50, y: 40 },
    { position: 'CM', label: 'CM', x: 35, y: 52 },
    { position: 'CM', label: 'CM', x: 65, y: 52 },
    { position: 'RB', label: 'RWB', x: 88, y: 45 },
    { position: 'ST', label: 'ST', x: 38, y: 78 },
    { position: 'ST', label: 'ST', x: 62, y: 78 },
  ],
  '4-2-3-1': [
    { position: 'GK', label: 'GK', x: 50, y: 8 },
    { position: 'LB', label: 'LB', x: 15, y: 25 },
    { position: 'CB', label: 'CB', x: 38, y: 22 },
    { position: 'CB', label: 'CB', x: 62, y: 22 },
    { position: 'RB', label: 'RB', x: 85, y: 25 },
    { position: 'CDM', label: 'CDM', x: 38, y: 42 },
    { position: 'CDM', label: 'CDM', x: 62, y: 42 },
    { position: 'LW', label: 'LAM', x: 22, y: 62 },
    { position: 'CAM', label: 'CAM', x: 50, y: 60 },
    { position: 'RW', label: 'RAM', x: 78, y: 62 },
    { position: 'ST', label: 'ST', x: 50, y: 80 },
  ],
}

const radar = (spd: number, pas: number, dri: number, phy: number, def: number, cro: number) => [
  { label: 'Speed', value: spd, average: 65 },
  { label: 'Passing', value: pas, average: 62 },
  { label: 'Dribbling', value: dri, average: 58 },
  { label: 'Physical', value: phy, average: 66 },
  { label: 'Defending', value: def, average: 60 },
  { label: 'Crossing', value: cro, average: 55 },
]

const firstTeamPlayers: SquadPlayer[] = [
  // ── Goalkeepers ──
  { id: 'sq1', name: 'Frederik Holm', age: 28, nationality: 'Denmark', position: 'GK', shirtNumber: 1, contractUntil: '2028-06-30', weeklyWage: '€45k', marketValue: '€8.00m', status: 'fit', image: '/avatars/player-1.webp', overallRating: 78, stats: { 'Save %': 74, 'Clean Sheets': 12, 'Pass %': 81, 'xG Prevented': 4.2 }, radarData: radar(45, 68, 30, 80, 20, 25) },
  { id: 'sq2', name: 'Oskar Dahl', age: 21, nationality: 'Denmark', position: 'GK', shirtNumber: 13, contractUntil: '2029-06-30', weeklyWage: '€8k', marketValue: '€1.50m', status: 'fit', image: '/avatars/player-2.webp', overallRating: 62, stats: { 'Save %': 68, 'Clean Sheets': 3, 'Pass %': 75, 'xG Prevented': 1.1 }, radarData: radar(48, 60, 28, 72, 18, 22) },

  // ── Centre-Backs ──
  { id: 'sq3', name: 'Henrik Madsen', age: 34, nationality: 'Denmark', position: 'CB', shirtNumber: 4, contractUntil: '2027-06-30', weeklyWage: '€55k', marketValue: '€3.50m', status: 'fit', image: '/avatars/player-3.webp', overallRating: 74, stats: { 'Tackles/90': 3.8, 'Aerial %': 78, 'Pass %': 85, 'Interceptions': 2.4 }, radarData: radar(48, 72, 35, 82, 85, 30) },
  { id: 'sq4', name: 'Tomás Ferreira', age: 27, nationality: 'Portugal', position: 'CB', shirtNumber: 5, contractUntil: '2028-06-30', weeklyWage: '€65k', marketValue: '€14.00m', status: 'fit', image: '/avatars/player-4.webp', overallRating: 81, stats: { 'Tackles/90': 4.1, 'Aerial %': 74, 'Pass %': 89, 'Interceptions': 2.8 }, radarData: radar(62, 78, 45, 80, 82, 35) },
  { id: 'sq5', name: 'Emil Björk', age: 20, nationality: 'Sweden', position: 'CB', altPositions: ['CDM'], shirtNumber: 24, contractUntil: '2029-06-30', weeklyWage: '€12k', marketValue: '€3.00m', status: 'fit', image: '/avatars/player-5.webp', overallRating: 65, stats: { 'Tackles/90': 3.2, 'Aerial %': 68, 'Pass %': 82, 'Interceptions': 1.9 }, radarData: radar(65, 70, 42, 74, 72, 28) },

  // ── Left-Back (CRITICAL GAP — only 1 player, aging, contract expiring) ──
  { id: 'sq6', name: 'Jonas Eriksen', age: 30, nationality: 'Denmark', position: 'LB', shirtNumber: 3, contractUntil: '2027-01-31', weeklyWage: '€40k', marketValue: '€4.00m', status: 'fit', image: '/avatars/player-6.webp', overallRating: 70, stats: { 'xG/90': 0.05, 'Prog. Carries': 4.2, 'Crosses/90': 3.8, 'Tackles/90': 2.9 }, radarData: radar(68, 65, 55, 70, 72, 74) },

  // ── Right-Backs ──
  { id: 'sq7', name: 'Mikkel Andersen', age: 26, nationality: 'Denmark', position: 'RB', shirtNumber: 2, contractUntil: '2028-06-30', weeklyWage: '€50k', marketValue: '€10.00m', status: 'fit', image: '/avatars/player-7.webp', overallRating: 77, stats: { 'xG/90': 0.08, 'Prog. Carries': 5.1, 'Crosses/90': 4.5, 'Tackles/90': 3.2 }, radarData: radar(78, 70, 62, 72, 74, 80) },
  { id: 'sq8', name: 'Lucas Vidal', age: 22, nationality: 'Spain', position: 'RB', altPositions: ['RW'], shirtNumber: 22, contractUntil: '2029-06-30', weeklyWage: '€15k', marketValue: '€4.50m', status: 'fit', image: '/avatars/player-8.webp', overallRating: 68, stats: { 'xG/90': 0.06, 'Prog. Carries': 4.8, 'Crosses/90': 3.9, 'Tackles/90': 2.5 }, radarData: radar(82, 64, 65, 68, 66, 72) },

  // ── Defensive Midfielders ──
  { id: 'sq9', name: 'Rasmus Kjær', age: 29, nationality: 'Denmark', position: 'CDM', shirtNumber: 6, contractUntil: '2028-06-30', weeklyWage: '€60k', marketValue: '€12.00m', status: 'fit', image: '/avatars/player-9.webp', overallRating: 79, stats: { 'Tackles/90': 4.5, 'Pass %': 91, 'Prog. Carries': 3.2, 'Interceptions': 3.1 }, radarData: radar(58, 82, 52, 78, 80, 40) },
  { id: 'sq10', name: 'Yuki Tanaka', age: 23, nationality: 'Japan', position: 'CDM', altPositions: ['CM'], shirtNumber: 18, contractUntil: '2029-06-30', weeklyWage: '€20k', marketValue: '€6.00m', status: 'fit', image: '/avatars/player-10.webp', overallRating: 72, stats: { 'Tackles/90': 3.8, 'Pass %': 88, 'Prog. Carries': 4.0, 'Interceptions': 2.6 }, radarData: radar(64, 76, 58, 70, 74, 38) },

  // ── Central Midfielders ──
  { id: 'sq11', name: 'Simon Larsen', age: 26, nationality: 'Denmark', position: 'CM', shirtNumber: 8, contractUntil: '2028-06-30', weeklyWage: '€55k', marketValue: '€11.00m', status: 'fit', image: '/avatars/player-11.webp', overallRating: 80, stats: { 'xG/90': 0.15, 'Pass %': 90, 'Prog. Carries': 5.8, 'Key Passes/90': 2.4 }, radarData: radar(68, 85, 72, 70, 62, 55) },
  { id: 'sq12', name: 'Marco Basile', age: 24, nationality: 'Italy', position: 'CM', altPositions: ['CAM'], shirtNumber: 10, contractUntil: '2028-06-30', weeklyWage: '€50k', marketValue: '€13.00m', status: 'fit', image: '/avatars/player-12.webp', overallRating: 78, stats: { 'xG/90': 0.22, 'Pass %': 87, 'Prog. Carries': 6.2, 'Key Passes/90': 2.8 }, radarData: radar(70, 82, 78, 65, 55, 60) },
  { id: 'sq13', name: 'Noah Vestergaard', age: 19, nationality: 'Denmark', position: 'CM', shirtNumber: 30, contractUntil: '2030-06-30', weeklyWage: '€6k', marketValue: '€2.00m', status: 'fit', image: '/avatars/player-13.webp', overallRating: 60, stats: { 'xG/90': 0.08, 'Pass %': 83, 'Prog. Carries': 3.5, 'Key Passes/90': 1.2 }, radarData: radar(72, 68, 64, 58, 50, 42) },

  // ── Attacking Midfielder (HIGH GAP — only 1 player) ──
  { id: 'sq14', name: 'Liam O\'Connor', age: 25, nationality: 'Ireland', position: 'CAM', shirtNumber: 7, contractUntil: '2028-06-30', weeklyWage: '€48k', marketValue: '€9.50m', status: 'fit', image: '/avatars/player-14.webp', overallRating: 76, stats: { 'xG/90': 0.28, 'Pass %': 84, 'Key Passes/90': 3.2, 'Succ. Dribbles': 2.8 }, radarData: radar(74, 78, 80, 62, 38, 65) },

  // ── Left Wingers ──
  { id: 'sq15', name: 'André Silva', age: 27, nationality: 'Brazil', position: 'LW', shirtNumber: 11, contractUntil: '2027-06-30', weeklyWage: '€70k', marketValue: '€16.00m', status: 'fit', image: '/avatars/player-15.webp', overallRating: 82, stats: { 'xG/90': 0.35, 'Succ. Dribbles': 3.8, 'Prog. Carries': 7.2, 'Key Passes/90': 2.1 }, radarData: radar(88, 72, 86, 58, 30, 68) },
  { id: 'sq16', name: 'Kasper Munk', age: 21, nationality: 'Denmark', position: 'LW', altPositions: ['ST'], shirtNumber: 27, contractUntil: '2029-06-30', weeklyWage: '€10k', marketValue: '€3.50m', status: 'injured', image: '/avatars/player-16.webp', overallRating: 66, stats: { 'xG/90': 0.20, 'Succ. Dribbles': 2.5, 'Prog. Carries': 5.0, 'Key Passes/90': 1.4 }, radarData: radar(84, 60, 72, 55, 25, 58) },

  // ── Right Wingers (aging starter) ──
  { id: 'sq17', name: 'Viktor Sørensen', age: 33, nationality: 'Denmark', position: 'RW', shirtNumber: 9, contractUntil: '2027-06-30', weeklyWage: '€52k', marketValue: '€4.50m', status: 'fit', image: '/avatars/player-17.webp', overallRating: 71, stats: { 'xG/90': 0.25, 'Succ. Dribbles': 2.0, 'Prog. Carries': 4.5, 'Key Passes/90': 1.8 }, radarData: radar(62, 74, 65, 68, 35, 70) },
  { id: 'sq18', name: 'Amir Haddad', age: 20, nationality: 'Morocco', position: 'RW', altPositions: ['LW'], shirtNumber: 28, contractUntil: '2030-06-30', weeklyWage: '€8k', marketValue: '€2.50m', status: 'fit', image: '/avatars/player-18.webp', overallRating: 63, stats: { 'xG/90': 0.18, 'Succ. Dribbles': 3.2, 'Prog. Carries': 5.5, 'Key Passes/90': 1.0 }, radarData: radar(86, 55, 75, 52, 22, 50) },

  // ── Strikers ──
  { id: 'sq19', name: 'Magnus Thøgersen', age: 28, nationality: 'Denmark', position: 'ST', shirtNumber: 14, contractUntil: '2028-06-30', weeklyWage: '€75k', marketValue: '€18.00m', status: 'fit', image: '/avatars/player-19.webp', overallRating: 83, stats: { 'xG/90': 0.52, 'Goals/90': 0.48, 'Aerial %': 72, 'Shot Conv. %': 22 }, radarData: radar(76, 62, 70, 82, 28, 35) },
  { id: 'sq20', name: 'Pierre Dubois', age: 24, nationality: 'France', position: 'ST', altPositions: ['LW'], shirtNumber: 17, contractUntil: '2028-06-30', weeklyWage: '€42k', marketValue: '€10.00m', status: 'fit', image: '/avatars/player-20.webp', overallRating: 75, stats: { 'xG/90': 0.40, 'Goals/90': 0.35, 'Aerial %': 58, 'Shot Conv. %': 18 }, radarData: radar(82, 58, 74, 68, 22, 30) },
  { id: 'sq21', name: 'Oliver Winther', age: 19, nationality: 'Denmark', position: 'ST', shirtNumber: 32, contractUntil: '2030-06-30', weeklyWage: '€5k', marketValue: '€1.80m', status: 'fit', image: '/avatars/player-1.webp', overallRating: 55, stats: { 'xG/90': 0.22, 'Goals/90': 0.15, 'Aerial %': 52, 'Shot Conv. %': 10 }, radarData: radar(78, 50, 62, 55, 18, 25) },

  // ── Extra squad players ──
  { id: 'sq22', name: 'Jakob Poulsen', age: 31, nationality: 'Denmark', position: 'CB', altPositions: ['CDM'], shirtNumber: 15, contractUntil: '2027-06-30', weeklyWage: '€35k', marketValue: '€2.80m', status: 'injured', image: '/avatars/player-2.webp', overallRating: 68, stats: { 'Tackles/90': 3.5, 'Aerial %': 75, 'Pass %': 83, 'Interceptions': 2.2 }, radarData: radar(50, 70, 38, 78, 78, 28) },
  { id: 'sq23', name: 'William Ravn', age: 22, nationality: 'Denmark', position: 'CM', altPositions: ['CDM', 'CAM'], shirtNumber: 20, contractUntil: '2029-06-30', weeklyWage: '€14k', marketValue: '€4.00m', status: 'on_loan', image: '/avatars/player-3.webp', overallRating: 67, stats: { 'xG/90': 0.12, 'Pass %': 85, 'Prog. Carries': 4.2, 'Key Passes/90': 1.8 }, radarData: radar(70, 72, 68, 62, 58, 48) },
]

const u21Players: SquadPlayer[] = [
  { id: 'u1', name: 'Oskar Dahl', age: 21, nationality: 'Denmark', position: 'GK', shirtNumber: 1, contractUntil: '2029-06-30', weeklyWage: '€8k', marketValue: '€1.50m', status: 'fit', image: '/avatars/player-4.webp', overallRating: 62, stats: { 'Save %': 68, 'Clean Sheets': 3, 'Pass %': 75, 'xG Prevented': 1.1 }, radarData: radar(48, 60, 28, 72, 18, 22) },
  { id: 'u2', name: 'Emil Björk', age: 20, nationality: 'Sweden', position: 'CB', altPositions: ['CDM'], shirtNumber: 4, contractUntil: '2029-06-30', weeklyWage: '€12k', marketValue: '€3.00m', status: 'fit', image: '/avatars/player-5.webp', overallRating: 65, stats: { 'Tackles/90': 3.2, 'Aerial %': 68, 'Pass %': 82, 'Interceptions': 1.9 }, radarData: radar(65, 70, 42, 74, 72, 28) },
  { id: 'u3', name: 'Mathias Krogh', age: 19, nationality: 'Denmark', position: 'CB', shirtNumber: 5, contractUntil: '2030-06-30', weeklyWage: '€4k', marketValue: '€800k', status: 'fit', image: '/avatars/player-6.webp', overallRating: 52, stats: { 'Tackles/90': 2.5, 'Aerial %': 62, 'Pass %': 78, 'Interceptions': 1.5 }, radarData: radar(58, 62, 35, 68, 65, 22) },
  { id: 'u4', name: 'Alexander Lund', age: 18, nationality: 'Denmark', position: 'LB', shirtNumber: 3, contractUntil: '2030-06-30', weeklyWage: '€3k', marketValue: '€600k', status: 'fit', image: '/avatars/player-7.webp', overallRating: 48, stats: { 'xG/90': 0.02, 'Prog. Carries': 3.0, 'Crosses/90': 2.5, 'Tackles/90': 2.0 }, radarData: radar(72, 55, 50, 58, 55, 60) },
  { id: 'u5', name: 'Lucas Vidal', age: 22, nationality: 'Spain', position: 'RB', altPositions: ['RW'], shirtNumber: 2, contractUntil: '2029-06-30', weeklyWage: '€15k', marketValue: '€4.50m', status: 'fit', image: '/avatars/player-8.webp', overallRating: 68, stats: { 'xG/90': 0.06, 'Prog. Carries': 4.8, 'Crosses/90': 3.9, 'Tackles/90': 2.5 }, radarData: radar(82, 64, 65, 68, 66, 72) },
  { id: 'u6', name: 'Yuki Tanaka', age: 23, nationality: 'Japan', position: 'CDM', altPositions: ['CM'], shirtNumber: 6, contractUntil: '2029-06-30', weeklyWage: '€20k', marketValue: '€6.00m', status: 'fit', image: '/avatars/player-9.webp', overallRating: 72, stats: { 'Tackles/90': 3.8, 'Pass %': 88, 'Prog. Carries': 4.0, 'Interceptions': 2.6 }, radarData: radar(64, 76, 58, 70, 74, 38) },
  { id: 'u7', name: 'Noah Vestergaard', age: 19, nationality: 'Denmark', position: 'CM', shirtNumber: 8, contractUntil: '2030-06-30', weeklyWage: '€6k', marketValue: '€2.00m', status: 'fit', image: '/avatars/player-10.webp', overallRating: 60, stats: { 'xG/90': 0.08, 'Pass %': 83, 'Prog. Carries': 3.5, 'Key Passes/90': 1.2 }, radarData: radar(72, 68, 64, 58, 50, 42) },
  { id: 'u8', name: 'Sebastian Hauge', age: 20, nationality: 'Norway', position: 'CM', shirtNumber: 10, contractUntil: '2029-06-30', weeklyWage: '€9k', marketValue: '€1.80m', status: 'fit', image: '/avatars/player-11.webp', overallRating: 58, stats: { 'xG/90': 0.12, 'Pass %': 80, 'Prog. Carries': 4.0, 'Key Passes/90': 1.5 }, radarData: radar(68, 65, 62, 55, 48, 45) },
  { id: 'u9', name: 'Kasper Munk', age: 21, nationality: 'Denmark', position: 'LW', altPositions: ['ST'], shirtNumber: 11, contractUntil: '2029-06-30', weeklyWage: '€10k', marketValue: '€3.50m', status: 'fit', image: '/avatars/player-12.webp', overallRating: 66, stats: { 'xG/90': 0.20, 'Succ. Dribbles': 2.5, 'Prog. Carries': 5.0, 'Key Passes/90': 1.4 }, radarData: radar(84, 60, 72, 55, 25, 58) },
  { id: 'u10', name: 'Amir Haddad', age: 20, nationality: 'Morocco', position: 'RW', altPositions: ['LW'], shirtNumber: 7, contractUntil: '2030-06-30', weeklyWage: '€8k', marketValue: '€2.50m', status: 'fit', image: '/avatars/player-13.webp', overallRating: 63, stats: { 'xG/90': 0.18, 'Succ. Dribbles': 3.2, 'Prog. Carries': 5.5, 'Key Passes/90': 1.0 }, radarData: radar(86, 55, 75, 52, 22, 50) },
  { id: 'u11', name: 'Oliver Winther', age: 19, nationality: 'Denmark', position: 'ST', shirtNumber: 9, contractUntil: '2030-06-30', weeklyWage: '€5k', marketValue: '€1.80m', status: 'fit', image: '/avatars/player-14.webp', overallRating: 55, stats: { 'xG/90': 0.22, 'Goals/90': 0.15, 'Aerial %': 52, 'Shot Conv. %': 10 }, radarData: radar(78, 50, 62, 55, 18, 25) },
  { id: 'u12', name: 'Frederik Brandt', age: 18, nationality: 'Denmark', position: 'ST', shirtNumber: 14, contractUntil: '2030-06-30', weeklyWage: '€3k', marketValue: '€500k', status: 'injured', image: '/avatars/player-15.webp', overallRating: 46, stats: { 'xG/90': 0.15, 'Goals/90': 0.10, 'Aerial %': 48, 'Shot Conv. %': 8 }, radarData: radar(75, 42, 55, 50, 15, 20) },
]

export const mockSquads: MockSquad[] = [
  {
    id: 'squad-1',
    name: 'First Team',
    club: 'FC Nordhavn',
    season: '2025/26',
    description: 'Senior squad — Superliga campaign',
    formation: '4-3-3',
    playerCount: firstTeamPlayers.length,
    lastUpdated: '2h ago',
    players: firstTeamPlayers,
  },
  {
    id: 'squad-2',
    name: 'U21 Development',
    club: 'FC Nordhavn',
    season: '2025/26',
    description: 'Academy and reserve team prospects',
    formation: '4-3-3',
    playerCount: u21Players.length,
    lastUpdated: '1d ago',
    players: u21Players,
  },
]

// Keep flat export for backwards compat
export const squadPlayers = firstTeamPlayers

// All squad players (first team + U21) indexed by id for report lookup
const allSquadPlayersById: Record<string, SquadPlayer> = Object.fromEntries(
  [...firstTeamPlayers, ...u21Players].map((p) => [p.id, p])
)

export function getSquadPlayerReport(id: string): MockPlayerReport | null {
  const p = allSquadPlayersById[id]
  if (!p) return null
  const pos = p.altPositions?.length ? `${p.position} / ${p.altPositions.join(' / ')}` : p.position
  const rating = p.overallRating
  return {
    playerId: p.id,
    playerName: p.name,
    age: p.age,
    nationality: p.nationality,
    position: pos,
    club: 'FC Nordhavn',
    league: 'Danish Superliga',
    image: p.image,
    summary: `${p.name} is a ${p.age}-year-old ${p.position} currently valued at ${p.marketValue}. Contract runs until ${new Date(p.contractUntil).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}.`,
    strengths: Object.entries(p.stats).filter(([, v]) => typeof v === 'number' && v > 3).map(([k, v]) => `Strong ${k} (${v})`).slice(0, 4),
    weaknesses: Object.entries(p.stats).filter(([, v]) => typeof v === 'number' && v <= 2).map(([k, v]) => `${k} could improve (${v})`).slice(0, 3),
    styleOfPlay: `Plays primarily as a ${pos} with an overall rating of ${rating}/100.`,
    recommendation: rating >= 78 ? 'sign' : rating >= 65 ? 'monitor' : 'pass',
    fitScore: rating,
    seasonStats: Object.fromEntries(Object.entries(p.stats).map(([k, v]) => [k, v])),
    radarData: p.radarData,
    similarPlayers: [],
    transferHistory: [{ club: 'FC Nordhavn', date: 'Current', fee: p.marketValue }],
    contractInfo: { value: p.marketValue, until: p.contractUntil, wage: p.weeklyWage, agent: '—' },
  }
}
