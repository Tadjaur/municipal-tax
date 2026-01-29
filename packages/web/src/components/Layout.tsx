import type { ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '../stores/authStore';
import { Button, Avatar } from '@heroui/react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const navigation = [
    { name: 'Tableau de bord', path: '/admin/dashboard' },
    { name: 'Paiements', path: '/admin/payments' },
    { name: 'Opérateurs', path: '/admin/operators' },
    { name: 'Services', path: '/admin/services' },
  ];

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">M</span>
            </div>
            <h1 className="text-xl font-bold">Mairie de Libreville</h1>
          </div>

          <div className="flex items-center gap-4">
            <Avatar size="sm" name={user?.profile?.firstName} className="bg-teal-500" />
            <Button size="sm" variant="light" className="text-white" onPress={() => signOut()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-72px)]">
          <nav className="p-4 space-y-2">
            {navigation.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
