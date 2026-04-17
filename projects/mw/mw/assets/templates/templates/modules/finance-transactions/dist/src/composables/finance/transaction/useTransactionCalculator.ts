import { sumBy } from 'lodash-es';

import { checkAndCalculate } from 'utils/calculation.js';

import type { Transaction, TransactionVm } from 'models/finance/index.js';

export default function useTransactionCalculator<
  TTransaction extends Transaction | TransactionVm,
>() {
  type TTransactionDetail = TTransaction['details'][number];

  // Transaction

  function transactionNegative(transaction: TTransaction) {
    if (!transaction.type) {
      return false;
    }

    if (transaction.type === 'Receipt Refund' || transaction.type === 'Payment Refund') {
      return true;
    } else if (
      transaction.type === 'Payment' ||
      transaction.type === 'Receipt' ||
      transaction.type === 'Transfer'
    ) {
      return false;
    } else {
      const _exhaustiveCheck: never = transaction.type;
      return _exhaustiveCheck;
    }
  }

  function transactionHasCustomer(transaction: TTransaction) {
    if (!transaction.type) {
      return false;
    }

    if (transaction.type === 'Receipt' || transaction.type === 'Receipt Refund') {
      return true;
    } else if (
      transaction.type === 'Payment' ||
      transaction.type === 'Payment Refund' ||
      transaction.type === 'Transfer'
    ) {
      return false;
    } else {
      const _exhaustiveCheck: never = transaction.type;
      return _exhaustiveCheck;
    }
  }

  function transactionHasSupplier(transaction: TTransaction) {
    if (!transaction.type) {
      return false;
    }

    if (transaction.type === 'Payment' || transaction.type === 'Payment Refund') {
      return true;
    } else if (
      transaction.type === 'Receipt' ||
      transaction.type === 'Receipt Refund' ||
      transaction.type === 'Transfer'
    ) {
      return false;
    } else {
      const _exhaustiveCheck: never = transaction.type;
      return _exhaustiveCheck;
    }
  }

  function transactionHasSourceAccount(transaction: TTransaction) {
    if (!transaction.type) {
      return false;
    }

    if (
      transaction.type === 'Receipt Refund' ||
      transaction.type === 'Payment' ||
      transaction.type === 'Transfer'
    ) {
      return true;
    } else if (transaction.type === 'Receipt' || transaction.type === 'Payment Refund') {
      return false;
    } else {
      const _exhaustiveCheck: never = transaction.type;
      return _exhaustiveCheck;
    }
  }

  function transactionHasDestinationAccount(transaction: TTransaction) {
    if (!transaction.type) {
      return false;
    }

    if (
      transaction.type === 'Receipt' ||
      transaction.type === 'Payment Refund' ||
      transaction.type === 'Transfer'
    ) {
      return true;
    } else if (transaction.type === 'Receipt Refund' || transaction.type === 'Payment') {
      return false;
    } else {
      const _exhaustiveCheck: never = transaction.type;
      return _exhaustiveCheck;
    }
  }

  function transactionTotalQuantity(transaction: TTransaction) {
    return sumBy<TTransactionDetail>(
      transaction.details,
      (detail) => checkAndCalculate(() => detail.quantity as number, detail.quantity) || 0,
    );
  }

  function transactionTotal(transaction: TTransaction) {
    return sumBy<TTransactionDetail>(
      transaction.details,
      (detail) => transactionDetailAmount(detail) || 0,
    );
  }

  // TransactionDetail

  function transactionDetailAmount(transactionDetail: TTransactionDetail) {
    return checkAndCalculate(
      () => (transactionDetail.unitPrice as number) * (transactionDetail.quantity as number),
      transactionDetail.unitPrice,
      transactionDetail.quantity,
    );
  }

  return {
    transactionNegative,
    transactionHasCustomer,
    transactionHasSupplier,
    transactionHasSourceAccount,
    transactionHasDestinationAccount,
    transactionTotalQuantity,
    transactionTotal,
    transactionDetailAmount,
  };
}
