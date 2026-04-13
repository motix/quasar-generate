import type { Ref } from 'vue';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { QTree, QTreeNode } from 'quasar';
import { Dialog, Platform, uid } from 'quasar';

import { getDownloadURL, listAll, ref as storageRef } from 'firebase/storage';

import { cloneDeep, sortBy } from 'lodash-es';

import assignOptional from 'utils/assignOptional.js';

import type {
  Task,
  TaskFolder,
  TaskFolderVm,
  TasksContainer,
  TasksContainerVm,
  TaskVm,
} from 'models/tasks/index.js';

import { getStorage } from 'services/firebase.js';

import useCurrentMember from 'composables/<%= prompts.tasksNamespace %>/shared/useCurrentMember.js';
import useMemberOptions from 'composables/<%= prompts.tasksNamespace %>/shared/useMemberOptions.js';
import useEditorDependencies from 'composables/crud-pages/useEditorDependencies.js';
import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';
import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useTaskCalculator from 'composables/tasks/task/useTaskCalculator.js';
import useFormats from 'composables/useFormats.js';
import useScroll from 'composables/useScroll.js';

interface TaskNodeInfo {
  key: string;
  parentFolder: TaskFolder;
  folder?: TaskFolder;
  folderVm?: TaskFolderVm;
  task?: Task;
  taskVm?: TaskVm;
}

// Override `handler` to accept `QTreeNode` instead of `TaskNode` to get compatible with `QTree`'s `nodes` property.
type TaskNode = QTreeNode<
  TaskNodeInfo & { children: TaskNode[]; handler?: (node: QTreeNode) => void }
>;

function useParent<TParent extends TasksContainer, TParentVm extends TasksContainerVm>(
  $p: ViewPage<TParent, TParentVm, NonNullable<unknown>>,
) {
  // Data

  const routePathRoot = ref<string | null>(null);
  const storagePathRoot = ref<string | null>(null);

  // Computed

  const routePath = computed(() => {
    routePath.value === null &&
      (() => {
        throw new Error('routePath not specified');
      })();

    return `${routePathRoot.value}/${$p.m.value.urlFriendlyName}`;
  });

  const storagePath = computed(() => {
    storagePathRoot.value === null &&
      (() => {
        throw new Error('storagePathRoot not specified');
      })();

    return `${storagePathRoot.value}/${$p.m.value.urlFriendlyName}`;
  });

  return {
    routePathRoot,
    storagePathRoot,
    routePath,
    storagePath,
  };
}

const multiViewsData = reactive({
  viewType: Platform.is.desktop ? 'split' : ('single' as 'split' | 'single'),
});

function useMultiViews() {
  // Composables

  const scroll = useScroll();

  // Computed

  const isSplitView = computed(() => multiViewsData.viewType === 'split');
  const isSingleView = computed(() => multiViewsData.viewType === 'single');

  // Methods

  function switchView() {
    switch (multiViewsData.viewType) {
      case 'split':
        multiViewsData.viewType = 'single';
        break;
      case 'single':
        multiViewsData.viewType = 'split';
        break;
      default:
        throw new Error(`viewType '${String(multiViewsData.viewType)}' not implemented`);
    }
  }

  function switchViewAndScroll() {
    switchView();
    scroll.toTop();
  }

  return {
    isSplitView,
    isSingleView,
    switchView,
    switchViewAndScroll,
  };
}

function useSplitter() {
  // Private

  function onResize() {
    splitterHeight.value = window.innerHeight - 150;
  }

  // Data

  const splitterModel = ref(25);
  const splitterHeight = ref(window.innerHeight - 150);

  // Lifecycle Hooks

  onMounted(() => {
    window.addEventListener('resize', onResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', onResize);
  });

  return {
    splitterModel,
    splitterHeight,
  };
}

function useFilters() {
  // Composables

  const { authenticatedMember } = useCurrentMember();

  // Data

  const filterMyTasks = ref(false);

  // Computed

  const filtersApplied = computed(() => filterMyTasks.value);

  // Methods

  function filterTasks(tasks: Task[]) {
    return filtersApplied.value
      ? tasks.filter((task) =>
          filterMyTasks.value
            ? !!authenticatedMember.value &&
              (task.owner.id === authenticatedMember.value.id ||
                task.assignedTo.map((value) => value.id).includes(authenticatedMember.value.id))
            : true,
        )
      : tasks;
  }

  function filterTaskFolders(folders: TaskFolder[]): TaskFolder[] {
    return filtersApplied.value
      ? folders
          .map(
            (folder) =>
              ({
                ...folder,
                folders: filterTaskFolders(folder.folders),
                tasks: filterTasks(folder.tasks),
              }) as TaskFolder,
          )
          .filter((value) => value.folders.length > 0 || value.tasks.length > 0)
      : folders;
  }

  return {
    authenticatedMember,
    filterMyTasks,
    filtersApplied,
    filterTasks,
    filterTaskFolders,
  };
}

function useTree<TParent extends TasksContainer, TParentVm extends TasksContainerVm>(
  $p: ViewPage<
    TParent,
    TParentVm,
    ReturnType<typeof useParent<TParent, TParentVm>> &
      ReturnType<typeof useMultiViews> &
      ReturnType<typeof useFilters>
  >,
) {
  // Private

  function taskIcon(task: Task) {
    switch (task.statusHelper.statusName) {
      case 'new':
        return 'fal fa-bars-progress';
      case 'implemented':
        return 'fal fa-check-double';
      case 'tested':
        return 'fal fa-thumbs-up';
      case 'closed':
        return 'fal fa-circle-xmark';
      default: {
        const _exhaustiveCheck: never = task.statusHelper.statusName;
        return _exhaustiveCheck;
      }
    }
  }

  function taskFolderToNode(
    parentFolder: TaskFolder,
    folder: TaskFolder,
    folderVm?: TaskFolderVm,
  ): TaskNode {
    return assignOptional<TaskNode>(
      {
        key: folder.key,
        label: folder.name,
        icon: 'fal fa-folder-grid',
        children: sortBy(
          [
            ...folder.folders.map((value, index) =>
              taskFolderToNode(folder, value, folderVm?.folders[index]),
            ),
            ...folder.tasks.map((value, index) =>
              taskToNode(folder, value, folderVm?.tasks[index]),
            ),
          ],
          (value) => value.label,
        ),
        parentFolder,
        disabled: $p.editMode.value,
        folder,
      },
      {
        folderVm,
      },
    );
  }

  function taskToNode(parentFolder: TaskFolder, task: Task, taskVm?: TaskVm): TaskNode {
    return assignOptional<TaskNode>(
      {
        key: task.key,
        label: task.title,
        icon: taskIcon(task),
        iconColor: task.statusHelper.backgroundColor,
        children: [],
        parentFolder,
        disabled: $p.editMode.value,
        task,
      },
      {
        taskVm,
      },
    );
  }

  function flattenTaskNode(node: TaskNode): TaskNode[] {
    return [node, ...node.children.flatMap((value) => flattenTaskNode(value))];
  }

  function updatePath(newNodeKey: string | null) {
    const path = newNodeKey ? `${$p.routePath.value}/${newNodeKey}` : $p.routePath.value;

    route.meta.replaceRoute = true;
    void router.replace(path);
  }

  // Composables

  const router = useRouter();
  const route = useRoute();

  // Data

  const hasNodeDeleting = ref(true);

  const taskTree = ref<QTree | null>(null);
  const expandedNodeKeys = ref<string[]>([]);
  const selectedNodeKey = ref<string | null>(null);

  // Computed

  const taskNodes = computed(() =>
    $p.model.value
      ? sortBy(
          [
            ...$p
              .filterTaskFolders($p.m.value.tasks.folders)
              .map((value, index) =>
                taskFolderToNode($p.m.value.tasks, value, $p.viewModel.value?.tasks.folders[index]),
              ),
            ...$p
              .filterTasks($p.m.value.tasks.tasks)
              .map((value, index) =>
                taskToNode($p.m.value.tasks, value, $p.viewModel.value?.tasks.tasks[index]),
              ),
          ],
          (value) => value.label,
        )
      : [],
  );

  const flattenedTaskNodes = computed(() =>
    taskNodes.value.flatMap((value) => flattenTaskNode(value)),
  );

  const selectedNode = computed(() =>
    selectedNodeKey.value ? findNode(selectedNodeKey.value) : undefined,
  );

  const showDeleteSelectedNodeButton = computed(
    () => !$p.filtersApplied.value && hasNodeDeleting.value && !!selectedNodeKey.value,
  );

  // Methods

  function findNode(key: string) {
    return flattenedTaskNodes.value.find((value) => value.key === key);
  }

  function selectNode(key: string) {
    if (selectedNodeKey.value && findNode(key)?.parentFolder === selectedNode.value?.folder) {
      taskTree.value?.setExpanded(selectedNodeKey.value, true);
    }

    selectedNodeKey.value = key;
  }

  function selectNodeByRouteParams() {
    let key = (route.params['childKey'] as string) || null;

    if (!!key && !findNode(key)) {
      key = null;
      updatePath(null);
    }

    selectedNodeKey.value = key;
    expandToSelectedNode();
  }

  function expandToSelectedNode() {
    const keys: string[] = [];
    let selectedNodeValue = selectedNode.value;

    while (selectedNodeValue) {
      const parentKey = selectedNodeValue.parentFolder.key;

      selectedNodeValue = parentKey ? findNode(parentKey) : undefined;

      if (selectedNodeValue) {
        keys.push(selectedNodeValue.key);
      }
    }

    expandedNodeKeys.value.push(...keys);
  }

  function goToParent() {
    selectedNodeKey.value =
      selectedNode.value?.parentFolder === $p.m.value.tasks
        ? null
        : selectedNode.value?.parentFolder.key || null;
  }

  function removeSelectedNode() {
    if (!selectedNode.value || $p.filtersApplied.value) {
      return;
    }

    const selectedNodeValue = selectedNode.value;

    goToParent();

    selectedNodeValue.parentFolder.folders = selectedNodeValue.parentFolder.folders.filter(
      (value) => value !== selectedNodeValue.folder,
    );
    selectedNodeValue.parentFolder.tasks = selectedNodeValue.parentFolder.tasks.filter(
      (value) => value !== selectedNodeValue.task,
    );
  }

  function deleteSelectedNode() {
    Dialog.create({
      title: 'Delete',
      message: 'Are you sure want to delete the information?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      if (!selectedNodeKey.value || !selectedNode.value) {
        return;
      }

      $p.freezed.value = true;
      $p.muteRealtimeUpdate.value = true;
      $p.deleting.value = true;

      $p.exitEditMode();

      removeSelectedNode();

      $p.viewerSave()
        .catch(() => {
          $p.muteRealtimeUpdate.value = false;
        })
        .finally(() => {
          $p.deleting.value = false;
          $p.freezed.value = false;
        });
    });
  }

  // Watch

  watch(selectedNodeKey, (value, oldValue) => {
    if (value === oldValue || !$p.ready.value) {
      return;
    }

    updatePath(value);
  });

  watch($p.isSplitView, (value) => {
    if (value) {
      expandToSelectedNode();
    }
  });

  return {
    hasNodeDeleting,
    taskTree,
    expandedNodeKeys,
    selectedNodeKey,
    taskNodes,
    flattenedTaskNodes,
    selectedNode,
    showDeleteSelectedNodeButton,
    findNode,
    selectNode,
    selectNodeByRouteParams,
    expandToSelectedNode,
    goToParent,
    removeSelectedNode,
    deleteSelectedNode,
  };
}

function useAttachments<TParent extends TasksContainer, TParentVm extends TasksContainerVm>(
  $p: ViewPage<TParent, TParentVm, ReturnType<typeof useParent<TParent, TParentVm>>>,
) {
  // Composables

  const storage = getStorage();

  // Methods

  async function getTaskAttachments(key: string) {
    const rootRef = storageRef(storage, `${$p.storagePath.value}/${key}`);
    const result = await listAll(rootRef);
    const urls = await Promise.all(
      result.prefixes.map(async (prefix) => {
        const itemResult = await listAll(prefix);
        // See `uploadImages` in `useRichEditor`, each image is placed inside 1 unique folder.
        const url = await getDownloadURL(itemResult.items[0]!);

        return url;
      }),
    );

    return urls;
  }

  function taskAttachmentInUsed(task: Task, url: string) {
    url = url.substring(0, url.indexOf('&token='));

    return task.content.includes(url) || task.comments.some((value) => value.content.includes(url));
  }

  return {
    getTaskAttachments,
    taskAttachmentInUsed,
  };
}

function useClipboard<TParent extends TasksContainer, TParentVm extends TasksContainerVm>(
  $p: ViewPage<
    TParent,
    TParentVm,
    ReturnType<typeof useParent<TParent, TParentVm>> &
      ReturnType<typeof useTree<TParent, TParentVm>>
  >,
) {
  // Private

  const taskFolderClipboard = ref(null) as Ref<TaskFolder | null>;
  const taskClipboard = ref(null) as Ref<Task | null>;

  function renewFolderKeys(folder: TaskFolder) {
    folder.key = uid();
    folder.folders.forEach((value) => {
      renewFolderKeys(value);
    });
    folder.tasks.forEach((value) => {
      value.key = uid();
    });
  }

  // Computed

  const copyButtonEnabled = computed(() => !$p.editMode.value && !!$p.selectedNode.value);
  const cutButtonEnabled = computed(() => !$p.editMode.value && !!$p.selectedNode.value);
  const pasteButtonEnabled = computed(
    () =>
      !$p.editMode.value &&
      !$p.selectedNode.value?.task &&
      (!!taskFolderClipboard.value || !!taskClipboard.value),
  );

  // Methods

  function copySelectedNode() {
    if ($p.editMode.value) {
      return;
    }

    if ($p.selectedNode.value?.folder) {
      taskFolderClipboard.value = cloneDeep($p.selectedNode.value.folder);
      renewFolderKeys(taskFolderClipboard.value);
    } else {
      taskFolderClipboard.value = null;
    }

    if ($p.selectedNode.value?.task) {
      taskClipboard.value = cloneDeep($p.selectedNode.value.task);
      taskClipboard.value.key = uid();
    } else {
      taskClipboard.value = null;
    }
  }

  function cutSelectedNode() {
    if ($p.editMode.value) {
      return;
    }

    copySelectedNode();
    $p.removeSelectedNode();
  }

  function paste() {
    if ($p.editMode.value || !!$p.selectedNode.value?.task) {
      return;
    }

    if (taskFolderClipboard.value) {
      const list = $p.selectedNode.value?.folder
        ? $p.selectedNode.value.folder.folders
        : $p.m.value.tasks.folders;
      const folder = cloneDeep(taskFolderClipboard.value);
      let suffix = 0;
      let folderName = folder.name;

      renewFolderKeys(folder);

      while (list.some((value) => value.name === folderName)) {
        suffix++;
        folderName = `${folder.name}-${suffix}`;
      }

      folder.name = folderName;
      list.push(folder);

      void $p.viewerSave();

      taskFolderClipboard.value = null;
    }

    if (taskClipboard.value) {
      const list = $p.selectedNode.value?.folder
        ? $p.selectedNode.value.folder.tasks
        : $p.m.value.tasks.tasks;
      const task = cloneDeep(taskClipboard.value);
      let suffix = 0;
      let taskTitle = task.title;

      task.key = uid();

      while (list.some((value) => value.title === taskTitle)) {
        suffix++;
        taskTitle = `${task.title}-${suffix}`;
      }

      task.title = taskTitle;
      list.push(task);

      void $p.viewerSave();

      taskClipboard.value = null;
    }
  }

  return {
    copyButtonEnabled,
    cutButtonEnabled,
    pasteButtonEnabled,
    copySelectedNode,
    cutSelectedNode,
    paste,
  };
}

function useTasksViewPageExtra(editMode: undefined | ViewPage<never, never>['editMode']) {
  // Composables

  const f = useFormats();

  const mc = useTaskCalculator();

  const { editorReady, editorDependenciesStores } = useEditorDependencies(editMode);

  const { memberOptions, membersEditorDependenciesStore, members, filterMemberOptions } =
    useMemberOptions();

  // Private Executions

  editorDependenciesStores.value = [membersEditorDependenciesStore];

  // Methods

  function findLastImplementAction(task: Task) {
    return [...task.comments].reverse().find((value) => value.action === 'implement');
  }

  function findLastTestAction(task: Task) {
    return [...task.comments].reverse().find((value) => value.action === 'test');
  }

  function findLastCloseAction(task: Task) {
    return [...task.comments].reverse().find((value) => value.action === 'close');
  }

  return {
    f,
    mc,
    editorReady,
    editorDependenciesStores,
    memberOptions,
    members,
    filterMemberOptions,
    findLastImplementAction,
    findLastTestAction,
    findLastCloseAction,
  };
}

export default function useTasksViewPage<
  TParent extends TasksContainer,
  TParentVm extends TasksContainerVm,
>(scopeName: string, hitUseCount?: boolean) {
  type AllExtras = ReturnType<typeof useParent<TParent, TParentVm>> &
    ReturnType<typeof useMultiViews> &
    ReturnType<typeof useSplitter> &
    ReturnType<typeof useFilters> &
    ReturnType<typeof useTree<TParent, TParentVm>> &
    ReturnType<typeof useAttachments<TParent, TParentVm>> &
    ReturnType<typeof useClipboard<TParent, TParentVm>> &
    ReturnType<typeof useTasksViewPageExtra>;

  // Composables

  const $p = useViewPage<TParent, TParentVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    Object.assign($p, useParent($p));
    Object.assign($p, useMultiViews());
    Object.assign($p, useSplitter());
    Object.assign($p, useFilters());
    Object.assign($p, useTree<TParent, TParentVm>($p));
    Object.assign($p, useAttachments<TParent, TParentVm>($p));
    Object.assign($p, useClipboard<TParent, TParentVm>($p));
    Object.assign($p, useTasksViewPageExtra($p.editMode));

    $p.extraInitialized.value = true;
  }

  return $p;
}

class UseTasksViewPageHelper<TParent extends TasksContainer, TParentVm extends TasksContainerVm> {
  Return = useTasksViewPage<TParent, TParentVm>('');
}

export type TasksViewPage<
  TParent extends TasksContainer,
  TParentVm extends TasksContainerVm,
> = UseTasksViewPageHelper<TParent, TParentVm>['Return'];
