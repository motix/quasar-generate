import type { Timestamp } from 'firebase/firestore';

import type { MemberLite } from 'models/<%= prompts.tasksNamespace %>/index.js';

// Models

export type { MemberLite };

export interface TasksContainer {
  urlFriendlyName: string;
  tasks: TaskFolder;
}

export interface TaskFolder {
  key: string;
  name: string;

  // Map
  folders: TaskFolder[];
  tasks: Task[];
}

export interface Task {
  key: string;
  createDate: Date;
  title: string;
  content: string;
  isImplemented: boolean;
  isTested: boolean;
  isClosed: boolean;

  // Map
  owner: MemberLite;
  assignedTo: MemberLite[];
  comments: TaskComment[];
}

export interface TaskComment {
  createDate: Date;
  action: 'comment' | 'implement' | 'test' | 'reject' | 'close' | 'reopen';
  content: string;

  // Map
  member: MemberLite;
}

// View Models

export interface TasksContainerVm extends Omit<TasksContainer, 'tasks'> {
  tasks: TaskFolderVm;
}

export interface TaskFolderVm extends Omit<TaskFolder, 'folders' | 'tasks'> {
  // Map
  folders: TaskFolderVm[];
  tasks: TaskVm[];
}

export interface TaskVm extends Omit<Task, 'createDate' | 'owner' | 'comments' | 'statusHelper'> {
  createDate: string;

  // Map
  owner?: MemberLite;
  comments: TaskCommentVm[];
}

export interface TaskCommentVm extends Omit<TaskComment, 'createDate' | 'member'> {
  createDate: string;

  // Map
  member?: MemberLite;
}

// API Models

export interface TaskFolderAm extends Omit<TaskFolder, 'folders' | 'tasks'> {
  // Map
  folders: TaskFolderAm[];
  tasks: TaskAm[];
}

export interface TaskAm extends Omit<Task, 'createDate' | 'comments' | 'statusHelper'> {
  createDate: Timestamp;

  // Map
  comments: TaskCommentAm[];
}

export interface TaskCommentAm extends Omit<TaskComment, 'createDate'> {
  createDate: Timestamp;
}
