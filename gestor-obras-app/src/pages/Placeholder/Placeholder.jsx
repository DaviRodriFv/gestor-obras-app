export default function Placeholder({ title }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-1">Em breve...</p>
    </div>
  );
}
