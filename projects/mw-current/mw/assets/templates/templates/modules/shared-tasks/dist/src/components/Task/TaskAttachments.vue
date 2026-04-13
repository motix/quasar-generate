<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import type { Task } from 'models/tasks/index.js';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';

// Props

const props = defineProps<{
  scopeName: string;
  task: Task;
}>();

// Composables

const $p = useTasksViewPage(props.scopeName);
const {
  // Auto sort
  taskAttachmentInUsed,
} = $p;

// Data

const attachments = ref<string[]>([]);

// Lifecycle Hooks

onMounted(async () => {
  attachments.value = await $p.getTaskAttachments(props.task.key);
});

// Watch

watch(
  computed(() => props.task.content),
  async () => {
    attachments.value = await $p.getTaskAttachments(props.task.key);
  },
);

watch(
  computed(() => props.task.comments.length),
  async () => {
    attachments.value = await $p.getTaskAttachments(props.task.key);
  },
);

watch(
  computed(() => props.task.comments.map((value) => value.content).join('\n')),
  async () => {
    attachments.value = await $p.getTaskAttachments(props.task.key);
  },
);
</script>

<template>
  <q-expansion-item
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-paperclip-vertical"
    :label="`Attachments (${attachments.length})`"
    popup
  >
    <q-card>
      <FadeTransition>
        <q-card-section v-if="attachments.length === 0" key="empty">
          There is no attachment in this task.
        </q-card-section>

        <div v-else key="attachments">
          <q-markup-table id="attachmentsTable" bordered separator="cell" wrap-cells>
            <thead>
              <tr>
                <th class="q-table--col-auto-width"></th>
                <th class="text-left">URL</th>
                <th class="q-table--col-auto-width">In Used</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="attachment in attachments" :key="attachment">
                <td>
                  <q-img :src="attachment" width="100px" />
                </td>
                <td>
                  {{ attachment }}
                </td>
                <td class="text-center">
                  <q-toggle
                    checked-icon="fal fa-check"
                    color="primary"
                    disable
                    :model-value="taskAttachmentInUsed(task, attachment)"
                    unchecked-icon="clear"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </FadeTransition>
    </q-card>
  </q-expansion-item>
</template>
