import React from 'react';
import { Search } from 'lucide-react';
import TransactionRow from './TransactionRow';

const User = () => {
  const transactions = [
    {
      id: 1,
      image: 'https://thumb.tvonenews.com/thumbnail/2023/05/30/6475b6c61e625-cristiano-ronaldo_1265_711.jpg',
      name: 'Bought PYPL',
      price: '$2,567.88',
      category: 'Finance',
      status: 'Success',
    },
    {
      id: 2,
      image: 'https://thumb.tvonenews.com/thumbnail/2023/05/30/6475b6c61e625-cristiano-ronaldo_1265_711.jpg',
      name: 'Bought AAPL',
      price: '$2,567.88',
      category: 'Finance',
      status: 'Pending',
    },
    {
      id: 3,
      image: 'https://thumb.tvonenews.com/thumbnail/2023/05/30/6475b6c61e625-cristiano-ronaldo_1265_711.jpg',
      name: 'Sell KKST',
      price: '$2,567.88',
      category: 'Finance',
      status: 'Success',
    },
    {
      id: 4,
      image: 'https://thumb.tvonenews.com/thumbnail/2023/05/30/6475b6c61e625-cristiano-ronaldo_1265_711.jpg',
      name: 'Bought FB',
      price: '$2,567.88',
      category: 'Finance',
      status: 'Success',
    },
    {
      id: 5,
      image: 'https://thumb.tvonenews.com/thumbnail/2023/05/30/6475b6c61e625-cristiano-ronaldo_1265_711.jpg',
      name: 'Sell AMZN',
      price: '$2,567.88',
      category: 'Finance',
      status: 'Failed',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Latest Transactions</h3>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-full sm:w-64 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table for desktop */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="min-w-[700px] w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {['Image', 'Name', 'Price', 'Category', 'Status', 'Action'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Card list for mobile */}
      <div className="block sm:hidden px-4 py-2 space-y-4">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex gap-4 items-center">
            <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
              <div className="font-medium text-gray-900 dark:text-white">{t.name}</div>
              <div className="text-xs">{t.price} • {t.category}</div>
              <div className="mt-1 text-xs font-semibold 
                ${
                  t.status === 'Success' ? 'text-green-600' :
                  t.status === 'Pending' ? 'text-yellow-600' :
                  'text-red-600'
                }">
                {t.status}
              </div>
            </div>
            <div className="flex gap-2">
              <button title="Edit" className="text-blue-500 hover:text-blue-700">
                ✏️
              </button>
              <button title="Delete" className="text-red-500 hover:text-red-700">
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default User;
