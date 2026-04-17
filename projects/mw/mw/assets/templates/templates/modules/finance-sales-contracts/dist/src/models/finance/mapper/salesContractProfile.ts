import type { MappingProfile } from '@automapper/core';
import { afterMap, forMember, mapFrom } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';
import SalesContractStatus from 'utils/finance/SalesContract/SalesContractStatus.js';

import type { SalesContract, SalesContractAm, SalesContractVm } from 'models/finance/index.js';

const salesContractBase: MapperMetadata<SalesContract> = {
  isArchived: Boolean,
  code: String,
  urlFriendlyCode: String,
  isCancelled: Boolean,
  content: String,
  subTotal: Number,
  arising: Number,
  vatPercent: Number,
  secondVatPercent: Number,
  secondVatableAmount: Number,
  vatAdjustment: Number,
  notes: String,

  customer: 'CustomerLite',

  vatInvoiceIssueDateLength: Number,
};

PojosMetadataMap.create<SalesContract>('SalesContract', {
  ...salesContractBase,

  id: String,
  signDate: Date,
  unavailableProjectIds: [String],
  unavailableGeneralInvoiceIds: [String],

  vatInvoices: ['VatInvoice'],

  firstVatInvoiceIssueDate: Date,
});

PojosMetadataMap.create<SalesContractVm>('SalesContractVm', {
  ...salesContractBase,

  id: String,
  signDate: String,

  vatInvoices: ['VatInvoiceVm'],

  firstVatInvoiceIssueDate: String,
});

PojosMetadataMap.create<SalesContractAm>('SalesContractAm', {
  ...salesContractBase,

  signDate: Timestamp,

  vatInvoices: ['VatInvoiceAm'],

  firstVatInvoiceIssueDate: Timestamp,
});

const fieldTypes: Partial<
  Record<keyof SalesContract & keyof SalesContractVm & keyof SalesContractAm, FieldConfig>
> = {
  signDate: { dataType: 'date', fieldType: 'required' },
  subTotal: { dataType: 'number', fieldType: 'required' },
  arising: { dataType: 'number', fieldType: 'optional' },
  vatPercent: { dataType: 'number', fieldType: 'optional' },
  secondVatPercent: { dataType: 'number', fieldType: 'optional' },
  secondVatableAmount: { dataType: 'number', fieldType: 'optional' },
  vatAdjustment: { dataType: 'number', fieldType: 'optional' },
  notes: { dataType: 'string', fieldType: 'optional' },
  customer: { dataType: 'asIs', fieldType: 'required' },
  firstVatInvoiceIssueDate: { dataType: 'date', fieldType: 'optional' },
  vatInvoiceIssueDateLength: { dataType: 'number', fieldType: 'optional' },
};

const salesContractProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<SalesContract, SalesContractVm, SalesContractAm>(
    mapper,
    'SalesContract',
    'SalesContractVm',
    'SalesContractAm',
    fieldTypes,
    {
      apiModelToModel: [
        forMember(
          (d) => d.unavailableProjectIds,
          mapFrom((s) =>
            s.projectIds.filter(
              (value) => !s.loadedProjects.some((project) => project.id === value),
            ),
          ),
        ),
        forMember(
          (d) => d.unavailableGeneralInvoiceIds,
          mapFrom((s) =>
            s.generalInvoiceIds.filter(
              (value) => !s.loadedGeneralInvoices.some((invoice) => invoice.id === value),
            ),
          ),
        ),
        forMember(
          (d) => d.projects,
          mapFrom((s) => [...s.loadedProjects]),
        ),
        forMember(
          (d) => d.generalInvoices,
          mapFrom((s) => [...s.loadedGeneralInvoices]),
        ),
        afterMap((_, d) => {
          d.statusHelper = new SalesContractStatus(d, []);
        }),
      ],
      modelToViewModel: [
        forMember(
          (d) => d.projects,
          mapFrom((s) => [...s.projects]),
        ),
        forMember(
          (d) => d.generalInvoices,
          mapFrom((s) => [...s.generalInvoices]),
        ),
        afterMap((_, d) => {
          d.statusHelper = new SalesContractStatus(d, []);
        }),
      ],
      modelToApiModel: [
        forMember(
          (d) => d.projectIds,
          mapFrom((s) => s.projects.map((value) => value.id)),
        ),
        forMember(
          (d) => d.generalInvoiceIds,
          mapFrom((s) => s.generalInvoices.map((value) => value.id)),
        ),
      ],
      viewModelToApiModel: [
        forMember(
          (d) => d.projectIds,
          mapFrom((s) => s.projects.map((value) => value.id)),
        ),
        forMember(
          (d) => d.generalInvoiceIds,
          mapFrom((s) => s.generalInvoices.map((value) => value.id)),
        ),
      ],
    },
  );
};

export default salesContractProfile;
