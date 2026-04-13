<script setup lang="ts">
import { Dialog } from 'quasar';

import type { Task, TaskComment } from 'models/tasks/index.js';

import useTasksViewPage from 'composables/tasks/task/useTasksViewPage.js';
import useFirebaseAuth from 'composables/useFirebaseAuth.js';

import TaskCommentEditor from './TaskCommentEditor.vue';

// Props

const props = defineProps<{
  scopeName: string;
  task: Task;
}>();

// Composables

const { hasRole } = useFirebaseAuth();

const $p = useTasksViewPage(props.scopeName);
const {
  // Auto sort
  authenticatedMember,
  f,
} = $p;

// Methods

function messageBackgroundColor(comment: TaskComment) {
  switch (comment.action) {
    case 'comment':
      return undefined;
    case 'implement':
      return 'primary';
    case 'test':
      return 'positive';
    case 'reject':
      return 'negative';
    case 'close':
      return 'muted';
    case 'reopen':
      return 'primary';
    default: {
      const _exhaustiveCheck: never = comment.action;
      return _exhaustiveCheck;
    }
  }
}

function messageIcon(comment: TaskComment) {
  switch (comment.action) {
    case 'comment':
      return undefined;
    case 'implement':
      return 'fal fa-check-double';
    case 'test':
      return 'fal fa-thumbs-up';
    case 'reject':
      return 'fal fa-thumbs-down';
    case 'close':
      return 'fal fa-circle-xmark';
    case 'reopen':
      return 'fal fa-circle-check';
    default: {
      const _exhaustiveCheck: never = comment.action;
      return _exhaustiveCheck;
    }
  }
}

function messageAction(comment: TaskComment) {
  switch (comment.action) {
    case 'comment':
      return undefined;
    case 'implement':
      return 'Implement';
    case 'test':
      return 'Test';
    case 'reject':
      return 'Reject';
    case 'close':
      return 'Close';
    case 'reopen':
      return 'Re-open';
    default: {
      const _exhaustiveCheck: never = comment.action;
      return _exhaustiveCheck;
    }
  }
}

function editTaskComment(comment: TaskComment) {
  Dialog.create({
    component: TaskCommentEditor,
    componentProps: {
      scopeName: props.scopeName,
      task: props.task,
      taskComment: comment,
    },
  });
}

function deleteTaskComment(index: number) {
  Dialog.create({
    title: 'Delete',
    message: 'Are you sure want to delete the information?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const task = props.task;
    task.comments.splice(index, 1);
    void $p.viewerSave();
  });
}
</script>

<template>
  <q-expansion-item
    expand-icon-class="text-white"
    header-class="text-white text-h6 bg-accent"
    icon="fal fa-comments"
    :label="`Comments (${task.comments.length})`"
    popup
  >
    <q-card>
      <q-card-section>
        <FadeTransition>
          <div v-if="task.comments.length === 0" key="empty">There is no comment in this task.</div>

          <ListTransition v-else key="comments">
            <div v-for="(comment, index) of task.comments" :key="index">
              <q-chat-message
                :bg-color="messageBackgroundColor(comment)"
                :name="
                  comment.member.id === authenticatedMember?.id ? 'me' : comment.member.fullName
                "
                :sent="comment.member.id === authenticatedMember?.id"
                :stamp="f.dateTime(comment.createDate) || undefined"
                :text-color="comment.action !== 'comment' ? 'white' : undefined"
              >
                <div class="q-gutter-y-sm">
                  <div v-if="comment.action !== 'comment'">
                    <q-icon :name="messageIcon(comment)" />
                    {{ messageAction(comment) }}
                  </div>

                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="comment.content"></div>
                </div>
              </q-chat-message>

              <q-menu
                v-if="comment.member.id === authenticatedMember?.id || hasRole('manager')"
                context-menu
                touch-position
              >
                <q-list dense style="min-width: 100px">
                  <q-item v-close-popup clickable @click="editTaskComment(comment)">
                    <q-item-section>
                      <q-item-label class="text-primary">
                        <q-icon name="fal fa-edit" style="margin-top: -5px" />
                        Edit...
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-close-popup clickable @click="deleteTaskComment(index)">
                    <q-item-section>
                      <q-item-label class="text-negative">
                        <q-icon name="fal fa-trash-alt" style="margin-top: -5px" />
                        Delete
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </div>
          </ListTransition>
        </FadeTransition>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>
