import type ListPage from 'components/shared/crud-pages/ListPage.vue';
import type NewPage from 'components/shared/crud-pages/NewPage.vue';
import type ViewPage from 'components/shared/crud-pages/ViewPage.vue';

declare module 'vue' {
  interface GlobalComponents {
    ListPage: typeof ListPage;
    ViewPage: typeof ViewPage;
    NewPage: typeof NewPage;
  }
}
