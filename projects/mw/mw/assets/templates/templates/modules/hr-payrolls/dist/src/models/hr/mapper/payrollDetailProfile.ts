import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { PayrollDetail, PayrollDetailAm, PayrollDetailVm } from 'models/hr/index.js';

const payrollDetailBase: MapperMetadata<PayrollDetail> = {
  fullName: String,
  baseSalary: Number,
  productionSalary: Number,
  workingDays: Number,
  bonus: Number,
  socialInsuranceSalary: Number,
  personalIncomeTax: Number,
  payUnionDues: Boolean,
  adjustment: Number,
};

PojosMetadataMap.create<PayrollDetail>('PayrollDetail', payrollDetailBase);

PojosMetadataMap.create<PayrollDetailVm>('PayrollDetailVm', payrollDetailBase);

PojosMetadataMap.create<PayrollDetailAm>('PayrollDetailAm', payrollDetailBase);

const fieldTypes: Partial<Record<keyof PayrollDetail & keyof PayrollDetailVm, FieldConfig>> = {
  workingDays: { dataType: 'number', fieldType: 'required' },
  bonus: { dataType: 'number', fieldType: 'required' },
  personalIncomeTax: { dataType: 'number', fieldType: 'required' },
  adjustment: { dataType: 'number', fieldType: 'required' },
};

const payrollDetailProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<PayrollDetail, PayrollDetailVm, PayrollDetailAm>(
    mapper,
    'PayrollDetail',
    'PayrollDetailVm',
    'PayrollDetailAm',
    fieldTypes,
  );
};

export default payrollDetailProfile;
