import { sortBy, uniqBy } from 'lodash-es';

import type { ProductionSalary as HrProductionSalary } from 'models/hr/index.js';
import type { ProjectAm as ProductionProject } from 'models/production/index.js';

import useProjectCalculator from 'composables/production/project/useProjectCalculator.js';

export default function generateProductionSalaries(project: ProductionProject) {
  const amc = useProjectCalculator<ProductionProject>();

  let members = project.items.flatMap((item) =>
    item.contributions.flatMap((contribution) => contribution.member),
  );

  members = uniqBy(members, (value) => value.id);
  members = sortBy(members, (value) => value.id);

  const productionSalaries = members.map((member) => {
    const productionSalary: HrProductionSalary = {
      amount: amc.projectTotalProductionSalary(project, member),
      member: {
        id: member.id,
        fullName: member.fullName,
      },
    };

    return productionSalary;
  });

  return productionSalaries;
}
