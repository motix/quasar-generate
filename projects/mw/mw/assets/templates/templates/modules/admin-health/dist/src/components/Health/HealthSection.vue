<script setup lang="ts">
import VueMarkdown from 'vue-markdown-render';

import { Dark } from 'quasar';

import type { Rule } from 'models/health/index.js';

// Props

defineProps<{
  title: string;
  checkButtonTooltip: string;
  rules: Rule[];
}>();

// Emit

defineEmits<{ (e: 'check'): void }>();
</script>

<template>
  <section>
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>{{ title }}</q-toolbar-title>
      <q-btn flat icon="fa fa-ballot-check" style="margin-right: 6px" @click="$emit('check')">
        <TopTooltip>
          {{ checkButtonTooltip }}
        </TopTooltip>
      </q-btn>
    </q-toolbar>
    <q-list bordered>
      <div
        v-for="(rule, ruleIndex) in rules"
        :key="ruleIndex"
        :class="{
          [Dark.isActive ? 'bg-grey-10' : 'bg-grey-1']: ruleIndex % 2 == 0,
          [Dark.isActive ? 'bg-grey-9' : 'bg-grey-3']: ruleIndex % 2 == 1,
        }"
      >
        <q-separator v-if="ruleIndex > 0" />

        <q-item class="bg-light" style="z-index: 1">
          <q-item-section>
            <q-item-label>{{ rule.title }}</q-item-label>
            <q-item-label caption>
              <VueMarkdown :source="rule.caption" />
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <FadeTransition>
              <q-icon v-if="rule.checking" class="q-px-md" color="primary">
                <q-spinner-grid />
              </q-icon>

              <q-icon
                v-else-if="rule.checkingFailed === true"
                class="q-px-md"
                color="muted"
                name="fa fa-shield-xmark"
              />

              <q-icon
                v-else-if="rule.result === true"
                class="q-px-md"
                color="positive"
                name="fa fa-shield-check"
              />
              <q-icon
                v-else-if="rule.result === false"
                class="q-px-md"
                color="negative"
                name="fa fa-shield-xmark"
              />
            </FadeTransition>
          </q-item-section>
        </q-item>

        <q-separator
          v-if="rule.errors.length + rule.successes.length + rule.info.length > 0"
          inset
        />

        <q-item
          style="transition: margin-top 0.3s"
          :style="{
            'margin-top':
              rule.errors.length + rule.successes.length + rule.info.length === 0 ? '-48px' : '0',
          }"
        >
          <q-list dense>
            <ListTransition>
              <q-item
                v-for="(error, errorIndex) in rule.errors"
                :key="'e_' + errorIndex"
                class="q-item--dense"
              >
                <q-item-section avatar style="min-width: 15px">
                  <q-item-label caption>
                    <q-icon color="negative" name="fas fa-circle-exclamation" />
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>
                    <VueMarkdown :source="error" />
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-for="(success, successIndex) in rule.successes"
                :key="'s_' + successIndex"
                class="q-item--dense"
              >
                <q-item-section avatar style="min-width: 15px">
                  <q-item-label caption>
                    <q-icon color="positive" name="fas fa-circle-check" />
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>
                    <VueMarkdown :source="success" />
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-for="(info, infoIndex) in rule.info"
                :key="'i_' + infoIndex"
                class="q-item--dense"
              >
                <q-item-section avatar style="min-width: 15px">
                  <q-item-label caption>
                    <q-icon color="info" name="fas fa-circle-info" />
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>
                    <VueMarkdown :source="info" />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </ListTransition>
          </q-list>
        </q-item>
      </div>
    </q-list>
  </section>
</template>

<style scoped lang="scss">
.q-item__label :deep() p {
  margin-bottom: 0;
}

.body--light .q-item__label :deep() code {
  background-color: $blue-1;
}

.body--dark .q-item__label :deep() code {
  background-color: $green-10;
}
</style>
