// TODO: Check new version
// Fixing components type issue
// @fortawesome/vue-fontawesome version 3.0.1

declare module '@fortawesome/vue-fontawesome' {
  import type { ComponentPublicInstance } from 'vue';
  import type { ComponentConstructor } from 'quasar';

  interface FontAwesomeIconProps {
    border: boolean;
    fixedWidth: boolean;
    flip: boolean | 'horizontal' | 'vertical' | 'both';
    icon: object | Array<string> | string;
    mask: object | Array<string> | string | null;
    listItem: boolean;
    pull: 'right' | 'left' | null;
    pulse: boolean;
    rotation: 90 | 180 | 270 | '90' | '180' | '270' | null;
    swapOpacity: boolean;
    size:
      | 'lg'
      | 'xs'
      | 'sm'
      | '1x'
      | '2x'
      | '3x'
      | '4x'
      | '5x'
      | '6x'
      | '7x'
      | '8x'
      | '9x'
      | '10x'
      | null;
    spin: boolean;
    transform: object | string | null;
    symbol: boolean | string;
    title: string | null;
    inverse: boolean;
  }

  interface FontAwesomeLayersProps {
    fixedWidth: boolean;
  }

  interface FontAwesomeLayersTextProps {
    value: string | number;
    transform: object | string | null;
    counter: boolean;
    position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | null;
  }

  export const FontAwesomeIcon: ComponentConstructor<
    ComponentPublicInstance<
      Partial<Omit<FontAwesomeIconProps, 'icon'>> & Pick<FontAwesomeIconProps, 'icon'>
    >
  >;
  export const FontAwesomeLayers: ComponentConstructor<
    ComponentPublicInstance<Partial<FontAwesomeLayersProps>>
  >;
  export const FontAwesomeLayersText: ComponentConstructor<
    ComponentPublicInstance<Partial<FontAwesomeLayersTextProps>>
  >;
}
