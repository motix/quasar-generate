declare module 'components/shared/QPagePadding.vue' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor, QPageProps } from 'quasar';

  type Props = {
    fixedPadding?: number;
    topFloatPadding?: number;
    bottomFloatPadding?: number;
  };
  type Component = ComponentConstructor<
    ComponentPublicInstance<Omit<QPageProps, keyof Props> & Props>
  >;
  const component: Component;

  export default component;
}
