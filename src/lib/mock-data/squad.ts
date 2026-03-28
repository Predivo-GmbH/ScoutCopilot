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
  { id: 'sq1', name: 'Frederik Holm', age: 28, nationality: 'Denmark', position: 'GK', shirtNumber: 1, contractUntil: '2028-06-30', weeklyWage: '€45k', marketValue: '€8.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uiVgPJZZX1E0-ZoIdOq2Um87lG4AkckpXeFs9JLVRVeUmpOjhjXdIX_tixRLVGFlxBuVmsq_kfuu0h9gI6bRANk9WMhPom1toOr73mGdblv9UmRggOJ_y3zyl23jW_N4Nos_zZbdhcuFZLYSzBveHgW-Afr2uKH9TJBMZf_G2FCXZr2FuZ1YkvbxYvx_yGAXcNhMWewXT0YKPCDofFmPT6EeQLNSZdc6n4n0p1p-JsMbyQGhN2UUmyOMyU', overallRating: 78, stats: { 'Save %': 74, 'Clean Sheets': 12, 'Pass %': 81, 'xG Prevented': 4.2 }, radarData: radar(45, 68, 30, 80, 20, 25) },
  { id: 'sq2', name: 'Oskar Dahl', age: 21, nationality: 'Denmark', position: 'GK', shirtNumber: 13, contractUntil: '2029-06-30', weeklyWage: '€8k', marketValue: '€1.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhVi6A8YYfVtyi1yzIGSIqOsbrJFemwl_wL_2buijJPCJ28lOGgXMFYwYa-0XM05Eo5SjV8cCK_4OrmXazI9OYG3S1iDc8ecLihIUiVAHbSAXMufKS1tOkr0PYCF3ZJGmhLSwIFwFUF40zqc8gvVnlyFcIhi3-T-k0jK0gJk47kma-I3cQG1xCUF0PpP1d8P6CPPvVpIgJPa5xQfbhWi2lUU0PpECLlpJwv81QEE52z1Ql5HiImVLA4qQw', overallRating: 62, stats: { 'Save %': 68, 'Clean Sheets': 3, 'Pass %': 75, 'xG Prevented': 1.1 }, radarData: radar(48, 60, 28, 72, 18, 22) },

  // ── Centre-Backs ──
  { id: 'sq3', name: 'Henrik Madsen', age: 34, nationality: 'Denmark', position: 'CB', shirtNumber: 4, contractUntil: '2027-06-30', weeklyWage: '€55k', marketValue: '€3.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ujdq8ljDTZnkpdqM7V3KZJAXPawBCX7--6mZJacXPsLzL2B0E-qfHad3QzP8SmSCMGvHNmTJpPIw8SZBTkAghWJ1iXmHUFlkBS536AZK2UPkjtKBi7x2YL66NlckSVoZDSNzS4Ch4CqiQJkG-jyoeDphVbWRv3C5PdjHSCujFTDyc_m5zFjFtc1CWDgBn5FyOcLY4_DxBL97uwF4RwV2_7GrbK9HFGebfTLveTLb_UNazIODDCs7IenwTQ', overallRating: 74, stats: { 'Tackles/90': 3.8, 'Aerial %': 78, 'Pass %': 85, 'Interceptions': 2.4 }, radarData: radar(48, 72, 35, 82, 85, 30) },
  { id: 'sq4', name: 'Tomás Ferreira', age: 27, nationality: 'Portugal', position: 'CB', shirtNumber: 5, contractUntil: '2028-06-30', weeklyWage: '€65k', marketValue: '€14.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uiXy8KxCgjC8_F8i57j3FYKUqrHiHiE9oNr-9rw-w09LoCEM7cdXoBaDPorLo8Bdpddrz9CKWyK_a5gohnK5iMu4zkKI6ethKNs4ers7JoxunxoevYpi589RT9J5cFdP_itxqLigyI8jTWbIRYRBwCDEbW-1E9Lu6ysCRLz34XLxKM6ghTmUpuhSb3IWvlVwFzR_VxqahL7kaET4ojvF8JleBFAwURN_gmYFgEnPz45QWcjHi3d0r0zFFc', overallRating: 81, stats: { 'Tackles/90': 4.1, 'Aerial %': 74, 'Pass %': 89, 'Interceptions': 2.8 }, radarData: radar(62, 78, 45, 80, 82, 35) },
  { id: 'sq5', name: 'Emil Björk', age: 20, nationality: 'Sweden', position: 'CB', altPositions: ['CDM'], shirtNumber: 24, contractUntil: '2029-06-30', weeklyWage: '€12k', marketValue: '€3.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uj2IegTePObsOr3rPr1HYxTxsiY5s1jtY7D6JAmb0HbJZQZ7P4V-EeOdEYmFq2htjHtwHAjfGLNTH_5lP8OZCLbn1SE33FI39Y6Z0SefRyR9z5FmMSMX2jZ7jqVLblCJqJ4ignT6sUDyOB1_-fy5NmHZSOYDm6czNl8b6Blw_dFC4optVxx1tInFX2Z5aoR52XASjkYHKrJuLbjnEwRTXzVUFtMah4Cy5X5wykkgFfmuhPPt7WPoaVIeXo', overallRating: 65, stats: { 'Tackles/90': 3.2, 'Aerial %': 68, 'Pass %': 82, 'Interceptions': 1.9 }, radarData: radar(65, 70, 42, 74, 72, 28) },

  // ── Left-Back (CRITICAL GAP — only 1 player, aging, contract expiring) ──
  { id: 'sq6', name: 'Jonas Eriksen', age: 30, nationality: 'Denmark', position: 'LB', shirtNumber: 3, contractUntil: '2027-01-31', weeklyWage: '€40k', marketValue: '€4.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ugtJQHOW0Fj3fFt8sYLZz6UiGlKj_urZbu0u9JKZgN_SOmiWMh3QzD1NgFghmhZRcETL55yLNxIb7oUJXLnO8dIkMNiCgXc7X22MZMxsLXgd52zhHYYdUjaEcHCU06U5sS1cX3vNVWLu5UGRUp91VbziYzyXVZ0Nu4sbrzz4cqf3DDr3bk9WdNeXUQcO77GiGebuExBpPsQkKa5bFrPmSWZD7jGammvxQ-icMTDyp2-dmvHZNAQ0ECuMMY', overallRating: 70, stats: { 'xG/90': 0.05, 'Prog. Carries': 4.2, 'Crosses/90': 3.8, 'Tackles/90': 2.9 }, radarData: radar(68, 65, 55, 70, 72, 74) },

  // ── Right-Backs ──
  { id: 'sq7', name: 'Mikkel Andersen', age: 26, nationality: 'Denmark', position: 'RB', shirtNumber: 2, contractUntil: '2028-06-30', weeklyWage: '€50k', marketValue: '€10.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uiNKChusNOCrEwfllMMqWYY9c1JzlTWuovVoClSz7ewTt2OyE5MHx98u5S5SYkXLMWs3EhC-DDr0PF3zTXNjnqgyZJoRLKATI8vL_huwpLoaZHXd32-OvSVIx8vkTypNonH_E_4reMh-_OcwdrVsD4GnrFCIediqQixnwPk9MFgQl5M7j9ygPsdwAdYL8jm-BuVCUfhazzxMeBGE4T3utAtZnKmYNtwwBhvq-Sc2uWlBbL7eQ7ddL9-OoM', overallRating: 77, stats: { 'xG/90': 0.08, 'Prog. Carries': 5.1, 'Crosses/90': 4.5, 'Tackles/90': 3.2 }, radarData: radar(78, 70, 62, 72, 74, 80) },
  { id: 'sq8', name: 'Lucas Vidal', age: 22, nationality: 'Spain', position: 'RB', altPositions: ['RW'], shirtNumber: 22, contractUntil: '2029-06-30', weeklyWage: '€15k', marketValue: '€4.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ugAmgG79zGVIZuYUyah1gT0uHeyIx2gNDeGtDgjhjOrV6BcYZ5P-ujFsGfV9FzVFcUAjTzS1V8O5q1YsseveYf8X09qJ2ZlCC5N1okBMX56_wOW9jcBflfMNXbLW1hmOXdvtyrpxA8Wd5ijFoRCxV48mUDBM1Gij-R37gAKCZpSohnx5n11fg_6b1Za5WBaS5nlZyPI3lXZWEB-AROC7i_A8Sd3UR9lSOa7L2q7cQjA8f6PfnovSOUKBQQ', overallRating: 68, stats: { 'xG/90': 0.06, 'Prog. Carries': 4.8, 'Crosses/90': 3.9, 'Tackles/90': 2.5 }, radarData: radar(82, 64, 65, 68, 66, 72) },

  // ── Defensive Midfielders ──
  { id: 'sq9', name: 'Rasmus Kjær', age: 29, nationality: 'Denmark', position: 'CDM', shirtNumber: 6, contractUntil: '2028-06-30', weeklyWage: '€60k', marketValue: '€12.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ug9n4qJNdEeXleO8cA2gqFCA_3d2H8l5BNS4ZMaXebXLuBhlHN_Y50SoqdSyZT-Rpwp2KyDeOC3d_uX8cqY_xSjEGr7KM0ZZrMishfa5JmlFUpPxDl3qyhwgvKjHEm0HftsfN8XPMfQ5-8jvczhZriTm7r0IclVaIsxmCyLaw06xEV4HF1T4catdLTgzd8a9McCq2p99pl_4e0OahhMN93zGR-ZycIxoLjpCKRMj9uag5el7LBQ1b2sGQ', overallRating: 79, stats: { 'Tackles/90': 4.5, 'Pass %': 91, 'Prog. Carries': 3.2, 'Interceptions': 3.1 }, radarData: radar(58, 82, 52, 78, 80, 40) },
  { id: 'sq10', name: 'Yuki Tanaka', age: 23, nationality: 'Japan', position: 'CDM', altPositions: ['CM'], shirtNumber: 18, contractUntil: '2029-06-30', weeklyWage: '€20k', marketValue: '€6.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ujO2gKEswLRfPiRUBna-89RKmivKXfrYsTJlmTfppcwsCMABF0djSOsHZqOlI63bBf3exSQ0307RdqWQXOckDAFiJXlKd4ohpUAhGY4gBYllGu-T3A_ga8loR4LePdqxkxCDB6eaxF6QXYmjaRjqkXqhTMU0VXNTS9tqeg0-GwOlstM8IHWzF8Pb93rZS-LTGRO8kUPFJCz8dmN-oanq4XKMlHEn_AWUJdQ3SSDzc2faVrWZc2jRQVOpQg', overallRating: 72, stats: { 'Tackles/90': 3.8, 'Pass %': 88, 'Prog. Carries': 4.0, 'Interceptions': 2.6 }, radarData: radar(64, 76, 58, 70, 74, 38) },

  // ── Central Midfielders ──
  { id: 'sq11', name: 'Simon Larsen', age: 26, nationality: 'Denmark', position: 'CM', shirtNumber: 8, contractUntil: '2028-06-30', weeklyWage: '€55k', marketValue: '€11.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ujHZD3HTGdTQkEv1J5HLqfHyROK-5NT81PduzEIXFYLtMuEDQz6VyrMzIwVoMz3YnaFGTh1yTFIkS4QWu6pxmPcvOolAx0P6RGZJKt2B-yr3r_74UMbFbqDlSRgmPPBrz0Kc_c4b357bMVzA_RLjoig7o438_chxERXphD4ers7UVZu7dTwnPDoFQ7HNNblB4cuVvLwR-GcZoM_vhZ8NYRKdZsLd6Dp1lK671BoRYn18UV3YJtO_QOmPNM', overallRating: 80, stats: { 'xG/90': 0.15, 'Pass %': 90, 'Prog. Carries': 5.8, 'Key Passes/90': 2.4 }, radarData: radar(68, 85, 72, 70, 62, 55) },
  { id: 'sq12', name: 'Marco Basile', age: 24, nationality: 'Italy', position: 'CM', altPositions: ['CAM'], shirtNumber: 10, contractUntil: '2028-06-30', weeklyWage: '€50k', marketValue: '€13.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhaj66H9N8zmQhzdcLsnPnNTTWGH7Yb8P6VxO2kWuHRxgvA4EItFWVN04S-Q4MWitSjRmHEP31U504Z9txYpAHpO0W0-GRquIlyU-C69J9K1ZRmUoYPFP2ZSYD7qwTToieNonoPTsz-djzov7xh5vJnL_ffOyWRK6CKd_sFZFe50WhAQSDeIe0BjB893KNT0cjSjRhQq6sT7GO5IZ0UQLYrz1SYubpqx98nON8t8P6jg7jqWIo2I6X15f8', overallRating: 78, stats: { 'xG/90': 0.22, 'Pass %': 87, 'Prog. Carries': 6.2, 'Key Passes/90': 2.8 }, radarData: radar(70, 82, 78, 65, 55, 60) },
  { id: 'sq13', name: 'Noah Vestergaard', age: 19, nationality: 'Denmark', position: 'CM', shirtNumber: 30, contractUntil: '2030-06-30', weeklyWage: '€6k', marketValue: '€2.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhd0sa_R3G9B-kvWiuwua03StbWwKxdbi7kseYWeYADoSt2r4VZ4kZZtRoYVoYAGA5K3DldbGiiuQtgTCDjLq-91CzBzF3LJwL7P5TuCBJnTegA4Dm4aCLdZ-Gau0UocxN_yrLck3o5U-FQtynVvb6u-WbqlgfH-xTtVtEBPhKF0GUm0iCodV3k0we6GkBFOlE-tBWtwrEZwFzN9nNDfKYpOXGbDBGNYEptpfdexaCsERr8Bk8', overallRating: 60, stats: { 'xG/90': 0.08, 'Pass %': 83, 'Prog. Carries': 3.5, 'Key Passes/90': 1.2 }, radarData: radar(72, 68, 64, 58, 50, 42) },

  // ── Attacking Midfielder (HIGH GAP — only 1 player) ──
  { id: 'sq14', name: 'Liam O\'Connor', age: 25, nationality: 'Ireland', position: 'CAM', shirtNumber: 7, contractUntil: '2028-06-30', weeklyWage: '€48k', marketValue: '€9.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uihnF5VIQJhmF8BsBHpkeJriCItwWHkZWGfhonibAp09WkKENM-0WwRPlj6gd_aG9DQ0zFKJlNrDgPoeQ3xwF8qEvi-DR-ZVt2o_wbs8c3U0j6AzOCwQqJvYRon_BjdGM_NN_fVu88Ao7b7zFM2TFr5pYBw9nJFxwR84Rs8vNxN-76cXGVUKMlBBDurCm1GMU1RSMm3AROLOVCbtZmQajEPM1m99qkTu9ou90DK0NjMTvtzuBTV9vTBdQ', overallRating: 76, stats: { 'xG/90': 0.28, 'Pass %': 84, 'Key Passes/90': 3.2, 'Succ. Dribbles': 2.8 }, radarData: radar(74, 78, 80, 62, 38, 65) },

  // ── Left Wingers ──
  { id: 'sq15', name: 'André Silva', age: 27, nationality: 'Brazil', position: 'LW', shirtNumber: 11, contractUntil: '2027-06-30', weeklyWage: '€70k', marketValue: '€16.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhboQ7JHPDz8PgPB8xmdDsCQ-Z01-GCDtTlqO4deZWc0I67aiIKqlRcif8L_OvC67jvzQecDYAfzEY7axK0uS5TMjCUbOmKPR7L-zhZS-xLiThyjkJ-kmd0f9wzyFbknuvFKluOxAa9LcgAAno-FEWnacSK2oe5F57FZjluKBnRrhpdPWGZEuQTRt9wIuOrd_5p0B_2Zz373MnPECYViPIk-ZLxb257Fab8Sdr20mhHPKnEhvfITiNZLvg', overallRating: 82, stats: { 'xG/90': 0.35, 'Succ. Dribbles': 3.8, 'Prog. Carries': 7.2, 'Key Passes/90': 2.1 }, radarData: radar(88, 72, 86, 58, 30, 68) },
  { id: 'sq16', name: 'Kasper Munk', age: 21, nationality: 'Denmark', position: 'LW', altPositions: ['ST'], shirtNumber: 27, contractUntil: '2029-06-30', weeklyWage: '€10k', marketValue: '€3.50m', status: 'injured', image: 'https://lh3.googleusercontent.com/aida/ADBb0ugAGuS33L5KAKz5n4SyOeXnzMu6XONDGF07-lSTyo1FD-P5L8I97ghz2z8IJgGbIVeEl80o2T57FOZCbel_TFMkCqsD3lbh7bFQsiolL3uYM3JzTpHvqZubD96NPKZDPEv5UioFKDAcp73BhH3FAd5_w5ZYnuHF-r5ajxWzll6_OYMXkzvZbgdcOwMq284LTEckanDNEfqcXM7c-tbhrI2J1yEtphh7H3dYpygyxAkhmmw4FgZ3Hl-h7iM', overallRating: 66, stats: { 'xG/90': 0.20, 'Succ. Dribbles': 2.5, 'Prog. Carries': 5.0, 'Key Passes/90': 1.4 }, radarData: radar(84, 60, 72, 55, 25, 58) },

  // ── Right Wingers (aging starter) ──
  { id: 'sq17', name: 'Viktor Sørensen', age: 33, nationality: 'Denmark', position: 'RW', shirtNumber: 9, contractUntil: '2027-06-30', weeklyWage: '€52k', marketValue: '€4.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uiaso0oF9rs8u4YLjZ0R44rpNIUxl-F6Dvt6keJXOdAQN4bm8UxHciLJMpOQfkyfPUWcUdBglHF0LbMOL_uCrEN0Vz7RjAl_4HIl7tyTqCs5HDXEWleUadVGo4dk__ZlUd59PiDa5qmKOebCELcYuxVMRg_eVIKNwEL-UsYXLRXG3XSoLPW5pXXF5zSLrYYv8vcf8wXZfhPgIDCcg46ZOIQOCyVzl6z73DNCEZPDfEBKwoAbrU-pPQUWsk', overallRating: 71, stats: { 'xG/90': 0.25, 'Succ. Dribbles': 2.0, 'Prog. Carries': 4.5, 'Key Passes/90': 1.8 }, radarData: radar(62, 74, 65, 68, 35, 70) },
  { id: 'sq18', name: 'Amir Haddad', age: 20, nationality: 'Morocco', position: 'RW', altPositions: ['LW'], shirtNumber: 28, contractUntil: '2030-06-30', weeklyWage: '€8k', marketValue: '€2.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ugPbL8YVdRYpVXc6QknfqpondLgpCAxrJgirUc5E6uBtqzF9Jh8Tkxg9V-od-yl21R13ft2LVuES5Oiiuu3dAE-x7_unBPnBGzWlvDxnA2w2PA-aVsqLJ8BrCY59RN2OdC2dqXfsNDhu1hnwotmriPmcARrosCUdODFo8KYak5CcEdK6lR4m0qt0a3xMWjeqIcQooPbGphOMTTeRtgFNASKIIeAl_8JCe9ABQtXtcGDXclMO5P9X9PCr3A', overallRating: 63, stats: { 'xG/90': 0.18, 'Succ. Dribbles': 3.2, 'Prog. Carries': 5.5, 'Key Passes/90': 1.0 }, radarData: radar(86, 55, 75, 52, 22, 50) },

  // ── Strikers ──
  { id: 'sq19', name: 'Magnus Thøgersen', age: 28, nationality: 'Denmark', position: 'ST', shirtNumber: 14, contractUntil: '2028-06-30', weeklyWage: '€75k', marketValue: '€18.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhpNuxtGysmWUoW6v1AWRk7qW9il09c7YXGWzYd_ePkr4WrtFCJanDBW53iGVDs0IJtI_KFyiWz05a-Qt6reB7iznFNz-oXzjcVXU1MBQ58vybTHvKM_fbhL5nn2Oj4jbhSg28LoJMfA2zJpkFpxsEAjSSS-Y9wHsMWLqyj6ryn-mq83ncO6KEicqW73uXwIrgM7XLF0L3UafivnHb-Vlnd98dG2rjbXSueGHv0I2JaR6WdhqZM-a9iEH0', overallRating: 83, stats: { 'xG/90': 0.52, 'Goals/90': 0.48, 'Aerial %': 72, 'Shot Conv. %': 22 }, radarData: radar(76, 62, 70, 82, 28, 35) },
  { id: 'sq20', name: 'Pierre Dubois', age: 24, nationality: 'France', position: 'ST', altPositions: ['LW'], shirtNumber: 17, contractUntil: '2028-06-30', weeklyWage: '€42k', marketValue: '€10.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ugw0DodovtnMZ7ju8V1GbEOWgN7CsN0u0ORGOq1PD7Cp5loJP0AtYZZj2X573rQksnNosRZuGQ-T9vkuygpEepiqpUi-7N14GaxTBn3-qFTDoNcb3O0IYQ2vu-RLSwr4oZJQFuZNnpgi_XsYKAlq1OfKEbT-wPxar-i4InLSTd6RV0W255-6EuZiYcag-roE_AbPArc7rw_pAic1vLJrzRfSM6jEN0g75NWKNgdlMSFEREV0McdLtGHoA', overallRating: 75, stats: { 'xG/90': 0.40, 'Goals/90': 0.35, 'Aerial %': 58, 'Shot Conv. %': 18 }, radarData: radar(82, 58, 74, 68, 22, 30) },
  { id: 'sq21', name: 'Oliver Winther', age: 19, nationality: 'Denmark', position: 'ST', shirtNumber: 32, contractUntil: '2030-06-30', weeklyWage: '€5k', marketValue: '€1.80m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ujRIC8fCs4lPp8QsDTLkHSLNyrgoSoDnDl_F-nJMyOKboP3d39QN2VpggKoYibsoYzniTZSziNcWIH3kHMN8-BxG-SaRLE_7w-vnwi9CqfQsgpTfIMNbyw4LWKmWmdqi24Sf5kwZ8uNcdpgI-FizMpYS5fMM9LC_0dzPjSgTuKZGUrvdJWA2EyRRpdLgmv8cZDEmyIda6Xgn8itd9eSpqvhKra7qL_4YJhZ6Casc9Qr44ixbepvxqUAHCo', overallRating: 55, stats: { 'xG/90': 0.22, 'Goals/90': 0.15, 'Aerial %': 52, 'Shot Conv. %': 10 }, radarData: radar(78, 50, 62, 55, 18, 25) },

  // ── Extra squad players ──
  { id: 'sq22', name: 'Jakob Poulsen', age: 31, nationality: 'Denmark', position: 'CB', altPositions: ['CDM'], shirtNumber: 15, contractUntil: '2027-06-30', weeklyWage: '€35k', marketValue: '€2.80m', status: 'injured', image: 'https://lh3.googleusercontent.com/aida/ADBb0ui3GUpspxinqBO6jmmdEg9a1ydrk9uHQJHtjgCdoZIBYZgxRM6ynfqjH_A47trLVNjdCfKDqpUNTSUxgYIa97uqTOyRJMYD1yvvaAzRJ8VcVIkisbc1yP-zHBpqa9NQ9Ml_TXhLRkr_1HM2orQty4R_kN88K1VyAEvoPuT-tWzXDsTF-LxX7WqunAAJkOW0twVwM1AT2sdS1Py9DmGh9XcnMBr3x607YvIRALVOTBwRyltBELhoUf-fyU0', overallRating: 68, stats: { 'Tackles/90': 3.5, 'Aerial %': 75, 'Pass %': 83, 'Interceptions': 2.2 }, radarData: radar(50, 70, 38, 78, 78, 28) },
  { id: 'sq23', name: 'William Ravn', age: 22, nationality: 'Denmark', position: 'CM', altPositions: ['CDM', 'CAM'], shirtNumber: 20, contractUntil: '2029-06-30', weeklyWage: '€14k', marketValue: '€4.00m', status: 'on_loan', image: 'https://lh3.googleusercontent.com/aida/ADBb0ugx63KUqCFw5hn0SzunTXgdJebnu94gjIq-y24_e5ymSlSYt_fZdeYjA0BaQ1j-1HjwTbfcoLR7dMf4T_0JpD2sk7rSTUeh6bpSMWXEKaAjHK9m_5f6ROAYP23mlOF_jMQQ20zwAyoZxNdqGl67IOIrTwT_exglKOgAFhwcjMfkWNKtBZr6yv9E-ESWG1PJJqnOVsAoJbRjfRHvDnnlUdOfyf-2TZOp343jVIAaLgRbVr9XjmgLcIfhYm0', overallRating: 67, stats: { 'xG/90': 0.12, 'Pass %': 85, 'Prog. Carries': 4.2, 'Key Passes/90': 1.8 }, radarData: radar(70, 72, 68, 62, 58, 48) },
]

const u21Players: SquadPlayer[] = [
  { id: 'u1', name: 'Oskar Dahl', age: 21, nationality: 'Denmark', position: 'GK', shirtNumber: 1, contractUntil: '2029-06-30', weeklyWage: '€8k', marketValue: '€1.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ujwRGmm1XgIT7ChUEsIphK-oGOM9LZiV3O8-6XROmXPcgj44i0130HK1FNRNRy5uiH56uVa3KHL8MSqGk9NAux7ciX9oZIaAuTnm29HhEmrW0bX1s0lVJ3u0jUYokfyRxrhv3-gXlFW81rEnp6sXTDzUI2moQOYNws7yllSH59QDI8CgpahEt29U3Lm7BtlsGoooMOoQw2_11a0hLae7VVju7yfER4v5ks_ZqKQ3DSyMlZlEg_mcwJLmjc', overallRating: 62, stats: { 'Save %': 68, 'Clean Sheets': 3, 'Pass %': 75, 'xG Prevented': 1.1 }, radarData: radar(48, 60, 28, 72, 18, 22) },
  { id: 'u2', name: 'Emil Björk', age: 20, nationality: 'Sweden', position: 'CB', altPositions: ['CDM'], shirtNumber: 4, contractUntil: '2029-06-30', weeklyWage: '€12k', marketValue: '€3.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ujEroh4jTbIfzsXJ_68pLzcvfCnrHKohdZpurl2yaTiV03Cae6w05yL2Qw0-HBIIuZJuf-mzOqIk7zQZSprXhcqmujIx0G5rJosSFQBjA52sjhFV2XG6jbF4a_82KULZbgvVnRVqpVFDLv2qEUQiX8orW3zPgYCvTiYXVFlsC9o6Q6qxQ-M1FuFVnmSQM7nx0Oatm4WXMJ4gFfixrfizjdFPaL-oTF9N7uq_mHf381MJshQQWvFg853Xw', overallRating: 65, stats: { 'Tackles/90': 3.2, 'Aerial %': 68, 'Pass %': 82, 'Interceptions': 1.9 }, radarData: radar(65, 70, 42, 74, 72, 28) },
  { id: 'u3', name: 'Mathias Krogh', age: 19, nationality: 'Denmark', position: 'CB', shirtNumber: 5, contractUntil: '2030-06-30', weeklyWage: '€4k', marketValue: '€800k', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ug6MpSv3L8_XT0ek-XART7MqfWpbsRQmuns2q80PQGsmwK_hUwio4Azla2QHle73il6Ok6H04kKQHb4Zcxg0TyVLjhNftfOwPH5Z90hueqfrdCbIWR7jV3uKHyGu6RF_cgG2weK7ZTc3x9oQWRhS565dv5hqlLpO7m7CMoJajxiCaFv1MYXHUfUNd5euPhGB_MGvKi9c5OMzv8Ki4pprQapgXNTDYYG90ELjJUoDUmHRE1Kspnhyac24Q', overallRating: 52, stats: { 'Tackles/90': 2.5, 'Aerial %': 62, 'Pass %': 78, 'Interceptions': 1.5 }, radarData: radar(58, 62, 35, 68, 65, 22) },
  { id: 'u4', name: 'Alexander Lund', age: 18, nationality: 'Denmark', position: 'LB', shirtNumber: 3, contractUntil: '2030-06-30', weeklyWage: '€3k', marketValue: '€600k', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhrDSKkfDqYjNHu9byxjRWyt7hKMZScM5QB5bfjILpBcsUm8EMWQGR3fGMh2Galf2LTA1H-r2osnswYJKvzFQLcYmZAZ5720TyFlDJTwETGlxmmiody0qGJqN_HAUCg6h51zmwAt3eXHqxPlUdJM1rNNTgF3qEzRqbRVnwvGXYjLa4X8H2V9JBfGWFbMa5bf2sA11arYaelb-us_BoOb5oA1XM6ZgExG6SRpmG1nMgO1UKlP9g12Xm-jak', overallRating: 48, stats: { 'xG/90': 0.02, 'Prog. Carries': 3.0, 'Crosses/90': 2.5, 'Tackles/90': 2.0 }, radarData: radar(72, 55, 50, 58, 55, 60) },
  { id: 'u5', name: 'Lucas Vidal', age: 22, nationality: 'Spain', position: 'RB', altPositions: ['RW'], shirtNumber: 2, contractUntil: '2029-06-30', weeklyWage: '€15k', marketValue: '€4.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhGbKuLRIdm6Fe7d4Rg3nBJdUj2D_Qlv8Wm8Hx8uS06IWy_gz4XHUCu8y4GA5ezqtHYNM6gcflK9cZu6e9phO__0dkQ61VY3Br2fmmmEJ6umFsJ5LwszaVamhPEjeDW4XelwWQpM3g7F72qY4Oo65-gAOGgMMBrx2tz9jdrLf7WSLnIZfUYhN8KtzDHm1BZ5-TfWTnnIOiRPZhBBFTBp1IJfWRufbPtZcnE9iY-L1Pv3uRTDVhX2CpwTiU', overallRating: 68, stats: { 'xG/90': 0.06, 'Prog. Carries': 4.8, 'Crosses/90': 3.9, 'Tackles/90': 2.5 }, radarData: radar(82, 64, 65, 68, 66, 72) },
  { id: 'u6', name: 'Yuki Tanaka', age: 23, nationality: 'Japan', position: 'CDM', altPositions: ['CM'], shirtNumber: 6, contractUntil: '2029-06-30', weeklyWage: '€20k', marketValue: '€6.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhxxpRbQbQaRwrqWjyPYMbRGfEM-_1IB4X2R_gbLtmg4UzOY51HTZAsdqRaDLuxesjBgJ5hB0L7BHPTnIu4dlADKIYX9KVcMwt25sh9fj0tDo0uvLho51lEq_CoxC_l_qcU-GHxa78VU7AQOevvyFKO5wMXcI0O2KjLcSAdd5wGXap1ivaluG5-0fmsgyq6aIEtmslzNSJFrFBj0soz0AV8GWpurQytKKFiLrKjywv1hgclYObXLaiiQMA', overallRating: 72, stats: { 'Tackles/90': 3.8, 'Pass %': 88, 'Prog. Carries': 4.0, 'Interceptions': 2.6 }, radarData: radar(64, 76, 58, 70, 74, 38) },
  { id: 'u7', name: 'Noah Vestergaard', age: 19, nationality: 'Denmark', position: 'CM', shirtNumber: 8, contractUntil: '2030-06-30', weeklyWage: '€6k', marketValue: '€2.00m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhFOEBwR8RKb8D1r7LpsCZXTZhNofs4iaIv0vCtuKJbTTUqs7UwUXO4GvorVRvG0Kq25cExbbKqbaFy8ZBYWUSOMv13uyiX_kLn8PSoDfUjd1Skokvgz-Z2vBGhTMebecX39BK8kZBDzvoJo6uOAh_lGg0iZMwA9oYMG8v1xVMwY71u0XT382S9-1JzykcZ-cIRdUaMJyIvqKO_4hwKL_EQZZX71ptaJCp69Q2Jl3wwSWjj9ylfso4Cvw', overallRating: 60, stats: { 'xG/90': 0.08, 'Pass %': 83, 'Prog. Carries': 3.5, 'Key Passes/90': 1.2 }, radarData: radar(72, 68, 64, 58, 50, 42) },
  { id: 'u8', name: 'Sebastian Hauge', age: 20, nationality: 'Norway', position: 'CM', shirtNumber: 10, contractUntil: '2029-06-30', weeklyWage: '€9k', marketValue: '€1.80m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uiJhcdGtwEF3RNAMTSNuXpq6EGqTs1LcZQ9xW0_hcdNB4jtf3P3L6zMviKjTaJVA4eEw9f60g76CXtnhhg0KlWCATRwHoLgnh3KYPCVeM46r--M0bWAakr1xSuC-8G85OPYz8EvGY654gmH0prB4VeDDyObPha_YRo1mnykpXNUdv2itko6zByfhMTTNl8vYzCZ2hwFjpYW-y_vayxAToUlTDnPo-aF2ioPCMGvpBe15AWTKbx6UuWOomM', overallRating: 58, stats: { 'xG/90': 0.12, 'Pass %': 80, 'Prog. Carries': 4.0, 'Key Passes/90': 1.5 }, radarData: radar(68, 65, 62, 55, 48, 45) },
  { id: 'u9', name: 'Kasper Munk', age: 21, nationality: 'Denmark', position: 'LW', altPositions: ['ST'], shirtNumber: 11, contractUntil: '2029-06-30', weeklyWage: '€10k', marketValue: '€3.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uithezhM81NgUmpPFp401YjX0jwiHwjqbH5h4xOhhMmC53qeVavYRRsKEItj9Mb8pSL_AUOBNHqm7AiWGnV_dHmxwMj9Iu7zbH83YAGRqG-AHdjWDZ7CrPd7EIzFs-aB_fMpJWZvOLNh3FH_pbXHhcO4YqIaGuuVr-KUNdlHbTKQzeH_0YdINca-xZ87E6l-8yQEaZ2HBk8d9f68WynAeYQEhOY0Uzl4gaa0yne_ymXzY93wmiC9Pfz82w', overallRating: 66, stats: { 'xG/90': 0.20, 'Succ. Dribbles': 2.5, 'Prog. Carries': 5.0, 'Key Passes/90': 1.4 }, radarData: radar(84, 60, 72, 55, 25, 58) },
  { id: 'u10', name: 'Amir Haddad', age: 20, nationality: 'Morocco', position: 'RW', altPositions: ['LW'], shirtNumber: 7, contractUntil: '2030-06-30', weeklyWage: '€8k', marketValue: '€2.50m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhyEHutyIe876c52HTylM1GDZ_58fvRN0UG8N5eFiRvyYU_8gKpXMUAho-X4NVkLcNU4OjpdQxx0yiK2dubhSOc5KqaIvNajT7r_acKDjBWABzyBNDKystPImtowIamTxUUd7R1gEf2EcKjtYLpQGa7v5SUbNeUHiqNYiwGMt1UBzQyHw1AfTYio5LRIpOXyXuAyZQZpqUlpGYKRE3JdPEsavn7_3zxXIGxj-ECeDFoDQ7Ywu01ZoV0dW0', overallRating: 63, stats: { 'xG/90': 0.18, 'Succ. Dribbles': 3.2, 'Prog. Carries': 5.5, 'Key Passes/90': 1.0 }, radarData: radar(86, 55, 75, 52, 22, 50) },
  { id: 'u11', name: 'Oliver Winther', age: 19, nationality: 'Denmark', position: 'ST', shirtNumber: 9, contractUntil: '2030-06-30', weeklyWage: '€5k', marketValue: '€1.80m', status: 'fit', image: 'https://lh3.googleusercontent.com/aida/ADBb0ug79JsFU2PD35DIaDgVtVHNOS-Lvc9MJEAaOsthPdv-kamy0PPaHfB7IpWhgf0-YhqLeLSr74u6vBdf4it-Wop0bOACqUPE0sIiUqFTkkobeFApoTh45O8b7ak5S8PNbeBbhYM8b4LvgVwmSZhQYM5bweKrdnz2HdHIJW8VrgMiBMBpnAfgdt7CqsZ0TxSj7Xf9uXKnFeDm2G33zM5rUuvoDQw1knNL_5qSNDbpbrlOqOllwgs4-kIGrQ', overallRating: 55, stats: { 'xG/90': 0.22, 'Goals/90': 0.15, 'Aerial %': 52, 'Shot Conv. %': 10 }, radarData: radar(78, 50, 62, 55, 18, 25) },
  { id: 'u12', name: 'Frederik Brandt', age: 18, nationality: 'Denmark', position: 'ST', shirtNumber: 14, contractUntil: '2030-06-30', weeklyWage: '€3k', marketValue: '€500k', status: 'injured', image: 'https://lh3.googleusercontent.com/aida/ADBb0uhivsH7K3KPXHmYpMMxy6G6vT471NoJqKsgy-SpuoPr2R-IwuBKA5pglcIoepr8j1vCBPxaMlESRoXb9Twz8irOZzbpTEn9jM08l_AKytpoD9SBRtPCGC1XcGOtSkxbKvWF24cA2_KUed5PUA-zvs3a65le0ivq4nzJVB-5LFzZ1t_Xmw3LyQ2FUpj0Epvwhx6Vo2tw3gBU0zSeGV07c1KMWgJEGChHnL5HVAIdaVitxN-v7S3haSeROfc', overallRating: 46, stats: { 'xG/90': 0.15, 'Goals/90': 0.10, 'Aerial %': 48, 'Shot Conv. %': 8 }, radarData: radar(75, 42, 55, 50, 15, 20) },
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
