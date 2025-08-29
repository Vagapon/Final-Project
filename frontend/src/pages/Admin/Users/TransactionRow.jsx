import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const TransactionRow = ({ transaction }) => {
  const statusColor = {
    Success: 'text-green-600',
    Pending: 'text-yellow-600',
    Failed: 'text-red-600',
  };

  return (
    <tr className="text-sm text-gray-700 dark:text-gray-300">
      {/* Image */}
      <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
        <img
          src={transaction.image || 'https://via.placeholder.com/40'}
          alt="Transaction"
          className="w-10 h-10 rounded-full object-cover"
        />
      </td>

      {/* Name */}
      <td className="px-2 sm:px-4 py-2 sm:py-4 break-words">{transaction.name}</td>

      {/* Price */}
      <td className="px-2 sm:px-4 py-2 sm:py-4 break-words">{transaction.price}</td>

      {/* Category */}
      <td className="px-2 sm:px-4 py-2 sm:py-4 break-words">{transaction.category}</td>

      {/* Status */}
      <td
        className={`px-2 sm:px-4 py-2 sm:py-4 font-semibold ${statusColor[transaction.status]}`}
      >
        {transaction.status}
      </td>

      {/* Actions */}
      <td className="px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex flex-wrap gap-2">
          <button title="Edit">
            <Pencil className="w-4 h-4 text-blue-500 hover:text-blue-700" />
          </button>
          <button title="Delete">
            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TransactionRow;
