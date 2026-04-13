<script setup lang="ts">
// sort-imports-ignore

// <% if (config.hasModule('finance-customers')) { %>•+ finance-customers
import { seedCustomers } from 'services/seed/seedCustomers.js';
// •- /finance-customers<% } else { %>•! finance-customers absent<% } %>

// <% if (config.hasModule('finance-suppliers')) { %>•+ finance-suppliers
import { seedSuppliers } from 'services/seed/seedSuppliers.js';
// •- /finance-suppliers<% } else { %>•! finance-suppliers absent<% } %>

// <% if (config.hasModule('finance-finance-accounts')) { %>•+ finance-finance-accounts
import { seedFinanceAccounts } from 'services/seed/seedFinanceAccounts.js';
// •- /finance-finance-accounts<% } else { %>•! finance-finance-accounts absent<% } %>

// <% if (config.hasModule('finance-invoices')) { %>•+ finance-invoices
import { seedGeneralInvoices } from 'services/seed/seedGeneralInvoices.js';
// •- /finance-invoices<% } else { %>•! finance-invoices absent<% } %>
</script>

<template>
  <QPagePadding class="row items-center justify-evenly">
    <!-- <% if (config.hasModule('finance-customers')) { %>•+ finance-customers -->
    <q-btn color="primary" @click="seedCustomers()">Seed Customers</q-btn>
    <br />
    <!-- •- /finance-customers<% } else { %>•! finance-customers absent<% } %> -->

    <!-- <% if (config.hasModule('finance-suppliers')) { %>•+ finance-suppliers -->
    <q-btn color="primary" @click="seedSuppliers()">Seed Suppliers</q-btn>
    <br />
    <!-- •- /finance-suppliers<% } else { %>•! finance-suppliers absent<% } %> -->

    <!-- <% if (config.hasModule('finance-finance-accounts')) { %>•+ finance-finance-accounts -->
    <q-btn color="primary" @click="seedFinanceAccounts(true)">
      Seed Finance Accounts Name as ID
    </q-btn>
    <q-btn color="primary" @click="seedFinanceAccounts(false)"> Seed Finance Accounts </q-btn>
    <br />
    <!-- •- /finance-finance-accounts<% } else { %>•! finance-finance-accounts absent<% } %> -->

    <!-- <% if (config.hasModule('finance-invoices')) { %>•+ finance-invoices -->
    <q-btn color="primary" @click="seedGeneralInvoices()"> Seed General Invoices </q-btn>
    <!-- •- /finance-invoices<% } else { %>•! finance-invoices absent<% } %> -->
  </QPagePadding>
</template>
