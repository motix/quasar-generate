import { onUnmounted, ref } from 'vue';

import { useSingleScopeComposableStore } from 'stores/SingleScopeComposable.js';

import useEditor from './useEditor.js';
import useNavigateToListPage from './useNavigateToListPage.js';
import usePageData from './usePageData.js';
import usePageStatus from './usePageStatus.js';

function newScope<TVm extends NonNullable<unknown>>() {
  const pageStatus = usePageStatus();
  const pageData = usePageData<TVm>();

  const extraInitialized = ref(false);

  return {
    ...pageStatus,
    ...pageData,
    ...useEditor<TVm>(pageStatus.freezed, pageData.viewModel, pageData.createModel),
    ...useNavigateToListPage(pageStatus.isDirty),
    extraInitialized,
  };
}

class NewScopeHelper<TVm extends NonNullable<unknown>> {
  Return = newScope<TVm>();
}

export default function useNewPage<
  TVm extends NonNullable<unknown>,
  TExtra extends NonNullable<unknown> = Record<string, never>,
>(scopeName: string, hitUseCount?: boolean): NewScopeHelper<TVm>['Return'] & TExtra {
  const store = useSingleScopeComposableStore();

  !store.hasScope(scopeName) && store.setScope(scopeName, newScope<TVm>());

  if (hitUseCount === true) {
    store.increaseScopeUseCount(scopeName);
    onUnmounted(() => store.decreaseScopeUseCount(scopeName));
  }

  return store.retrieveScope(scopeName);
}

class UseNewPageHelper<TVm extends NonNullable<unknown>, TExtra extends NonNullable<unknown>> {
  Return = useNewPage<TVm, TExtra>('');
}

export type NewPage<
  TVm extends NonNullable<unknown>,
  TExtra extends NonNullable<unknown> = Record<string, never>,
> = UseNewPageHelper<TVm, TExtra>['Return'];
