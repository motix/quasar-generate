import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Member, MemberAm, MemberVm } from 'models/hr/index.js';

const memberBase: MapperMetadata<Member> = {
  isActive: Boolean,
  email: String,
  fullName: String,
  photoUrl: String,
  isIncludedInPayroll: Boolean,
  baseSalary: Number,
  socialInsuranceSalary: Number,
  personalIncomeTax: Number,
  payUnionDues: Boolean,
  bankAccountNumber: String,
  bankName: String,
};

PojosMetadataMap.create<Member>('Member', {
  ...memberBase,

  id: String,
  startDate: Date,
  contractStartDate: Date,
  contractExpiration: Date,
});

PojosMetadataMap.create<MemberVm>('MemberVm', {
  ...memberBase,

  id: String,
  startDate: String,
  contractStartDate: String,
  contractExpiration: String,
});

PojosMetadataMap.create<MemberAm>('MemberAm', {
  ...memberBase,

  startDate: Timestamp,
  contractStartDate: Timestamp,
  contractExpiration: Timestamp,
});

const fieldTypes: Partial<Record<keyof Member, FieldConfig>> = {
  startDate: { dataType: 'date', fieldType: 'readOptionalWriteRequired' },
  contractStartDate: { dataType: 'date', fieldType: 'optional' },
  contractExpiration: { dataType: 'date', fieldType: 'optional' },
  baseSalary: { dataType: 'number', fieldType: 'optional' },
  socialInsuranceSalary: { dataType: 'number', fieldType: 'optional' },
  personalIncomeTax: { dataType: 'number', fieldType: 'optional' },
  bankAccountNumber: { dataType: 'string', fieldType: 'optional' },
  bankName: { dataType: 'string', fieldType: 'optional' },
};

const memberProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Member, MemberVm, MemberAm>(
    mapper,
    'Member',
    'MemberVm',
    'MemberAm',
    fieldTypes,
  );
};

export default memberProfile;
