import type ExpandableCard from 'components/shared/expandable-card/ExpandableCard.vue';
import type GravatarImage from 'components/shared/GravatarImage.vue';
import type ObjectLink from 'components/shared/ObjectLink.vue';
import type PercentInput from 'components/shared/PercentInput.vue';
import type QPagePadding from 'components/shared/QPagePadding.vue';
import type TextField from 'components/shared/TextField.vue';
import type ThousandInput from 'components/shared/ThousandInput.vue';
import type TopTooltip from 'components/shared/TopTooltip.vue';
import type FadeTransition from 'components/shared/transition/FadeTransition.vue';
import type ListTransition from 'components/shared/transition/ListTransition.vue';
import type DateArrayFieldVal from 'components/shared/validation/DateArrayFieldVal.vue';
import type PercentInputVal from 'components/shared/validation/PercentInputVal.vue';
import type QDateInputVal from 'components/shared/validation/QDateInputVal.vue';
import type QDateVal from 'components/shared/validation/QDateVal.vue';
import type QInputVal from 'components/shared/validation/QInputVal.vue';
import type QSelectVal from 'components/shared/validation/QSelectVal.vue';
import type ThousandInputVal from 'components/shared/validation/ThousandInputVal.vue';

declare module 'vue' {
  export interface GlobalComponents {
    FadeTransition: typeof FadeTransition;
    ListTransition: typeof ListTransition;
    TopTooltip: typeof TopTooltip;
    GravatarImage: typeof GravatarImage;
    ExpandableCard: typeof ExpandableCard;
    QPagePadding: typeof QPagePadding;
    ObjectLink: typeof ObjectLink;
    TextField: typeof TextField;
    PercentInput: typeof PercentInput;
    ThousandInput: typeof ThousandInput;
    QInputVal: typeof QInputVal;
    PercentInputVal: typeof PercentInputVal;
    ThousandInputVal: typeof ThousandInputVal;
    QSelectVal: typeof QSelectVal;
    QDateVal: typeof QDateVal;
    QDateInputVal: typeof QDateInputVal;
    DateArrayFieldVal: typeof DateArrayFieldVal;
  }
}

declare module 'composables/useConfig.js' {
  interface Config {
    cardWidth?: number;
    listItemCardWidth?: number;
    fixedPadding?: number;
    topFloatPadding?: number;
    bottomFloatPadding?: number;
  }
}
