import type { MappingProfile } from '@automapper/core';
import { afterMap } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { extendMapping } from 'utils/automapper.js';
import QuotationStatus from 'utils/finance/Quotation/QuotationStatus.js';

import type { Project, ProjectAm, ProjectVm } from 'models/finance/index.js';

PojosMetadataMap.create<Project>('Project', {
  quotations: ['Quotation'],
});

PojosMetadataMap.create<ProjectVm>('ProjectVm', {
  quotations: ['QuotationVm'],
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  quotations: ['QuotationAm'],
});

const projectProfile: MappingProfile = (mapper) => {
  extendMapping<ProjectAm, Project>(
    mapper,
    'ProjectAm',
    'Project',
    afterMap((_, d) => {
      d.quotations.forEach((quotation) => {
        quotation.statusHelper = new QuotationStatus(quotation, []);
      });
    }),
  );

  extendMapping<Project, ProjectVm>(
    mapper,
    'Project',
    'ProjectVm',
    afterMap((_, d) => {
      d.quotations.forEach((quotation) => {
        quotation.statusHelper = new QuotationStatus(quotation, []);
      });
    }),
  );
};

export default projectProfile;
