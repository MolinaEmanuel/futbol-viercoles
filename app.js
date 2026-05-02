// 🔥 TOAST
function toast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.classList.add("show");

  setTimeout(()=> t.classList.remove("show"),2000);
}

// LOADER FIX
window.addEventListener("load", ()=>{
  setTimeout(()=> loader.classList.add("hidden"),300);
});

/* LOGIN */
window.verificarLogin = () => {
  if(passwordInput.value==="cogi2"){
    window.admin = true;
    localStorage.setItem("admin","true");
    modalLogin.style.display="none";

    toast("Modo admin activado 🔓");
    renderAll();

  } else {
    toast("Contraseña incorrecta ❌");
  }
};

window.logout = () => {
  window.admin = false;
  localStorage.removeItem("admin");
  toast("Sesión cerrada");
  renderAll();
};

/* RESULTADOS */
window.guardarResultado = (i)=>{
  let a=parseInt(document.getElementById("a"+i).value);
  let b=parseInt(document.getElementById("b"+i).value);

  if(isNaN(a)||isNaN(b)) return toast("Ingresá goles");

  datos[i].golesA=a;
  datos[i].golesB=b;

  guardar();
  toast("Resultado guardado ⚽");
};

/* MVP */
window.guardarJugador = () => {
  let nombre = document.getElementById("inputJugador").value;
  if (!nombre) return;

  let index = datos.findLastIndex(p => p.golesA != null);
  if (index === -1) return;

  jugadores[index] = nombre;
  document.getElementById("inputJugador").value = "";
  guardar();

  toast("MVP guardado ⭐");
};

/* JUGADORES */
window.agregarJugador = (equipo) => {
  let nombre = prompt("Nombre completo");
  if (!nombre) return;

  let altura = prompt("Altura") || "-";
  let nacimiento = prompt("Nacimiento") || "-";
  let foto = prompt("Ruta imagen") || "";

  planteles[equipo].push({ nombre, altura, nacimiento, foto });

  guardar();
  renderPlanteles();

  toast("Jugador agregado 👤");
};

window.eliminarJugador = function(equipo, index) {
  if(!confirm("Eliminar jugador?")) return;

  planteles[equipo].splice(index, 1);
  guardar();
  renderPlanteles();

  document.querySelector(".modal-jugador")?.remove();
  toast("Jugador eliminado 🗑️");
};

window.guardarEdicionJugador = function(equipo, index) {

  const nombre = document.getElementById("editNombre").value;
  const altura = document.getElementById("editAltura").value;
  const nacimiento = document.getElementById("editNacimiento").value;
  const foto = document.getElementById("editFoto").value;

  planteles[equipo][index] = {
    nombre,
    altura,
    nacimiento,
    foto
  };

  guardar();
  renderPlanteles();

  document.querySelector(".modal-jugador")?.remove();
  toast("Jugador actualizado ✏️");
};

