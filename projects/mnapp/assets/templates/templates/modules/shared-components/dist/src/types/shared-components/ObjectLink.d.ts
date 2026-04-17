declare module 'components/shared/ObjectLink.vue' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor, QBtnProps } from 'quasar';

  type Props = {
    label: string;
    icon?: string | undefined;
    iconRight?: string | undefined;
    wrapLabel?: boolean | undefined;
    maxWidth?: string | undefined;
  };
  type Component = ComponentConstructor<
    ComponentPublicInstance<Omit<QBtnProps, keyof Props> & Props>
  >;
  const component: Component;

  export default component;
}
