// inline=true skips the centred wrapper — use inside buttons or tight spaces
export default function Spinner({ size = "2.5rem", inline = false }) {
  const spinner = (
    <div
      className="site-spinner"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
    />
  );

  if (inline) return spinner;

  return <div className="site-spinner-wrapper">{spinner}</div>;
}
