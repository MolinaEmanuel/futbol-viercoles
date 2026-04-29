const modalLogin = document.getElementById("modalLogin");
const passwordInput = document.getElementById("passwordInput");
const partidos = document.getElementById("partidos");
const tabla = document.getElementById("tabla");
const fechaActual = document.getElementById("fechaActual");
const jugadorTexto = document.getElementById("jugadorTexto");
const adminJugador = document.getElementById("adminJugador");
const historialContenido = document.getElementById("historialContenido");
const rankingContenido = document.getElementById("rankingContenido");
const loader = document.getElementById("loader");
const listaA = document.getElementById("listaA");
const listaB = document.getElementById("listaB");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAY-F10jVa_KTRtIjm4GNupFQ_UR1TsJVw",
  authDomain: "torneo-viercoles.firebaseapp.com",
  projectId: "torneo-viercoles",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const equipoA = "Equipo SEBA";
const equipoB = "Equipo HEBER";

let admin = localStorage.getItem("admin") === "true";
let datos = [];
let jugadores = [];
let planteles = { A: [], B: [] };

function generarFechas(){
  const fechas = [];
  let actual = new Date(2026, 3, 1);

  while (fechas.length < 18) {
    if (actual.getDay() === 3) {
      fechas.push({
        fecha: actual.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'}),
        golesA:null,
        golesB:null
      });
    }
    actual.setDate(actual.getDate()+1);
  }

  return fechas;
}

/* FIREBASE */
function cargarDatos(){
  const ref = doc(db,"torneo","datos");

  onSnapshot(ref,(docSnap)=>{
    if(docSnap.exists()){
      const data = docSnap.data();

      datos = data.partidos || generarFechas();
      jugadores = data.jugadores || new Array(datos.length).fill("");

      // 🔥 NORMALIZACIÓN CLAVE
      planteles = data.planteles || { A: [], B: [] };

      ["A","B"].forEach(eq=>{
        planteles[eq] = (planteles[eq] || []).map(j=>{
          if(typeof j === "string"){
            return { nombre:j, altura:"-", foto:"" };
          }
          return {
            nombre: j?.nombre || "-",
            altura: j?.altura || "-",
            foto: j?.foto || ""
          };
        });
      });

    } else {
      datos = generarFechas();
      jugadores = new Array(18).fill("");
      planteles = { A: [], B: [] };
      guardar();
    }

    renderAll();
    setTimeout(()=> loader.classList.add("hidden"),300);
  });
}

function guardar(){
  setDoc(doc(db,"torneo","datos"),{
    partidos:datos,
    jugadores:jugadores,
    planteles:planteles
  });
}

/* LOGIN */
window.abrirLogin = () => modalLogin.style.display="flex";

window.verificarLogin = () => {
  if(passwordInput.value==="cogi2"){
    admin=true;
    localStorage.setItem("admin","true");
    modalLogin.style.display="none";
    renderAll();
  } else alert("Incorrecto");
};

window.logout = () => {
  admin=false;
  localStorage.removeItem("admin");
  renderAll();
};

/* RESULTADO */
window.guardarResultado = (i)=>{
  let a=parseInt(document.getElementById("a"+i).value);
  let b=parseInt(document.getElementById("b"+i).value);

  if(isNaN(a)||isNaN(b)) return alert("Ingresá goles");

  datos[i].golesA=a;
  datos[i].golesB=b;

  guardar();
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
};

/* 🔥 AGREGAR JUGADOR PRO */
window.agregarJugador = (equipo) => {

  let nombre = prompt("Nombre jugador");
  if (!nombre) return;

  let altura = prompt("Altura (ej: 1.75)") || "-";
  let foto = prompt("Ruta imagen (assets/images/...)") || "";

  planteles[equipo].push({
    nombre,
    altura,
    foto
  });

  guardar();
};

/* RENDER */
function renderAll(){
  renderPartidos();
  renderTabla();
  renderInfo();
  renderHistorial();
  renderRanking();
  renderPlanteles();
}

function renderPartidos(){
  let html=`<tr>
  <th>Fecha</th><th>Día</th><th>Resultado</th><th>Cargar</th></tr>`;

  datos.forEach((p,i)=>{
    let res="-";

    if(p.golesA!=null){
      if(p.golesA>p.golesB){
        res=`${equipoA} ganó ${p.golesA}-${p.golesB}`;
      } else if(p.golesB>p.golesA){
        res=`${equipoB} ganó ${p.golesB}-${p.golesA}`;
      } else {
        res=`Empate ${p.golesA}-${p.golesB}`;
      }
    }

    html+=`<tr>
    <td>Fecha ${i+1}</td>
    <td>${p.fecha}</td>
    <td>${res}</td>
    <td>${admin?`
      <input id="a${i}" type="number">
      vs
      <input id="b${i}" type="number">
      <button onclick="guardarResultado(${i})">OK</button>
    `:'-'}</td>
    </tr>`;
  });

  partidos.innerHTML=html;
}

function renderTabla(){
  let a=0,b=0;

  datos.forEach(p=>{
    if(p.golesA==null) return;

    if(p.golesA>p.golesB) a+=3;
    else if(p.golesB>p.golesA) b+=3;
    else {a++;b++;}
  });

  tabla.innerHTML=`
  <div class="fila">${equipoA}: ${a} pts</div>
  <div class="fila">${equipoB}: ${b} pts</div>`;
}

function renderInfo(){
  let index = datos.findLastIndex(p => p.golesA != null);

  fechaActual.innerText = index >= 0 ? "Fecha " + (index + 1) : "-";
  jugadorTexto.innerHTML = "<b>" + (jugadores[index] || "-") + "</b>";

  adminJugador.style.display = admin ? "block" : "none";
}

function renderHistorial() {
  historialContenido.innerHTML = datos.map((p, i) => `
    <div class="fila">
      Fecha ${i+1} - ${p.fecha} <br>
      ${p.golesA!=null ? `${p.golesA}-${p.golesB}` : "Sin jugar"} <br>
      MVP: ${jugadores[i] || "-"}
    </div>
  `).join("");
}

function renderRanking(){
  let count={};

  jugadores.forEach(j=>{
    if(!j) return;
    count[j]=(count[j]||0)+1;
  });

  rankingContenido.innerHTML = Object.entries(count)
    .map(([n,c])=>`<div class="fila">${n} - ${c}</div>`)
    .join("");
}

/* 🔥 PLANTELES VISUAL FIFA */
function renderPlanteles() {

  listaA.innerHTML = planteles.A.map(j => `
    <div class="card jugador-card">
      <img src="${j.foto || 'https://via.placeholder.com/100'}">
      <div>
        <strong>${j.nombre}</strong>
        <div>Altura: ${j.altura}</div>
      </div>
    </div>
  `).join("");

  listaB.innerHTML = planteles.B.map(j => `
    <div class="card jugador-card">
      <img src="${j.foto || 'https://via.placeholder.com/100'}">
      <div>
        <strong>${j.nombre}</strong>
        <div>Altura: ${j.altura}</div>
      </div>
    </div>
  `).join("");
}

/* INIT */
cargarDatos();