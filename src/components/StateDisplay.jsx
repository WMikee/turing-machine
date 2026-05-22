export default function StateDisplay({ estado, mensaje }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <strong>Estado actual:</strong> <span >{estado}</span>
      <br />
      <small>{mensaje}</small>
    </div>
  );
}