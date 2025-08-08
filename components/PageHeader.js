export default function PageHeader({ title, description }) {
  return (
    <header className="mb-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg px-6 py-5">
        <h1 className="text-2xl font-bold text-primary-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-primary-700">{description}</p>
        )}
      </div>
    </header>
  )
}
