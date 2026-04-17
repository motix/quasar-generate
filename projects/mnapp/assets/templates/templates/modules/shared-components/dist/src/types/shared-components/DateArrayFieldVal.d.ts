declare module 'components/shared/validation/DateArrayFieldVal.vue' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor, QFieldProps } from 'quasar';

  type Props = {
    name: string;
    modelValue: string[] | null;
  };
  type Component = ComponentConstructor<
    ComponentPublicInstance<Omit<QFieldProps, keyof Props> & Props>
  >;
  const component: Component;

  export default component;
}
