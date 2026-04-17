declare module 'components/shared/validation/QInputVal.vue' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor, QInputProps, QDateProps } from 'quasar';

  type Props = {
    name: string;
    modelValue: string | number | null | undefined;
    dateOptions?: QDateProps['options'];
  };
  type Component = ComponentConstructor<
    ComponentPublicInstance<Omit<QInputProps, keyof Props> & Props>
  >;
  const component: Component;

  export default component;
}
