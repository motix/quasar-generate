declare module 'components/shared/TopTooltip.vue' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor, QTooltipProps } from 'quasar';

  interface TopTooltip extends ComponentPublicInstance<QTooltipProps> {
    hide: () => void;
  }

  type Component = ComponentConstructor<TopTooltip>;
  const component: Component;

  export default component;
}
