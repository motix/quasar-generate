// sort-imports-ignore

import { useCustomersStore } from 'stores/production/Customers.js';
import { useMembersStore } from 'stores/production/Members.js';
import { useProjectsStore } from 'stores/production/Projects.js';

// <% if (config.hasModule('production-project-tasks')) { %>•+ production-project-tasks
import { uid } from 'quasar';

import TaskStatus from 'utils/tasks/Task/TaskStatus.js';

import type { TaskVm } from 'models/tasks/index.js';
// •- /production-project-tasks<% } else { %>•! production-project-tasks absent<% } %>

export function seedProjects() {
  const store = useProjectsStore();
  const memberStore = useMembersStore();
  const customerStore = useCustomersStore();
  void memberStore.loadDocsPage({
    page: 0,
    queryConstraints: [],
    done: () => {
      void customerStore.loadDocsPage({
        page: 0,
        queryConstraints: [],
        done: () => {
          void store.createDoc({
            doc: {
              isPrivate: false,
              isArchived: false,
              name: 'Vietcombank - Hội Diễn Nét Đẹp Văn Hoá Ngành Ngân Hàng 2021',
              urlFriendlyName: 'vcb',
              customerContact: 'Mr. T (000999)',
              startDate: '10022022',
              finishDate: '11112022',
              description: 'Long name project',
              owner: {
                id: memberStore.docs[0]!.id,
                fullName: memberStore.docs[0]!.fullName,
              },
              customer: {
                id: customerStore.docs[0]!.id,
                code: customerStore.docs[0]!.code,
                name: customerStore.docs[0]!.name,
              },
              items: [
                {
                  title: 'Múa mở màn',
                  number: '1',
                  description: 'Múa tương tác',
                  quantity: 1,
                  productType: {
                    id: 'man-hinh-cho',
                    name: 'Màn hình chờ',
                  },
                  contributions: [
                    {
                      productionSalaryBase: 1000000,
                      involvement: 1,
                      priceFactor: 1,
                      member: {
                        id: memberStore.docs[1]!.id,
                        fullName: memberStore.docs[1]!.fullName,
                      },
                      productionRole: {
                        id: 'account',
                        name: 'Account',
                      },
                    },
                  ],
                },
              ],
              // <% if (config.hasModule('production-project-tasks')) { %>•+ production-project-tasks
              tasks: {
                key: 'root',
                name: 'Root',
                folders: [
                  {
                    key: uid(),
                    name: 'Group 1',
                    folders: [],
                    tasks: [
                      {
                        key: uid(),
                        createDate: '10022023',
                        title: 'Task 1',
                        content: 'Creative works for storyboard',
                        isImplemented: false,
                        isTested: false,
                        isClosed: false,
                        owner: {
                          id: memberStore.docs[0]!.id,
                          fullName: memberStore.docs[0]!.fullName,
                        },
                        assignedTo: [],
                        comments: [],
                        statusHelper: new TaskStatus({} as TaskVm, []),
                      },
                      {
                        key: uid(),
                        createDate: '10022023',
                        title: 'Task 2',
                        content: 'Creative works for storyboard',
                        isImplemented: false,
                        isTested: false,
                        isClosed: false,
                        owner: {
                          id: memberStore.docs[0]!.id,
                          fullName: memberStore.docs[0]!.fullName,
                        },
                        assignedTo: [],
                        comments: [],
                        statusHelper: new TaskStatus({} as TaskVm, []),
                      },
                    ],
                  },
                  {
                    key: uid(),
                    name: 'Group 2',
                    folders: [],
                    tasks: [
                      {
                        key: uid(),
                        createDate: '10022023',
                        title: 'Task 1',
                        content: 'Creative works for storyboard',
                        isImplemented: false,
                        isTested: false,
                        isClosed: false,
                        owner: {
                          id: memberStore.docs[0]!.id,
                          fullName: memberStore.docs[0]!.fullName,
                        },
                        assignedTo: [],
                        comments: [],
                        statusHelper: new TaskStatus({} as TaskVm, []),
                      },
                      {
                        key: uid(),
                        createDate: '10022023',
                        title: 'Task 2',
                        content: 'Creative works for storyboard',
                        isImplemented: false,
                        isTested: false,
                        isClosed: false,
                        owner: {
                          id: memberStore.docs[0]!.id,
                          fullName: memberStore.docs[0]!.fullName,
                        },
                        assignedTo: [],
                        comments: [],
                        statusHelper: new TaskStatus({} as TaskVm, []),
                      },
                    ],
                  },
                ],
                tasks: [
                  {
                    key: uid(),
                    createDate: '10022023',
                    title: 'Creative',
                    content: 'Creative works for storyboard',
                    isImplemented: true,
                    isTested: true,
                    isClosed: true,
                    owner: {
                      id: memberStore.docs[0]!.id,
                      fullName: memberStore.docs[0]!.fullName,
                    },
                    assignedTo: [
                      {
                        id: memberStore.docs[1]!.id,
                        fullName: memberStore.docs[1]!.fullName,
                      },
                      {
                        id: memberStore.docs[2]!.id,
                        fullName: memberStore.docs[2]!.fullName,
                      },
                    ],
                    comments: [
                      {
                        createDate: '10022023',
                        action: 'comment',
                        content: 'Comment 1',
                        member: {
                          id: memberStore.docs[1]!.id,
                          fullName: memberStore.docs[1]!.fullName,
                        },
                      },
                      {
                        createDate: '10022023',
                        action: 'implement',
                        content: 'Implement 1',
                        member: {
                          id: memberStore.docs[1]!.id,
                          fullName: memberStore.docs[1]!.fullName,
                        },
                      },
                      {
                        createDate: '10022023',
                        action: 'test',
                        content: 'Test 1',
                        member: {
                          id: memberStore.docs[0]!.id,
                          fullName: memberStore.docs[0]!.fullName,
                        },
                      },
                      {
                        createDate: '10022023',
                        action: 'reject',
                        content: 'Reject 1',
                        member: {
                          id: memberStore.docs[0]!.id,
                          fullName: memberStore.docs[0]!.fullName,
                        },
                      },
                      {
                        createDate: '10022023',
                        action: 'close',
                        content: 'Close 1',
                        member: {
                          id: memberStore.docs[0]!.id,
                          fullName: memberStore.docs[0]!.fullName,
                        },
                      },
                      {
                        createDate: '10022023',
                        action: 'reopen',
                        content: 'Re-open 1',
                        member: {
                          id: memberStore.docs[0]!.id,
                          fullName: memberStore.docs[0]!.fullName,
                        },
                      },
                    ],
                    statusHelper: new TaskStatus({} as TaskVm, []),
                  },
                ],
              },
              // •- /production-project-tasks<% } else { %>•! production-project-tasks absent<% } %>
            },
          });
        },
      });
    },
  });
}
