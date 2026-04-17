declare module 'components/shared/TextField.vue' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor, QFieldProps, VueClassProp } from 'quasar';

  type Props = { fieldClass?: VueClassProp };
  type Component = ComponentConstructor<
    ComponentPublicInstance<Omit<QFieldProps, keyof Props> & Props>
  >;
  const component: Component;

  export default component;
}
