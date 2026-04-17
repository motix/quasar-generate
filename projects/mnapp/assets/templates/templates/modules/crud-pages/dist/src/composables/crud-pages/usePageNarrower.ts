import type { NewChildPage } from 'composables/crud-pages/useNewChildPage.js';
import type { NewPage } from 'composables/crud-pages/useNewPage/index.js';
import type { ViewChildPage } from 'composables/crud-pages/useViewChildPage.js';
import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';

export function useChildPageNarrower<
  TChild extends NonNullable<unknown>,
  TChildVm extends NonNullable<unknown>,
  TParent extends NonNullable<unknown>,
  TParentVm extends NonNullable<unknown>,
>() {
  function hasParent<
    TPage extends
      | NewPage<TChildVm, NonNullable<unknown>>
      | ViewPage<TChild, TChildVm, NonNullable<unknown>>,
  >(
    $p: TPage,
  ): $p is TPage extends NewPage<TChildVm, NonNullable<unknown>>
    ? TPage & { newPageFlag: true } & NewChildPage<TChildVm, TParentVm>
    : TPage extends ViewPage<TChild, TChildVm, NonNullable<unknown>>
      ? TPage & { viewPage: true } & ViewChildPage<TChild, TChildVm, TParent, TParentVm>
      : never {
    return !!(
      $p as unknown as
        | NewChildPage<TChildVm, TParentVm>
        | ViewChildPage<TChild, TChildVm, TParent, TParentVm>
    ).parentFindKey;
  }

  return {
    hasParent,
  };
}

export function defineNewPageNarrower<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TNewPage extends NewPage<any, NonNullable<unknown>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TViewPage extends ViewPage<any, any, NonNullable<unknown>>,
>($p: TNewPage | TViewPage) {
  Object.assign($p, {
    isNewPage: (p: typeof $p): p is TNewPage => {
      return !(p as ViewPage<NonNullable<unknown>, NonNullable<unknown>>).model;
    },

    // To be used when !isNewPage not works as intended
    isViewPage: (p: typeof $p): p is TViewPage => {
      return !!(p as ViewPage<NonNullable<unknown>, NonNullable<unknown>>).model;
    },
  });

  return $p as typeof $p & {
    isNewPage(p: typeof $p): p is TNewPage;
    isViewPage(p: typeof $p): p is TViewPage;
  };
}
