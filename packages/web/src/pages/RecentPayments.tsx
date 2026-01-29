import { useState } from 'react';
import { Card, CardBody, Input, Button, Chip } from '@heroui/react';
import { SearchIcon } from '@heroui/shared-icons';

const mockPayments = [
  { id: '1', name: 'MBOWO Pierre', taxNumber: '12547', amount: 45000, status: 'paid' },
  { id: '2', name: 'NDONG Emilie', taxNumber: '53792', amount: 21000, status: 'paid' },
  { id: '3', name: 'MBA Noël', taxNumber: '12547', amount: 43000, status: 'paid' },
  { id: '4', name: 'NGOMA Imelda', taxNumber: '53792', amount: 85000, status: 'paid' },
  { id: '5', name: 'MEZU Jacques', taxNumber: '53792', amount: 21000, status: 'paid' },
];

export default function RecentPayments() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Paiements récents</h1>
      </div>

      <Card className="bg-white shadow-md">
        <CardBody className="p-6">
          <Input
            placeholder="Rechercher apparais..."
            startContent={<SearchIcon size={20} />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="mb-6"
            classNames={{
              input: 'text-sm',
              inputWrapper: 'bg-gray-50',
            }}
          />

          <div className="space-y-3">
            {mockPayments.map(payment => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{payment.name}</h3>
                  <p className="text-sm text-gray-600">Taxe N°{payment.taxNumber}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{payment.amount.toLocaleString()} CFA</p>
                  </div>
                  <Chip
                    color="success"
                    variant="flat"
                    size="sm"
                    className="bg-green-100 text-green-700"
                  >
                    Payé
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
