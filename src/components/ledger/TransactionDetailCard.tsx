"use client";

import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  Tag,
  CreditCard,
  Banknote,
  Users,
  Briefcase,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { TransactionWithRelations, TransactionType, TransactionStatus } from '@/types/transaction';
import TransactionActions from './TransactionActions';

interface TransactionDetailCardProps {
  transaction: TransactionWithRelations;
  showActions?: boolean;
  actionsClassName?: string;
}

export default function TransactionDetailCard({ 
  transaction, 
  showActions = true,
  actionsClassName = 'mt-4'
}: TransactionDetailCardProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateValue: string | Date) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get status badge color
  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case TransactionStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case TransactionStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case TransactionStatus.FAILED:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case TransactionStatus.CANCELLED:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Transaction header */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {transaction.description}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {formatDate(transaction.date)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(transaction.status)}`}>
            {getStatusIcon(transaction.status)}
            <span className="ml-1">{transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase()}</span>
          </span>
          <div className={`text-lg font-semibold ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {transaction.type === TransactionType.INCOME ? (
              <ArrowDownLeft className="h-5 w-5 mr-1" />
            ) : (
              <ArrowUpRight className="h-5 w-5 mr-1" />
            )}
            {transaction.type === TransactionType.INCOME ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      </div>
      
      {/* Transaction details */}
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(transaction.date)}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Description
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {transaction.description}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Category
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {transaction.category}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Method
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {transaction.paymentMethod.replace(/_/g, ' ')}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Reference
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {transaction.reference || 'N/A'}
            </dd>
          </div>
          
          {transaction.grant && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Banknote className="h-4 w-4 mr-2" />
                Grant
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link href={`/grants/${transaction.grant.id}`} className="text-blue-600 hover:text-blue-800">
                  {transaction.grant.grantIdentifier} - {transaction.grant.grantee?.name || 'Unknown Grantee'}
                </Link>
              </dd>
            </div>
          )}
          
          {transaction.donor && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Donor
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link href={`/donors/${transaction.donor.id}`} className="text-blue-600 hover:text-blue-800">
                  {transaction.donor.name}
                </Link>
              </dd>
            </div>
          )}
          
          {transaction.serviceProvider && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Service Provider
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link href={`/service-providers/${transaction.serviceProvider.id}`} className="text-blue-600 hover:text-blue-800">
                  {transaction.serviceProvider.name}
                </Link>
              </dd>
            </div>
          )}
          
          {transaction.notes && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Notes
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                {transaction.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>
      
      {/* Action buttons */}
      {showActions && (
        <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-3">
          <Link 
            href={`/transactions/${transaction.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </Link>
        </div>
      )}
      
      {/* Transaction Actions */}
      {showActions && (
        <div className={actionsClassName}>
          <TransactionActions transactionId={transaction.id} />
        </div>
      )}
    </div>
  );
}
