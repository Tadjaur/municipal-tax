import { Card, CardBody } from '@heroui/react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#3d7a94', '#33afaf', '#66abc3', '#99dfdf'];

export default function Dashboard() {
  // Mock data - replace with actual API calls
  const dailyRevenue = 620000;
  const transactionCount = 87;
  const moneyCollected = 7200;
  const totalRevenue = 12510000;

  const taxDistribution = [
    { name: 'Taxe Municipale', value: 38, amount: 237200 },
    { name: 'Occupation Domaine Public', value: 28, amount: 173600 },
    { name: 'Redevance', value: 12, amount: 74400 },
    { name: 'Taxes Diverses', value: 18, amount: 111600 },
  ];

  const channelDistribution = [
    { name: 'Airtel Money', value: 73, amount: 452600 },
    { name: 'Safura', value: 27, amount: 167400 },
  ];

  const revenueByPeriod = [
    { period: '07 AMI', amount: 400000 },
    { period: '14 MAI', amount: 550000 },
    { period: '21 MAI', amount: 510000 },
    { period: '28 MAI', amount: 580000 },
    { period: '04 JUN', amount: 540000 },
    { period: '11 JUN', amount: 600000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
      </div>

      {/* Revenue Card */}
      <Card className="bg-white shadow-md">
        <CardBody className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Montant encaissé aujourd'hui</p>
              <h2 className="text-4xl font-bold text-gray-900">
                {dailyRevenue.toLocaleString()} <span className="text-2xl text-gray-600">CFA</span>
              </h2>
            </div>
            <div className="bg-teal-500 text-white px-4 py-2 rounded-lg">
              <p className="text-2xl font-bold">{dailyRevenue.toLocaleString()}</p>
              <p className="text-xs">CFA</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Transactions Card */}
      <Card className="bg-white shadow-md">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Transactions aujourd'hui</p>
              <h3 className="text-3xl font-bold text-gray-900">{transactionCount}</h3>
            </div>
            <div className="text-right">
              <p className="text-teal-600 flex items-center">
                <span className="text-lg mr-2">👤</span>
                Q7,200 Money
              </p>
              <p className="bg-teal-500 text-white px-3 py-1 rounded text-sm mt-2">
                {totalRevenue.toLocaleString()} CFA
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Distribution */}
        <Card className="bg-white shadow-md">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Répartition des taxes</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={taxDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {taxDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {taxDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Payment Channels */}
        <Card className="bg-white shadow-md">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Encaissements par canal</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={channelDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {channelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#33afaf' : '#3d7a94'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {channelDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: index === 0 ? '#33afaf' : '#3d7a94' }}
                      />
                      <span className="text-gray-700 text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{item.value}%</p>
                      <p className="text-xs text-gray-500">{item.amount.toLocaleString()} CFA</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Revenue Bar Chart */}
      <Card className="bg-white shadow-md">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Encaissements par période</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByPeriod}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} CFA`} />
              <Bar dataKey="amount" fill="#3d7a94" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}
