import type { MappingProfile } from '@automapper/core';
import { afterMap } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';
import PayrollStatus from 'utils/hr/payroll/PayrollStatus.js';

import type { Payroll, PayrollAm, PayrollVm } from 'models/hr/index.js';

const payrollBase: MapperMetadata<Payroll> = {
  code: String,
  year: Number,
  month: Number,
  isCompleted: Boolean,
  isApproved: Boolean,
  isRejected: Boolean,
  isCancelled: Boolean,
  socialInsurancePercent: Number,
  unionDuesPercent: Number,
  workingDays: Number,
};

PojosMetadataMap.create<Payroll>('Payroll', {
  ...payrollBase,

  id: String,

  details: ['PayrollDetail'],
});

PojosMetadataMap.create<PayrollVm>('PayrollVm', {
  ...payrollBase,

  id: String,

  details: ['PayrollDetailVm'],
});

PojosMetadataMap.create<PayrollAm>('PayrollAm', {
  ...payrollBase,

  details: ['PayrollDetailAm'],
});

const fieldTypes: Partial<Record<keyof Payroll & keyof PayrollVm & keyof PayrollAm, FieldConfig>> =
  {
    year: { dataType: 'number', fieldType: 'required' },
    month: { dataType: 'number', fieldType: 'required' },
    socialInsurancePercent: { dataType: 'number', fieldType: 'required' },
    unionDuesPercent: { dataType: 'number', fieldType: 'required' },
    workingDays: { dataType: 'number', fieldType: 'required' },
  };

const payrollProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Payroll, PayrollVm, PayrollAm>(
    mapper,
    'Payroll',
    'PayrollVm',
    'PayrollAm',
    fieldTypes,
    {
      apiModelToModel: [
        afterMap((_, d) => {
          d.statusHelper = new PayrollStatus(d, []);
        }),
      ],
      modelToViewModel: [
        afterMap((_, d) => {
          d.statusHelper = new PayrollStatus(d, []);
        }),
      ],
    },
  );
};

export default payrollProfile;
