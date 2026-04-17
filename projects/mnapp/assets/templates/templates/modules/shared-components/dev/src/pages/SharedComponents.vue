<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

// Data

const fsShowCard1 = ref(true);
const lsCards = ref(['Card 1', 'Card 2', 'Card 3']);
const piValue = ref(0.5);

const topTooltipModel = ref(false);
const topTooltipRef = useTemplateRef('topTooltip');

// Methods

function lsAddCard() {
  lsCards.value.push(`New Card ${Date.now().valueOf() - new Date(2020, 1, 1).valueOf()}`);
}

function lsRemoveCard(index: number) {
  lsCards.value.splice(index, 1);
}
</script>

<template>
  <q-page padding>
    <div class="text-h3">Shared Components</div>

    <h4>FadeTransition</h4>
    <FadeTransition>
      <q-card v-if="fsShowCard1" key="card1" @click="fsShowCard1 = !fsShowCard1">
        <q-card-section> Card 1 </q-card-section>
      </q-card>
      <q-card v-else key="card2" @click="fsShowCard1 = !fsShowCard1">
        <q-card-section> Card 2 </q-card-section>
      </q-card>
    </FadeTransition>

    <h4>ListTransition</h4>
    <q-btn label="Add" @click="lsAddCard" />
    <ListTransition class="q-gutter-y-md q-py-md" color-effect>
      <q-card v-for="(card, index) in lsCards" :key="card">
        <q-card-section>
          <q-btn label="Remove" @click="lsRemoveCard(index)" />
          {{ card }}
        </q-card-section>
      </q-card>
    </ListTransition>
    <q-btn label="Add" @click="lsAddCard" />

    <h4>TopTooltip</h4>
    <div>
      <q-btn @click="topTooltipRef?.hide()">
        Top Tooltip - Click to hide
        <TopTooltip
          ref="topTooltip"
          v-model="topTooltipModel"
          transition-hide="jump-right"
          @hide="console.log('TopTooltip onHide')"
          >Top Tooltip</TopTooltip
        >
      </q-btn>

      <span class="q-ml-md">topTooltipModel: {{ topTooltipModel }}</span>
    </div>

    <h4>Gravatar Image</h4>
    <GravatarImage />
    <GravatarImage gravatar-id="9c9fc5119fa33d6ac836600c6f933e76" />

    <h4>ExpandableCard</h4>
    <ExpandableCard
      caption="Caption"
      expandable
      gravatar-id="9c9fc5119fa33d6ac836600c6f933e76"
      header-background-color="primary"
      header-dark
      subtitle="Sub-title"
      title="Title"
      use-gravatar
    >
      <template #side> Side </template>
      <template #body> Body </template>
    </ExpandableCard>

    <h4>PercentInput</h4>
    <div>Value: {{ piValue }}</div>
    <div style="max-width: 100px">
      <PercentInput v-model="piValue" input-class="text-right" suffix="%" />
    </div>
  </q-page>
</template>
