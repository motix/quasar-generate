import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { TodoAm as Todo } from 'models/production/index.js';

export const todosNormalization = onDocumentWritten(
  'production_todos/{id}',
  (event) =>
    !!event.data && docNormalization<Todo>(event.data.before, event.data.after, 'name', 'name'),
);
