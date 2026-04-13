<script setup lang="ts">
import { reactive } from 'vue';

import type { Health, Rule } from 'models/health/index.js';

import type { HealthCheckMethod } from 'services/admin/health.js';
import { healthCheck } from 'services/admin/health.js';

import useNotifications from 'composables/useNotifications.js';

import HealthSection from 'components/Health/HealthSection.vue';

// Private

function resetRule(rule: Rule) {
  rule.checkerKey = new Date().valueOf().toString();
  rule.checking = false;
  rule.checkingFailed = false;
  rule.result = undefined;
  rule.successes = [];
  rule.errors = [];
  rule.info = [];
}

async function callHealthCheck(rule: Rule, key: string, method: HealthCheckMethod) {
  rule.checking = true;

  const result = await healthCheck(method);

  if (rule.checkerKey !== key) {
    return;
  }

  rule.checking = false;
  rule.successes.push(...result.successes);
  rule.errors.push(...result.errors);
  rule.info.push(...result.info);
  rule.result = rule.errors.length === 0;
}

// Composables

const { notifyErrorDebug } = useNotifications();

// Data

const defaultRuleData: Omit<Rule, 'checker' | 'title' | 'caption'> = {
  checking: false,
  checkingFailed: false,
  successes: [],
  errors: [],
  info: [],
};

const health = reactive<Health>({
  admin: [
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthAdmin-userAccountsSyncedFirebaseAuth'),
      title: 'admin_userAccounts',
      caption: 'In sync with Firebase Authentication',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthAdmin-membersUniqueUid'),
      title: 'admin_members',
      caption: 'Unique `uid`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthAdmin-membersUniqueEmail'),
      title: 'admin_members',
      caption: 'Unique `email`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthAdmin-membersSyncedAdminUserAccounts'),
      title: 'admin_members',
      caption: '`uid` and `email` in sync with `admin_userAccounts`',
      ...defaultRuleData,
    },
  ],
  hr: [
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthHr-membersSyncedAdminMembers'),
      title: 'hr_members',
      caption: '`isActive`, `email`, `fullName` and `photoUrl` in sync with `admin_members`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthHr-projectsSyncedProductionProjects'),
      title: 'hr_projects',
      caption: '`name`, `finishDate` and `productionSalaries` in sync with `production_projects`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthHr-payrollsUniqueCode'),
      title: 'hr_payrolls',
      caption: 'Unique `code`',
      ...defaultRuleData,
    },
  ],
  production1: [
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthProduction-membersSyncedAdminMembers'),
      title: 'production_members',
      caption: '`isActive`, `email`, `fullName` and `photoUrl` in sync with `admin_members`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthProduction-membersDprSyncedMain'),
      title: 'production_members',
      caption: '`defaultProductionRole` in sync with `production_productionRoles`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthProduction-productionRolesUniqueName'),
      title: 'production_productionRoles',
      caption: 'Unique `name`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthProduction-productTypesUniqueName'),
      title: 'production_productTypes',
      caption: 'Unique `name`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthProduction-productionSalaryDetailsUniqueProductionRole'),
      title: 'production_productTypes/{id}/productionSalaryDetails',
      caption: 'Unique `productionRole`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthProduction-productionSalaryDetailsPrSyncedMain'),
      title: 'production_productTypes/{id}/productionSalaryDetails',
      caption: '`productionRole` in sync with `production_productionRoles`',
      ...defaultRuleData,
    },
  ],
  production2: [
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthProduction-customersSyncedFinanceCustomers'),
      title: 'production_customers',
      caption: '`isActive`, `code` and `name` in sync with `finance_customers`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthProduction-projectsUniqueName'),
      title: 'production_projects',
      caption: 'Unique `name`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthProduction-projectsUniqueUrlFriendlyName'),
      title: 'production_projects',
      caption: 'Unique `urlFriendlyName`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthProduction-projectsOwnerSyncedMain'),
      title: 'production_projects',
      caption: '`owner` in sync with `production_members`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthProduction-projectsCustomerSyncedMain'),
      title: 'production_projects',
      caption: '`customer` in sync with `production_customers`',
      ...defaultRuleData,
    },
  ],
  production3: [
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthProduction-projectsIptSyncedMain'),
      title: 'production_projects/{id}.items',
      caption: '`productType` in sync with `production_productTypes`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthProduction-projectsIcmSyncedMain'),
      title: 'production_projects/{id}.items[index].contributions',
      caption: '`member` in sync with `production_members`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthProduction-projectsIcprSyncedMain'),
      title: 'production_projects/{id}.items[index].contributions',
      caption: '`productionRole` in sync with `production_productionRoles`',
      ...defaultRuleData,
    },
  ],
  finance1: [
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-customersUniqueCode'),
      title: 'finance_customers',
      caption: 'Unique `code`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-customersUniqueName'),
      title: 'finance_customers',
      caption: 'Unique `name`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-suppliersUniqueCode'),
      title: 'finance_suppliers',
      caption: 'Unique `code`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-suppliersUniqueName'),
      title: 'finance_suppliers',
      caption: 'Unique `name`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-financeAccountsUniqueName'),
      title: 'finance_financeAccounts',
      caption: 'Unique `name`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-invoiceGroupsUniqueName'),
      title: 'finance_invoiceGroups',
      caption: 'Unique `name`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-expenseGroupsUniqueName'),
      title: 'finance_expenseGroups',
      caption: 'Unique `name`',
      ...defaultRuleData,
    },
  ],
  finance2: [
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-projectsSyncedProductionProjects'),
      title: 'finance_projects',
      caption:
        '`isArchived`, `name`, `urlFriendlyName`, `customerContact`, `owner`, `finishDate`, `customer` and `items` in sync with `production_projects`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-projectsIeSyncedProject'),
      title: 'finance_projects',
      caption:
        'Invoices (`issueDate`, `isRequired`, `content` and `customer`) and expenses (`issueDate`) in sync with project',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-projectsEsSyncedMain'),
      title: 'finance_projects/{id}.expenses',
      caption: '`supplier` in sync with `finance_suppliers`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-projectsTfasSyncedMain'),
      title:
        'finance_projects/{id}.quotations[index].invoice.transactions, finance_projects/{id}.expenses[index].transactions',
      caption:
        '`sourceFinanceAccount`, `destinationFinanceAccount` in sync with `finance_financeAccounts`',
      ...defaultRuleData,
    },
  ],
  finance3: [
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-generalInvoicesCustomerSyncedMain'),
      title: 'finance_generalInvoices',
      caption: '`customer` in sync with `finance_customers`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-generalInvoicesGroupSyncedMain'),
      title: 'finance_generalInvoices',
      caption: '`group` in sync with `finance_invoiceGroups`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-generalInvoicesTfasSyncedMain'),
      title: 'finance_generalInvoices/{id}.transactions',
      caption:
        '`sourceFinanceAccount`, `destinationFinanceAccount` in sync with `finance_financeAccounts`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-generalExpensesSupplierSyncedMain'),
      title: 'finance_generalExpenses',
      caption: '`supplier` in sync with `finance_suppliers`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-generalExpensesGroupSyncedMain'),
      title: 'finance_generalExpenses',
      caption: '`group` in sync with `finance_expenseGroups`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-generalExpensesTfasSyncedMain'),
      title: 'finance_generalExpenses/{id}.transactions',
      caption:
        '`sourceFinanceAccount`, `destinationFinanceAccount` in sync with `finance_financeAccounts`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-generalTransactionsFasSyncedMain'),
      title: 'finance_generalTransactions',
      caption:
        '`sourceFinanceAccount`, `destinationFinanceAccount` in sync with `finance_financeAccounts`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-salesContractsCustomerSyncedMain'),
      title: 'finance_salesContracts',
      caption: '`customer` in sync with `finance_customers`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-salesContractsProjectsSyncedMain'),
      title: 'finance_salesContracts',
      caption: '`projectIds` in sync with `finance_projects`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) =>
        callHealthCheck(rule, key, 'healthFinance-salesContractsGisSyncedMain'),
      title: 'finance_salesContracts',
      caption: '`generalInvoiceIds` in sync with `finance_generalInvoices`',
      ...defaultRuleData,
    },
  ],
  finance4: [
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-invoicesUniqueCode'),
      title: 'finance_projects/{id}.quotations[index].invoice, finance_generalInvoices',
      caption: 'Unique `code`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-expensesUniqueCode'),
      title: 'finance_projects/{id}.expenses, finance_generalExpenses',
      caption: 'Unique `code`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-transactionsUniqueCode'),
      title:
        'finance_projects/{id}.quotations[index].invoice.transactions, finance_projects/{id}.expenses[index].transactions, finance_generalInvoices/{id}.transactions, finance_generalExpenses/{id}.transactions, finance_generalTransactions',
      caption: 'Unique `code`',
      ...defaultRuleData,
    },
    {
      checker: (rule, key) => callHealthCheck(rule, key, 'healthFinance-salesContractsUniqueCode'),
      title: 'finance_salesContracts',
      caption: 'Unique `code`',
      ...defaultRuleData,
    },
  ],
});

// Methods

function checkSection(section: Rule[]) {
  section.forEach((rule) => resetRule(rule));
  section.forEach((rule) => {
    void rule.checker(rule, rule.checkerKey as string).catch((error) => {
      notifyErrorDebug(error);
      rule.checking = false;
      rule.checkingFailed = true;
    });
  });
}
</script>

<template>
  <QPagePadding padding>
    <HealthSection
      check-button-tooltip="Check Admin Health"
      :rules="health.admin"
      title="Admin"
      @check="checkSection(health.admin)"
    />

    <HealthSection
      check-button-tooltip="Check HR Health"
      :rules="health.hr"
      title="HR"
      @check="checkSection(health.hr)"
    />

    <HealthSection
      check-button-tooltip="Check Production 1 Health"
      :rules="health.production1"
      title="Production 1"
      @check="checkSection(health.production1)"
    />

    <HealthSection
      check-button-tooltip="Check Production 2 Health"
      :rules="health.production2"
      title="Production 2"
      @check="checkSection(health.production2)"
    />

    <HealthSection
      check-button-tooltip="Check Production 3 Health"
      :rules="health.production3"
      title="Production 3"
      @check="checkSection(health.production3)"
    />

    <HealthSection
      check-button-tooltip="Check Finance 1 Health"
      :rules="health.finance1"
      title="Finance 1"
      @check="checkSection(health.finance1)"
    />

    <HealthSection
      check-button-tooltip="Check Finance 2 Health"
      :rules="health.finance2"
      title="Finance 2"
      @check="checkSection(health.finance2)"
    />

    <HealthSection
      check-button-tooltip="Check Finance 3 Health"
      :rules="health.finance3"
      title="Finance 3"
      @check="checkSection(health.finance3)"
    />

    <HealthSection
      check-button-tooltip="Check Finance 4 Health"
      :rules="health.finance4"
      title="Finance 4"
      @check="checkSection(health.finance4)"
    />
  </QPagePadding>
</template>
