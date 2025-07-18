
// src/utils/exportarPDF.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export function exportarPDF(columnas, datos, titulo = "Informe") {
  const doc = new jsPDF();

  // Configurar fuente y tamaño para el título
  doc.setFontSize(16);
  doc.text(titulo, 14, 15);

  // Definir estilos para la tabla
  doc.autoTable({
    startY: 25,
    head: [columnas],
    body: datos,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] }, // color verde azulado
    margin: { left: 14, right: 14 },
  });

  // Guardar archivo con extensión .pdf, reemplazando caracteres inválidos en el título
  const nombreArchivo = `${titulo.replace(/[/\\?%*:|"<>]/g, "-")}.pdf`;
  doc.save(nombreArchivo);
}
