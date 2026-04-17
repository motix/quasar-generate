declare module 'components/shared/validation/QDateInputVal.vue' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor, QInputProps } from 'quasar';

  type Props = {
    name: string;
    modelValue: string | null;
    optional?: boolean;
  };
  type Component = ComponentConstructor<
    ComponentPublicInstance<Omit<QInputProps, keyof Props> & Props>
  >;
  const component: Component;

  export default component;
}
