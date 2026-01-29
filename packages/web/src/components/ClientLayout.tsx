export default function ClientLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-light-gray">
      <header className="bg-teal-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Portail Client - Mairie de Libreville</h1>
        </div>
      </header>

      <main className="container mx-auto p-8">{children}</main>
    </div>
  );
}
