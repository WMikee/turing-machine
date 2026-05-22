export default function ControlButtons({ estado, darUnPaso, reiniciar }) {
  return (
    <div>
      <button
        onClick={darUnPaso}
        disabled={estado === "FIN" || estado === "ACEPTAR" || estado === "RECHAZAR"}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        {estado === "FIN" || estado === "ACEPTAR" || estado === "RECHAZAR" ? "Terminado" : "Siguiente Paso"}
      </button>

      <button onClick={reiniciar} style={{ marginLeft: "10px" }}>
        Reiniciar
      </button>
    </div>
  );
}