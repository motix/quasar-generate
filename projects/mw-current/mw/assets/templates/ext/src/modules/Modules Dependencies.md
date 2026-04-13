# Modules Dependencies

### Shared

1. `shared-print-layout`
2. `shared-tasks`  
   🔗 `MemberLite` definition and `useCurrentMember`, `useMemberOptions` implementation
3. `shared-generate-code`
4. `shared-documentation`

### Portal

1. `portal-app`

### Admin

1. `admin-membership`
2. `admin-slack`
3. `admin-health`
4. `admin-app`

### HR

1. `hr-team`
2. `hr-payrolls  `  
   🔗 `shared-print-layout`, `shared-generate-code`,  
   🔗 `hr-team`
3. `hr-app`

### Production

1. `production-production-roles`
2. `production-product-types`  
   🔗 `production-production-roles`
3. `production-team`  
   🔗 `production-production-roles`
4. `production-customers`
5. `production-projects`  
   🔗 `production-production-roles`, `production-product-types`,  
   🔗 `production-team`, `production-customers`
6. `production-timesheets`  
   🔗 `shared-print-layout`,  
   🔗 `production-production-roles`, `production-product-types`,  
   🔗 `production-team`, `production-customers`,  
   🔗 `production-projects`
7. `production-todos`  
   🔗 `shared-tasks`
8. `production-project-tasks`  
   🔗 `shared-tasks`,  
   🔗 `production-production-roles`, `production-product-types`,  
   🔗 `production-team`, `production-customers`,  
   🔗 `production-projects`
9. `production-app`

### Finance

1. `finance-customers`
2. `finance-suppliers`
3. `finance-finance-accounts`
4. `finance-projects`  
   🔗 `finance-customers`
5. `finance-quotations`  
   🔗 `shared-print-layout`, `shared-generate-code`,  
   🔗 `finance-customers`, `finance-projects`
6. `finance-transactions`  
   🔗 `shared-generate-code`,  
   🔗 `finance-finance-accounts`
7. `finance-invoices`  
   🔗 `shared-generate-code`,  
   🔗 `finance-customers`, `finance-finance-accounts`,  
   🔗 `finance-transactions`
8. `finance-invoice-groups`  
   🔗 `shared-generate-code`,  
   🔗 `finance-customers`, `finance-finance-accounts`,  
   🔗 `finance-transactions`,  
   🔗 `finance-invoices`
9. `finance-expenses`  
   🔗 `shared-generate-code`,  
   🔗 `finance-suppliers`, `finance-finance-accounts`,  
   🔗 `finance-transactions`
10. `finance-expense-groups`  
    🔗 `shared-generate-code`,  
    🔗 `finance-suppliers`, `finance-finance-accounts`,  
    🔗 `finance-transactions`,  
    🔗 `finance-expenses`
11. `finance-project-invoices-expenses-support`  
    🔗 `shared-generate-code`,  
    🔗 `finance-customers`, `finance-finance-accounts`,  
    🔗 `finance-projects`,  
    🔗 `finance-transactions`
12. `finance-project-invoices`  
    🔗 `shared-generate-code`,  
    🔗 `finance-customers`, `finance-finance-accounts`,  
    🔗 `finance-projects`, `finance-quotations`,  
    🔗 `finance-transactions`,  
    🔗 `finance-invoices`, `finance-project-invoices-expenses-support`
13. `finance-project-invoice-groups`  
    🔗 `shared-generate-code`,  
    🔗 `finance-customers`, `finance-finance-accounts`,  
    🔗 `finance-projects`, `finance-quotations`,  
    🔗 `finance-transactions`,  
    🔗 `finance-invoices`, `finance-project-invoices-expenses-support`, `finance-project-invoices`, `finance-invoice-groups`
14. `finance-project-expenses`  
    🔗 `shared-generate-code`,  
    🔗 `finance-customers`, `finance-suppliers`, `finance-finance-accounts`,  
    🔗 `finance-projects`,  
    🔗 `finance-transactions`,  
    🔗 `finance-expenses`, `finance-project-invoices-expenses-support`
15. `finance-project-expense-groups`  
    🔗 `shared-generate-code`,  
    🔗 `finance-customers`, `finance-suppliers`, `finance-finance-accounts`,  
    🔗 `finance-projects`,  
    🔗 `finance-transactions`,  
    🔗 `finance-expenses`, `finance-project-invoices-expenses-support`, `finance-project-expenses`, `finance-expense-groups`
16. `finance-project-transactions`  
    🔗 `shared-generate-code`,  
    🔗 `finance-customers`, `finance-suppliers`, `finance-finance-accounts`,  
    🔗 `finance-projects`, `finance-quotations`,
    🔗 `finance-transactions`,
    🔗 `finance-invoices`, `finance-expenses`, `finance-project-invoices-expenses-support`,  
    🔗 `finance-project-invoices`, `finance-project-expenses`
17. `finance-sales-contracts`  
    🔗 `finance-customers`, `finance-finance-accounts`,  
    🔗 `finance-projects`, `finance-quotations`,  
    🔗 `finance-transactions`,  
    🔗 `finance-invoices`, `finance-project-invoices-expenses-support`,  
    🔗 `finance-project-invoices`
18. `finance-project-messages`  
    🔗 `finance-customers`
    🔗 `finance-projects`,
19. `finance-team`
20. `finance-todos`  
    🔗 `shared-tasks`,  
    🔗 `finance-team`
21. `finance-project-tasks`  
    🔗 `shared-tasks`,
    🔗 `finance-team`,  
    🔗 `finance-customers`, `production-projects`
22. `finance-help`  
    🔗 `shared-documentation`
23. `finance-app`

### Reports

1. `reports-customers`
2. `reports-suppliers`
3. `reports-finance-accounts`
4. `reports-projects`
5. `reports-invoices`
6. `reports-expenses`
7. `reports-finance-details`
8. `reports-receivable  `  
   🔗 `reports-projects` (`useProjectCalculator`)
9. `reports-payable  `  
   🔗 `reports-projects` (`useProjectCalculator`)
10. `reports-sales-vat-invoices`
11. `reports-app`
