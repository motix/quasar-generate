<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';

import { Dark, QAjaxBar } from 'quasar';

import useNewPage from 'composables/crud-pages/useNewPage/index.js';

import FloatToolbar from 'components/shared/FloatToolbar.vue';
import TopTooltip from 'components/shared/TopTooltip.vue';

// Props

const props = defineProps<{ scopeName: string }>();

// Composables

const {
  // usePageStatus
  ready,
  freezed,
  isDirty,
  // useEditor
  editorSaving,
  initiallyFilled,
  editorSave,
  // useNavigateToListPage
  confirmAndGoBack,
} = useNewPage<NonNullable<unknown>>(props.scopeName);

// Data

const freezingBarRef = useTemplateRef('freezingBar');
const saveTooltipRef = useTemplateRef('saveTooltip');

// Methods

function hideSaveTooltip() {
  saveTooltipRef.value?.hide();
}

// Watch

watch(freezed, (value) => {
  if (value) {
    freezingBarRef.value?.start();
  } else {
    freezingBarRef.value?.stop();
  }
});
</script>

<template>
  <div>
    <FadeTransition>
      <div v-if="!ready" key="loading" class="absolute-center">
        <!-- Loading -->
        <q-spinner-pie color="primary" size="6em" />
      </div>

      <div v-else key="ready">
        <!-- Ready -->
        <slot></slot>

        <FloatToolbar position="bottom-left">
          <template #fixed-buttons>
            <q-btn
              key="back"
              :color="isDirty ? 'accent' : Dark.isActive ? 'grey-9' : 'grey-3'"
              :disable="freezed"
              icon="fal fa-arrow-left"
              round
              :text-color="isDirty ? 'white' : 'accent'"
              @click="confirmAndGoBack"
            >
              <TopTooltip>Back</TopTooltip>
            </q-btn>
          </template>
        </FloatToolbar>

        <FloatToolbar>
          <template #fixed-buttons>
            <q-btn
              key="save"
              :color="Dark.isActive ? 'grey-9' : 'grey-3'"
              :disable="freezed || (!isDirty && !initiallyFilled)"
              icon="fal fa-save"
              :loading="editorSaving"
              round
              text-color="primary"
              @click="
                (function () {
                  hideSaveTooltip();
                  editorSave();
                })()
              "
            >
              <TopTooltip ref="saveTooltip">Save</TopTooltip>
            </q-btn>

            <slot name="toolbar-main"></slot>

            <TransitionGroup
              v-show="$slots['toolbar-extra']"
              key="extra"
              class="no-wrap row reverse"
              name="float-toolbar-transition"
              style="margin-right: 7px"
              tag="div"
            >
              <slot name="toolbar-extra"></slot>
            </TransitionGroup>
          </template>
        </FloatToolbar>
      </div>
    </FadeTransition>

    <q-ajax-bar ref="freezingBar" color="warning" position="bottom" size="3px" />
  </div>
</template>
