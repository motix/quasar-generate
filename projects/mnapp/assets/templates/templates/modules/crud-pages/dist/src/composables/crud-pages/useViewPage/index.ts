import { onUnmounted, ref } from 'vue';

import { useSingleScopeComposableStore } from 'stores/SingleScopeComposable.js';

import useReturnUrl from 'composables/useReturnUrl.js';

import useDeleting from './useDeleting';
import useEditor from './useEditor';
import usePageData from './usePageData';
import usePageFeatures from './usePageFeatures';
import usePageStatus from './usePageStatus';
import usePageTitle from './usePageTitle';
import useToolbar from './useToolbar';
import useViewer from './useViewer';

function newScope<T extends NonNullable<unknown>, TVm extends NonNullable<unknown>>() {
  const { defaultReturnUrl: backUrl, returnUrl, goBack } = useReturnUrl();
  const pageFeatures = usePageFeatures();
  const pageStatus = usePageStatus();
  const pageData = usePageData<T, TVm>(
    goBack,
    pageFeatures.hasEditor,
    pageStatus.ready,
    pageStatus.muteRealtimeUpdate,
    pageStatus.delayRealtimeUpdate,
    pageStatus.ignoreViewerWatch,
    pageStatus.editMode,
    pageStatus.isDirty,
  );

  const extraInitialized = ref(false);

  return {
    backUrl,
    returnUrl,
    goBack,
    ...pageFeatures,
    ...pageStatus,
    ...pageData,
    ...useViewer<T>(
      pageStatus.freezed,
      pageStatus.muteRealtimeUpdate,
      pageStatus.ignoreViewerWatch,
      pageStatus.editMode,
      pageData.docKey,
      pageData.model,
      pageData.updateModel,
    ),
    ...useEditor<TVm>(
      pageStatus.freezed,
      pageStatus.muteRealtimeUpdate,
      pageStatus.delayRealtimeUpdate,
      pageStatus.editMode,
      pageStatus.isDirty,
      pageData.docKey,
      pageData.viewModel,
      pageData.updateModel,
      pageData.getModelAndViewModel,
    ),
    ...useDeleting(
      goBack,
      pageStatus.freezed,
      pageStatus.muteRealtimeUpdate,
      pageData.docKey,
      pageData.deleteModel,
    ),
    ...usePageTitle<T>(pageData.model),
    ...useToolbar(
      pageFeatures.hasEditor,
      pageFeatures.hasDeleting,
      pageFeatures.hasMultiViews,
      pageStatus.ready,
      pageStatus.editMode,
    ),
    extraInitialized,
  };
}

class NewScopeHelper<T extends NonNullable<unknown>, TVm extends NonNullable<unknown>> {
  Return = newScope<T, TVm>();
}

export default function useViewPage<
  T extends NonNullable<unknown>,
  TVm extends NonNullable<unknown>,
  TExtra extends NonNullable<unknown> = Record<string, never>,
>(scopeName: string, hitUseCount?: boolean): NewScopeHelper<T, TVm>['Return'] & TExtra {
  const store = useSingleScopeComposableStore();

  !store.hasScope(scopeName) && store.setScope(scopeName, newScope<T, TVm>());

  if (hitUseCount === true) {
    store.increaseScopeUseCount(scopeName);
    onUnmounted(() => store.decreaseScopeUseCount(scopeName));
  }

  return store.retrieveScope(scopeName);
}

class UseViewPageHelper<
  T extends NonNullable<unknown>,
  TVm extends NonNullable<unknown>,
  TExtra extends NonNullable<unknown>,
> {
  Return = useViewPage<T, TVm, TExtra>('');
}

export type ViewPage<
  T extends NonNullable<unknown>,
  TVm extends NonNullable<unknown>,
  TExtra extends NonNullable<unknown> = Record<string, never>,
> = UseViewPageHelper<T, TVm, TExtra>['Return'];
