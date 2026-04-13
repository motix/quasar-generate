import type { Timestamp } from 'firebase/firestore';

import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';
import type { MemberLite } from 'models/production/index.js';
import type { TaskFolder, TaskFolderAm, TaskFolderVm } from 'models/tasks/index.js';

// Models

export interface Todo extends DocModel {
  isPrivate: boolean;
  isArchived: boolean;
  name: string;
  urlFriendlyName: string;
  createDate: Date;
  dueDate: Date;

  // Map
  owner: MemberLite;
  tasks: TaskFolder;
}

// View Models

export interface TodoVm extends Omit<
  DocViewModel<Todo>,
  'createDate' | 'dueDate' | 'owner' | 'tasks'
> {
  createDate: string;
  dueDate: string;

  // Map
  owner?: MemberLite;
  tasks: TaskFolderVm;
}

// API Models

export interface TodoAm extends Omit<DocApiModel<Todo>, 'createDate' | 'dueDate' | 'tasks'> {
  createDate: Timestamp;
  dueDate: Timestamp;

  // Map
  tasks: TaskFolderAm;
}
