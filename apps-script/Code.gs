/**
 * Base de datos del formulario "Vino Nuevo" en Google Sheets.
 * Pega este código en Extensiones → Apps Script de tu hoja y publícalo
 * como Aplicación web (ver README.md).
 */
var HOJA = "Registros";
var COLUMNAS = ["Fecha", "Nombre", "Apellido", "Edad", "Condición", "¿Otra congregación?", "¿Cuál?"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var p = (e && e.parameter) || {};

    // Trampa anti-spam: si viene lleno, se ignora en silencio
    if (p.website) return json({ ok: true });

    var nombre = limpio(p.nombre, 60);
    var apellido = limpio(p.apellido, 60);
    var edad = parseInt(p.edad, 10);
    var condicion = p.condicion === "Miembro" || p.condicion === "Invitado" ? p.condicion : "";
    var otra = p.otraCongregacion === "Sí" || p.otraCongregacion === "No" ? p.otraCongregacion : "";
    var cual = otra === "Sí" ? limpio(p.congregacion, 100) : "";

    if (!nombre || !apellido || !(edad >= 5 && edad <= 99) || !condicion || !otra || (otra === "Sí" && !cual)) {
      return json({ ok: false, error: "Datos incompletos" });
    }

    hoja().appendRow([new Date(), nombre, apellido, edad, condicion, otra, cual]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, mensaje: "Formulario Vino Nuevo activo" });
}

function hoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNAS);
    sh.getRange(1, 1, 1, COLUMNAS.length).setFontWeight("bold").setBackground("#4a0b1f").setFontColor("#ffffff");
    sh.setFrozenRows(1);
  }
  return sh;
}

// Evita que alguien meta fórmulas en la hoja (=, +, -, @ al inicio)
function limpio(v, max) {
  var s = String(v || "").trim().replace(/\s+/g, " ").slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
