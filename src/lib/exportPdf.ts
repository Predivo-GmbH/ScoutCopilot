import { jsPDF } from 'jspdf'
import i18n from '../i18n'
import { formatAge } from './ageUtils'
import type { MockPlayerReport } from './mock-data'

const COLORS = {
  primary: [45, 106, 79] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  light: [240, 240, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  sign: [45, 106, 79] as [number, number, number],
  monitor: [120, 100, 40] as [number, number, number],
  pass: [180, 50, 50] as [number, number, number],
}

export function exportPlayerPdf(report: MockPlayerReport) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ── Header Bar ──
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageWidth, 36, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...COLORS.white)
  doc.text(report.playerName.toUpperCase(), margin, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const displayAge = report.birth_date ? formatAge(report.birth_date) : (report.age > 0 ? String(report.age) : '\u2014')
  doc.text(`${report.club}  |  ${report.position}  |  Age ${displayAge}  |  ${report.nationality}`, margin, 24)

  const t = i18n.t.bind(i18n)
  const recLabel = report.recommendation === 'sign' ? t('pdf.recommendSign') : report.recommendation === 'monitor' ? t('pdf.monitor') : t('pdf.pass')
  const recColor = COLORS[report.recommendation]
  doc.setFontSize(9)
  const recWidth = doc.getTextWidth(recLabel) + 8
  doc.setFillColor(...COLORS.white)
  doc.roundedRect(pageWidth - margin - recWidth, 10, recWidth, 7, 1, 1, 'F')
  doc.setTextColor(...recColor)
  doc.text(recLabel, pageWidth - margin - recWidth + 4, 15)

  y = 44

  // ── Scout Assessment ──
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(t('pdf.scoutAssessment'), margin, y)
  y += 6

  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const summaryLines = doc.splitTextToSize(report.summary, contentWidth)
  doc.text(summaryLines, margin, y)
  y += summaryLines.length * 4.5 + 6

  // ── Strengths & Weaknesses ──
  const colW = contentWidth / 2 - 2

  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(t('pdf.strengths'), margin, y)
  doc.text(t('pdf.weaknesses'), margin + colW + 4, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)

  const maxRows = Math.max(report.strengths.length, report.weaknesses.length)
  for (let i = 0; i < maxRows; i++) {
    if (report.strengths[i]) {
      doc.text(`+ ${report.strengths[i]}`, margin, y)
    }
    if (report.weaknesses[i]) {
      doc.text(`- ${report.weaknesses[i]}`, margin + colW + 4, y)
    }
    y += 5
  }
  y += 4

  // ── Season Statistics ──
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(t('pdf.seasonStats'), margin, y)
  y += 6

  const statEntries = Object.entries(report.seasonStats)
  const cols = 3
  const cellW = contentWidth / cols
  const cellH = 12

  for (let i = 0; i < statEntries.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const cx = margin + col * cellW
    const cy = y + row * cellH

    // Alternating background
    if (row % 2 === 0) {
      doc.setFillColor(...COLORS.light)
      doc.rect(cx, cy - 3, cellW, cellH, 'F')
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.muted)
    doc.text(statEntries[i][0].toUpperCase(), cx + 2, cy + 1)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...COLORS.text)
    doc.text(String(statEntries[i][1]), cx + 2, cy + 7)
  }
  y += Math.ceil(statEntries.length / cols) * cellH + 6

  // ── Style of Play ──
  if (y > 240) {
    doc.addPage()
    y = margin
  }

  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(t('pdf.styleOfPlay'), margin, y)
  y += 6

  doc.setTextColor(...COLORS.text)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const styleLines = doc.splitTextToSize(report.styleOfPlay, contentWidth)
  doc.text(styleLines, margin, y)
  y += styleLines.length * 4.5 + 6

  // ── Radar Data Table ──
  if (y > 240) {
    doc.addPage()
    y = margin
  }

  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(t('pdf.performanceProfile'), margin, y)
  y += 6

  doc.setFontSize(8)
  const radarColW = contentWidth / 3
  for (let i = 0; i < report.radarData.length; i++) {
    const col = i % 3
    const row = Math.floor(i / 3)
    const cx = margin + col * radarColW
    const cy = y + row * 10

    if (row % 2 === 0) {
      doc.setFillColor(...COLORS.light)
      doc.rect(cx, cy - 3, radarColW, 10, 'F')
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.muted)
    doc.text(report.radarData[i].label.toUpperCase(), cx + 2, cy + 1)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.text)
    doc.text(`${report.radarData[i].value}`, cx + 2, cy + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.muted)
    doc.text(`avg: ${report.radarData[i].average}`, cx + 16, cy + 6)
  }
  y += Math.ceil(report.radarData.length / 3) * 10 + 6

  // ── Contract Overview ──
  if (y > 250) {
    doc.addPage()
    y = margin
  }

  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(t('pdf.contractOverview'), margin, y)
  y += 6

  const contractEntries = Object.entries(report.contractInfo)
  for (let i = 0; i < contractEntries.length; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const cx = margin + col * (contentWidth / 2)
    const cy = y + row * 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.muted)
    doc.text(contractEntries[i][0].toUpperCase(), cx, cy)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.text)
    doc.text(String(contractEntries[i][1]), cx, cy + 5)
  }
  y += Math.ceil(contractEntries.length / 2) * 10 + 6

  // ── Transfer History ──
  if (y > 250) {
    doc.addPage()
    y = margin
  }

  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(t('pdf.transferHistory'), margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  for (const t of report.transferHistory) {
    doc.setFont('helvetica', 'bold')
    doc.text(t.club, margin + 4, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.muted)
    doc.text(`${t.date}  ·  ${t.fee}`, margin + 4, y + 4)
    doc.setTextColor(...COLORS.text)
    doc.setFontSize(9)
    y += 10
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.muted)
    doc.text(
      `ScoutCopilot  ·  ${report.playerName}  ·  ${t('pdf.generated')} ${new Date().toLocaleDateString()}  ·  ${t('pdf.page')} ${p}/${pageCount}`,
      margin,
      doc.internal.pageSize.getHeight() - 8,
    )
  }

  doc.save(`${report.playerName.replace(/\s+/g, '_')}_Scout_Report.pdf`)
}
