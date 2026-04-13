import assignOptional from 'utils/assignOptional.js';

import type { ProductionRoleVm } from 'models/production/index.js';

import type { CreateDocActionPayload } from 'stores/firebase-firestore/index.js';
import { useProductionRolesStore } from 'stores/production/ProductionRoles.js';

export function seedProductionRoles(nameAsId: boolean) {
  const store = useProductionRolesStore();
  const names = ['Account', 'Art', '3D Motion', '3D Main Model', '2D Motion'];

  names.forEach(
    (name, index) =>
      void store.createDoc(
        assignOptional<CreateDocActionPayload<ProductionRoleVm>>(
          {
            doc: {
              isActive: true,
              name,
              position: index + 1,
            },
          },
          {
            idField: nameAsId ? 'name' : undefined,
          },
        ),
      ),
  );

  store.recentlyAddedDocs = [];
}
