<script setup lang="ts">
import { computed, ref } from 'vue';

import { Dark } from 'quasar';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import StatusBadge from 'components/shared/document-status/StatusBadge.vue';
import TaskAssignedTo from 'components/Task/TaskAssignedTo.vue';

import NewTask from './NewTask.vue';
import NewTaskComment from './NewTaskComment.vue';
import NewTaskFolder from './NewTaskFolder.vue';
import TaskAttachments from './TaskAttachments.vue';
import TaskComments from './TaskComments.vue';

// Private

function loadThumbnail(node: (typeof $p.taskNodes.value)[number]) {
  !!node.task &&
    $p
      .getTaskAttachments(node.key)
      .then((attachments) => {
        const positions = attachments.map(
          (value) => node.task?.content.indexOf(value.substring(0, value.indexOf('&token='))) || -1,
        );

        const position = Math.min(...positions.filter((value) => value !== -1));
        const index = positions.indexOf(position);

        taskThumbnails.value[node.key] = attachments[index] || null;
      })
      .catch(() => {
        // TODO:
      });
}

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useTasksViewPage(props.scopeName);
const {
  // Auto sort
  authenticatedMember,
  f,
  filtersApplied,
  findLastCloseAction,
  findLastImplementAction,
  findLastTestAction,
  flattenedTaskNodes,
  goToParent,
  m,
  selectedNode,
  selectedNodeKey,
  selectNode,
  taskNodes,
} = $p;

// Data

const taskThumbnails = ref<Record<string, string | null>>({});

// Computed

const taskThumbnail = computed(() => (node: (typeof $p.taskNodes.value)[number]) => {
  if (taskThumbnails.value[node.key] === undefined) {
    void loadThumbnail(node);
  }

  return taskThumbnails.value[node.key];
});

// Methods

function hasTwoAncestors(node: (typeof $p.taskNodes.value)[number]) {
  return (
    node.parentFolder !== $p.m.value.tasks &&
    $p.findNode(node.parentFolder.key)?.parentFolder !== $p.m.value.tasks
  );
}
</script>

<template>
  <q-tab-panels
    animated
    :model-value="!selectedNode ? 'root' : 'children'"
    style="background-color: transparent"
    transition-next="slide-left"
    transition-prev="slide-right"
  >
    <q-tab-panel class="q-py-none" name="root">
      <div class="q-gutter-y-lg">
        <q-breadcrumbs active-color="primary">
          <q-breadcrumbs-el icon="fal fa-house" />
          <!-- Preserve breadcrumbs height -->
          <div class="q-breadcrumbs__separator" style="visibility: hidden">/</div>
        </q-breadcrumbs>

        <q-list class="rounded-list">
          <q-expansion-item
            default-opened
            expand-icon-class="text-white"
            header-class="text-white text-h6 bg-accent"
            icon="fal fa-list-tree"
            :label="`Items (${taskNodes.length})`"
            popup
          >
            <q-card>
              <FadeTransition>
                <q-card-section v-if="taskNodes.length === 0" key="empty">
                  There is no item in this folder.
                </q-card-section>

                <q-list v-else key="items">
                  <ListTransition>
                    <q-item
                      v-for="child in taskNodes"
                      :key="child.key"
                      v-ripple
                      clickable
                      @click="() => selectNode(child.key)"
                    >
                      <q-item-section avatar>
                        <q-icon :color="child.iconColor" :name="child.icon" />
                      </q-item-section>
                      <q-item-section>
                        {{ child.label }}
                      </q-item-section>
                      <q-item-section v-if="child.task" thumbnail>
                        <q-slide-transition>
                          <div v-if="taskThumbnail(child)" class="flex q-pr-sm">
                            <img :src="taskThumbnail(child)!" />
                          </div>
                        </q-slide-transition>
                      </q-item-section>
                    </q-item>
                  </ListTransition>
                </q-list>
              </FadeTransition>
            </q-card>
          </q-expansion-item>

          <ListTransition no-tag>
            <NewTaskFolder
              v-if="!filtersApplied"
              key="newTaskFolder"
              :folder-list="m.tasks.folders"
              :scope-name="scopeName"
              :task-list="m.tasks.tasks"
            />

            <NewTask
              v-if="!filtersApplied && !!authenticatedMember"
              key="newTask"
              :folder-list="m.tasks.folders"
              :scope-name="scopeName"
              :task-list="m.tasks.tasks"
            />
          </ListTransition>
        </q-list>
      </div>
    </q-tab-panel>

    <q-tab-panel class="q-pa-none" name="children">
      <q-tab-panels
        v-model="selectedNodeKey"
        animated
        style="background-color: transparent"
        transition-next="slide-left"
        transition-prev="slide-right"
      >
        <q-tab-panel
          v-for="node in flattenedTaskNodes"
          :key="node.key"
          v-touch-swipe.right="goToParent"
          class="q-py-none"
          :name="node.key"
        >
          <div v-if="node.folder" class="q-gutter-y-lg">
            <q-breadcrumbs active-color="primary">
              <q-breadcrumbs-el
                icon="fal fa-house"
                to="#"
                @click="() => (selectedNodeKey = null)"
              />
              <q-breadcrumbs-el v-if="hasTwoAncestors(node)" label="..." />
              <q-breadcrumbs-el
                v-if="node.parentFolder !== m.tasks"
                icon="fal fa-folder-grid"
                :label="node.parentFolder.name"
                to="#"
                @click="() => selectNode(node.parentFolder.key)"
              />
              <q-breadcrumbs-el icon="fal fa-folder-grid" />
            </q-breadcrumbs>

            <ExpandableCard
              avatar-icon="fal fa-folder-grid"
              class="q-mx-auto"
              :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
              :title="node.folder.name"
            >
            </ExpandableCard>

            <q-list class="rounded-list">
              <q-expansion-item
                default-opened
                expand-icon-class="text-white"
                header-class="text-white text-h6 bg-accent"
                icon="fal fa-list-tree"
                :label="`Items (${node.folder.folders.length + node.folder.tasks.length})`"
                popup
              >
                <q-card>
                  <FadeTransition>
                    <q-card-section v-if="node.children.length === 0" key="empty">
                      There is no item in this folder.
                    </q-card-section>

                    <q-list v-else key="items">
                      <ListTransition>
                        <q-item
                          v-for="child in node.children"
                          :key="child.key"
                          v-ripple
                          clickable
                          @click="() => selectNode(child.key)"
                        >
                          <q-item-section avatar>
                            <q-icon :color="child.iconColor" :name="child.icon" />
                          </q-item-section>
                          <q-item-section>
                            {{ child.label }}
                          </q-item-section>
                          <q-item-section v-if="child.task" thumbnail>
                            <q-slide-transition>
                              <div v-if="taskThumbnail(child)" class="flex q-pr-sm">
                                <img :src="taskThumbnail(child)!" />
                              </div>
                            </q-slide-transition>
                          </q-item-section>
                        </q-item>
                      </ListTransition>
                    </q-list>
                  </FadeTransition>
                </q-card>
              </q-expansion-item>

              <ListTransition no-tag>
                <NewTaskFolder
                  v-if="!filtersApplied"
                  key="newTaskFolder"
                  :folder-list="node.folder.folders"
                  :scope-name="scopeName"
                  :task-list="node.folder.tasks"
                />

                <NewTask
                  v-if="!filtersApplied && !!authenticatedMember"
                  key="newTask"
                  :folder-list="node.folder.folders"
                  :scope-name="scopeName"
                  :task-list="node.folder.tasks"
                />
              </ListTransition>
            </q-list>
          </div>

          <div v-if="node.task" class="q-gutter-y-lg">
            <q-breadcrumbs active-color="primary">
              <q-breadcrumbs-el
                icon="fal fa-house"
                to="#"
                @click="() => (selectedNodeKey = null)"
              />
              <q-breadcrumbs-el v-if="hasTwoAncestors(node)" label="..." />
              <q-breadcrumbs-el
                v-if="node.parentFolder !== m.tasks"
                icon="fal fa-folder-grid"
                :label="node.parentFolder.name"
                to="#"
                @click="() => selectNode(node.parentFolder.key)"
              />
              <q-breadcrumbs-el :class="`text-${node.iconColor}`" :icon="node.icon">
                <TopTooltip>{{ node.task.statusHelper.text }}</TopTooltip>
              </q-breadcrumbs-el>
            </q-breadcrumbs>

            <ExpandableCard
              avatar-icon="fal fa-bars-progress"
              avatar-top
              body-col-gutter
              :caption="f.date(node.task.createDate) || undefined"
              class="q-mx-auto"
              expandable
              :header-background-color="Dark.isActive ? 'grey-8' : 'grey-4'"
              initially-expanded
              :title="node.task.title"
              title-top
            >
              <template #main>
                <StatusBadge class="q-mt-md" revert-color :status="node.task.statusHelper" />
              </template>

              <template #body>
                <div class="col-12 row justify-between">
                  <span>Owned by</span>
                  <ObjectLink
                    color="primary"
                    icon="fal fa-user"
                    :label="node.task.owner.fullName"
                    :to="`/team/member/${node.task.owner.id}`"
                  />
                </div>

                <div class="col-12 row justify-between">
                  <span>Assigned to</span>

                  <span v-if="node.task.assignedTo.length === 0"> None </span>
                  <span v-else>
                    <TaskAssignedTo icon :members="node.task.assignedTo" />
                  </span>
                </div>

                <template
                  v-if="node.task.isImplemented || node.task.isTested || node.task.isClosed"
                >
                  <q-separator class="flex-break spaced" />

                  <template v-if="node.task.isImplemented">
                    <template v-if="findLastImplementAction(node.task)">
                      <div class="col-6 row justify-between">
                        <span>
                          <q-icon color="primary" name="fal fa-check-double" />
                          Implemented on
                        </span>
                        <span>
                          {{ f.date(findLastImplementAction(node.task)!.createDate) }}
                        </span>
                      </div>

                      <div class="col-6 row justify-between">
                        <span>by</span>
                        <ObjectLink
                          color="primary"
                          icon="fal fa-user"
                          :label="findLastImplementAction(node.task)!.member.fullName"
                          :to="`/team/member/${findLastImplementAction(node.task)!.member.id}`"
                        />
                      </div>
                    </template>

                    <div v-else class="col-12">
                      <q-icon color="primary" name="fal fa-check-double" />
                      Implemented
                    </div>
                  </template>

                  <template v-if="node.task.isTested">
                    <template v-if="findLastTestAction(node.task)">
                      <div class="col-6 row justify-between">
                        <span>
                          <q-icon color="positive" name="fal fa-thumbs-up" />
                          Tested on
                        </span>
                        <span>
                          {{ f.date(findLastTestAction(node.task)!.createDate) }}
                        </span>
                      </div>

                      <div class="col-6 row justify-between">
                        <span>by</span>
                        <ObjectLink
                          color="primary"
                          icon="fal fa-user"
                          :label="findLastTestAction(node.task)!.member.fullName"
                          :to="`/team/member/${findLastTestAction(node.task)!.member.id}`"
                        />
                      </div>
                    </template>

                    <div v-else class="col-12">
                      <q-icon color="positive" name="fal fa-thumbs-up" />
                      Tested
                    </div>
                  </template>

                  <template v-if="node.task.isClosed">
                    <template v-if="findLastCloseAction(node.task)">
                      <div class="col-6 row justify-between">
                        <span>
                          <q-icon color="muted" name="fal fa-circle-xmark" />
                          Closed on
                        </span>
                        <span>
                          {{ f.date(findLastCloseAction(node.task)!.createDate) }}
                        </span>
                      </div>

                      <div class="col-6 row justify-between">
                        <span>by</span>
                        <ObjectLink
                          color="primary"
                          icon="fal fa-user"
                          :label="findLastCloseAction(node.task)!.member.fullName"
                          :to="`/team/member/${findLastCloseAction(node.task)!.member.id}`"
                        />
                      </div>
                    </template>

                    <div v-else class="col-12">
                      <q-icon color="muted" name="fal fa-circle-xmark" />
                      Closed
                    </div>
                  </template>
                </template>
              </template>
            </ExpandableCard>

            <q-list class="rounded-list">
              <q-expansion-item
                default-opened
                expand-icon-class="text-white"
                header-class="text-white text-h6 bg-accent"
                icon="fal fa-file-lines"
                label="Content"
                popup
              >
                <q-card>
                  <q-card-section>
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div v-html="node.task.content"></div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <TaskComments :scope-name="scopeName" :task="node.task" />

              <NewTaskComment
                v-if="!!authenticatedMember"
                :scope-name="scopeName"
                :task="node.task"
              />

              <TaskAttachments
                v-if="hasRole('maintenance')"
                :scope-name="scopeName"
                :task="node.task"
              />
            </q-list>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-tab-panel>
  </q-tab-panels>
</template>
