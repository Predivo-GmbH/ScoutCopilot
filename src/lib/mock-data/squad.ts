// ScoutCopilot — Squad constants (formations & position labels)

import type { SquadPosition, FormationType, FormationSlot } from './types'

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

