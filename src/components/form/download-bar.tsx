// src/components/form/DownloadBar.tsx

import * as React from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type DynFieldLite = { id: string; label: string };

type DownloadBarProps = {
  title?: string;                     // used as report title & filename base
  fields: DynFieldLite[];
  values: Record<string, unknown>;
};

export default function DownloadBar({
  title = "Shift & Handover Report",
  fields,
  values,
}: DownloadBarProps) {
  /** ------------ helpers kept inside component ------------ */
  const fileBase = React.useMemo(
    () =>
      title
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .toLowerCase() || "report",
    [title]
  );

  const downloadBlob = (data: Blob, filename: string) => {
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getCellText = (v: unknown) =>
    v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);

  /** ------------ JSON ------------ */
  const onDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(values, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `${fileBase}.json`);
  };

  /** ------------ CSV (Excel) ------------
   * Row-wise structure: Header | Label | Value
   * Header = the report title (same for every row) as requested.
   */
  const escapeCSV = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const onDownloadCSV = () => {
    const headers = ["Header", "Label", "Value"].map(escapeCSV).join(",");
    const rows = fields
      .map((f) => {
        const label = f.label || f.id;
        const value = getCellText(values[f.id]);
        return [title, label, value].map(escapeCSV).join(",");
      })
      .join("\r\n");
    const csv = [headers, rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${fileBase}.csv`);
  };

  /** ------------ PDF (jsPDF + autoTable) ------------
   * Big header at top. Then a two-column table: Label | Value.
   */
  const onDownloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", compress: true });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, 48, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(new Date().toLocaleString(), pageWidth / 2, 64, { align: "center" });
    doc.setTextColor(0);

    // Build table rows: [Label, Value]
    const body = fields.map((f) => {
      const label = f.label || f.id;
      const value = getCellText(values[f.id] ?? "");
      return [label, value];
    });

    autoTable(doc, {
      head: [["Label", "Value"]],
      body,
      startY: 84,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 6,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [16, 185, 129], // emerald-ish
        textColor: 255,
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 180 }, // Label column fixed width
        1: { cellWidth: "auto" }, // Value takes the rest
      },
      margin: { left: 36, right: 36 },
    });

    doc.save(`${fileBase}.pdf`);
  };

  /** ------------ UI ------------ */
  return (
    <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{title} Download</div>
        <div className="flex items-center gap-2">
          <Button onClick={onDownloadJSON} variant="outline">
            JSON
          </Button>
          <Button onClick={onDownloadCSV} variant="outline">
            Excel
          </Button>
          <Button onClick={onDownloadPDF} className="bg-emerald-600 text-white hover:bg-emerald-700">
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
