<script setup lang="ts">
import { useTemplateRef } from 'vue';

import { QCard } from 'quasar';

import useScroll from 'composables/useScroll.js';

// Composables

const { toTop, toElement } = useScroll();

// Data

const buttonsRef = useTemplateRef('buttons');
const elementRef = useTemplateRef('element');
const componentRef = useTemplateRef('component');

// Methods

function toButtons() {
  buttonsRef.value && toElement(buttonsRef.value);
}

function toTheElement() {
  elementRef.value && toElement(elementRef.value);
}

function toComponent() {
  componentRef.value && toElement(componentRef.value);
}
</script>

<template>
  <q-page padding>
    <div>
      <q-btn label="To Buttons" @click="toButtons" />
    </div>

    <div style="padding: 500px 0"></div>

    <div ref="element">
      Element
      <q-btn label="To Buttons" @click="toButtons" />
    </div>

    <div style="padding: 500px 0"></div>

    <div>
      <q-card ref="component">
        Component
        <q-btn label="To Buttons" @click="toButtons" />
      </q-card>
    </div>

    <div style="padding: 3000px 0"></div>

    <div ref="buttons">
      <q-btn label="To Top" @click="toTop" />
      <q-btn label="To Element" @click="toTheElement" />
      <q-btn label="To Component" @click="toComponent" />
    </div>
  </q-page>
</template>
