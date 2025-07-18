import * as XLSX from "xlsx";

export const exportarExcel = (datos, nombreArchivo = "informe.xlsx") => {
  try {
    if (!Array.isArray(datos) || datos.length === 0) {
      console.warn("No hay datos para exportar a Excel");
      return;
    }

    // Crear hoja a partir del array de objetos
    const hoja = XLSX.utils.json_to_sheet(datos);

    // Crear libro nuevo y anexar hoja con nombre "Informe"
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Informe");

    // Forzar que el nombre tenga extensión .xlsx
    const archivoConExtension = nombreArchivo.endsWith(".xlsx")
      ? nombreArchivo
      : nombreArchivo + ".xlsx";

    // Guardar archivo
    XLSX.writeFile(libro, archivoConExtension);
  } catch (error) {
    console.error("Error exportando Excel:", error);
  }
};
