(function () {
  "use strict";

  var form = document.getElementById("registro");
  var campoCual = document.getElementById("campoCual");
  var inputCual = document.getElementById("congregacion");
  var status = document.getElementById("status");
  var btn = document.getElementById("enviar");
  var gracias = document.getElementById("gracias");
  var otro = document.getElementById("otro");
  var endpoint = (window.VINO_NUEVO_CONFIG || {}).endpoint || "";

  // Mostrar "¿cuál?" sólo si responde Sí
  form.addEventListener("change", function (e) {
    if (e.target.name === "otraCongregacion") {
      var si = e.target.value === "Sí";
      campoCual.hidden = !si;
      inputCual.required = si;
      if (si) inputCual.focus(); else { inputCual.value = ""; setError("congregacion", ""); }
    }
    if (e.target.name) setError(e.target.name, "");
  });

  form.addEventListener("input", function (e) {
    if (e.target.name) setError(e.target.name, "");
  });

  function setError(name, msg) {
    var el = form.querySelector('.error[data-for="' + name + '"]');
    if (el) el.textContent = msg;
    var inputs = form.querySelectorAll('[name="' + name + '"]');
    inputs.forEach(function (i) {
      if (msg) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid");
    });
  }

  function limpio(v) { return String(v || "").trim().replace(/\s+/g, " "); }

  function validar(d) {
    var ok = true;
    var first = null;
    function fail(name, msg) {
      setError(name, msg); ok = false;
      if (!first) first = form.querySelector('[name="' + name + '"]');
    }
    if (!d.nombre) fail("nombre", "Escribe tu nombre.");
    if (!d.apellido) fail("apellido", "Escribe tu apellido.");
    var edad = Number(d.edad);
    if (!d.edad) fail("edad", "Escribe tu edad.");
    else if (!Number.isInteger(edad) || edad < 5 || edad > 99) fail("edad", "Escribe una edad entre 5 y 99.");
    if (!d.condicion) fail("condicion", "Elige Miembro o Invitado.");
    if (!d.otraCongregacion) fail("otraCongregacion", "Elige Sí o No.");
    if (d.otraCongregacion === "Sí" && !d.congregacion) fail("congregacion", "Escribe el nombre de tu congregación.");
    if (first) first.focus();
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    status.classList.remove("is-error");

    var fd = new FormData(form);
    var d = {
      nombre: limpio(fd.get("nombre")),
      apellido: limpio(fd.get("apellido")),
      edad: limpio(fd.get("edad")),
      condicion: fd.get("condicion") || "",
      otraCongregacion: fd.get("otraCongregacion") || "",
      congregacion: limpio(fd.get("congregacion")),
      website: fd.get("website") || ""
    };
    if (d.otraCongregacion !== "Sí") d.congregacion = "";
    if (!validar(d)) return;

    if (!endpoint) {
      status.textContent = "El formulario aún no está conectado a la base de datos (falta la URL en js/config.js).";
      status.classList.add("is-error");
      return;
    }

    btn.disabled = true;
    btn.querySelector(".btn__label").textContent = "Enviando…";

    fetch(endpoint, { method: "POST", body: new URLSearchParams(d) })
      .then(function (r) {
        return r.text().then(function (t) {
          try { return JSON.parse(t); }
          catch (_) { var e = new Error("respuesta"); e.tipo = "respuesta"; throw e; }
        });
      })
      .then(function (res) {
        if (!res || !res.ok) { var e = new Error((res && res.error) || "error"); e.tipo = "servidor"; throw e; }
        form.reset();
        campoCual.hidden = true;
        form.hidden = true;
        gracias.hidden = false;
        gracias.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function (err) {
        if (window.console) console.error("Error al enviar:", err);
        if (err && err.tipo === "servidor") {
          status.textContent = "No se pudo guardar: " + err.message;
        } else if (err && err.tipo === "respuesta") {
          status.textContent = "La base de datos no respondió bien. Revisa que la implementación tenga acceso para «Cualquiera».";
        } else {
          status.textContent = "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.";
        }
        status.classList.add("is-error");
      })
      .finally(function () {
        btn.disabled = false;
        btn.querySelector(".btn__label").textContent = "Enviar registro";
      });
  });

  otro.addEventListener("click", function () {
    gracias.hidden = true;
    form.hidden = false;
    document.getElementById("nombre").focus();
  });
})();
