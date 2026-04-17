/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentPublicInstance } from 'vue';
import type { VueApexChartsComponent } from 'vue3-apexcharts';

import type { ComponentConstructor } from 'quasar';

type Method = (...args: any) => any;

type PropKeys = Exclude<
  keyof {
    [P in keyof VueApexChartsComponent as VueApexChartsComponent[P] extends Method
      ? never
      : P]: any;
  },
  keyof ComponentPublicInstance
>;

type Props = Pick<VueApexChartsComponent, PropKeys>;

declare module 'vue' {
  export interface GlobalComponents {
    ApexCharts: ComponentConstructor<ComponentPublicInstance<Props>>;
  }
}
