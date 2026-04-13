<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFileInvoiceDollar, faNotEqual } from '@fortawesome/pro-light-svg-icons';
import { faBolt, faEye, faEyeSlash } from '@fortawesome/pro-solid-svg-icons';

import { onUnmounted } from 'vue';

import { useMeta } from 'quasar';

import { useProjectsStore } from 'stores/finance/Projects.js';

import useQuotationViewPage from 'composables/finance/quotation/useQuotationViewPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

import QuotationDetailsViewerInnerTable from 'components/Quotation/table/QuotationDetailsViewerInnerTable.vue';

// Constants

const SCOPE_NAME = 'quotations-print-page';

// Composables

const store = useProjectsStore();

const { appName } = requiredConfigEntries('appName', 'cardWidth');

const f = useFormats();

const $p = useQuotationViewPage(SCOPE_NAME, true);
const {
  // Auto sort
  m,
  model,
  pm,
  ready,
} = $p;

// Private Executions

library.add(faFileInvoiceDollar, faBolt, faNotEqual, faEye, faEyeSlash);

useMeta(() => ({
  title: `Print Quotation - ${appName}`,
}));

// usePageFeatures
$p.hasEditor.value = false;

// usePageData
$p.modelFindKeyField.value = 'code';

// useViewChildPage
$p.parentModelFindKeyField.value = 'urlFriendlyName';
$p.parentModelGetter.value = (docKey) => store.doc(docKey);
$p.modelChildrenGetter.value = (parentModel) => parentModel.quotations;

// usePageData - loadModel
void $p
  .loadModel((payload) => {
    payload.findKeyField = $p.parentModelFindKeyField.value;
    payload.findKey = $p.parentFindKey.value;
    return store.loadRealtimeDoc(payload);
  })
  .then(() => {
    $p.ready.value = true;

    setTimeout(() => {
      if (!!model.value && !m.value.isCancelled) {
        window.print();
      }
    }, 500);
  });

// Lifecycle Hooks

onUnmounted(() => {
  $p.releaseModel.value && $p.releaseModel.value();
});
</script>

<template>
  <div>
    <FadeTransition>
      <div v-if="!ready" key="loading" class="absolute-center">
        <q-spinner-pie color="primary" size="6em" />
      </div>

      <div v-else-if="!model" key="empty" class="absolute-center">
        Payroll is not available. Please contact support.
      </div>

      <div v-else key="ready" class="q-gutter-y-lg">
        <!-- Title -->
        <section class="row justify-between">
          <div class="col q-pt-xl">
            <div>
              <h5 class="text-weight-light text-uppercase q-mt-none q-mb-sm">Address</h5>
              <div class="text-uppercase">Motix Ltd.,</div>
              <div>
                560 Ba Thang Hai Street<br />
                Ward 14, District 10<br />
                Ho Chi Minh City<br />
                Vietnam
              </div>
            </div>

            <div>
              <h5 class="text-weight-light text-uppercase q-mt-md q-mb-sm">To</h5>
              <div class="text-uppercase">{{ pm.customer.name }}</div>
            </div>
          </div>

          <div class="col q-pt-xl">
            <q-markup-table bordered separator="cell">
              <tbody>
                <tr>
                  <td class="text-weight-light text-uppercase text-right">Code</td>
                  <td>
                    {{ m.code }}
                  </td>
                </tr>
                <tr>
                  <td class="text-weight-light text-uppercase text-right">Issue Date</td>
                  <td>
                    {{ f.date(m.createDate) }}
                  </td>
                </tr>
                <tr>
                  <td class="text-weight-light text-uppercase text-right">Quotation for</td>
                  <td>
                    {{ pm.name }}
                  </td>
                </tr>
                <tr>
                  <td class="text-weight-light text-uppercase text-right">Date</td>
                  <td>
                    {{ f.date(pm.finishDate) }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </section>

        <section v-if="m.isCancelled" class="text-negative text-center text-uppercase">
          This Quotation is cancelled!
        </section>

        <!-- Main -->
        <section class="q-pt-lg">
          <QuotationDetailsViewerInnerTable
            id="detailsViewerTable"
            printer-friendly
            :scope-name="SCOPE_NAME"
          />
        </section>

        <!-- Footer -->
        <section>
          <h5 class="text-weight-light text-uppercase q-mb-sm">Terms and Conditions</h5>
          <ol class="text-weight-light">
            <li>This quotation is valid for 30 days since issue date.</li>
            <li>Additional stock photos, footages and music cost might be charged if necessary.</li>
          </ol>
        </section>

        <section class="text-weight-light text-uppercase q-mt-xl text-center">
          Thank you for choosing us!
        </section>
      </div>
    </FadeTransition>
  </div>
</template>
