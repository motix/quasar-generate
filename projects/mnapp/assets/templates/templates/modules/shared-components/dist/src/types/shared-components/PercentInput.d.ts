declare module 'components/shared/PercentInput.vue' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor, QInputProps } from 'quasar';

  type Props = {
    modelValue: string | number | null | undefined;
    decimal?: number | undefined;
  };
  type Component = ComponentConstructor<
    ComponentPublicInstance<Omit<QInputProps, keyof Props> & Props>
  >;
  const component: Component;

  export default component;
}
