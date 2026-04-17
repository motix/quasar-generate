import { ref } from 'vue';

import { Dialog } from 'quasar';

import type { FormOptions } from 'vee-validate';
import { useForm } from 'vee-validate';
import type { Schema } from 'yup';

import type { UpdateDocActionPayload } from 'stores/firebase-firestore/index.js';

import useNotifications from 'composables/useNotifications.js';
import useScroll from 'composables/useScroll.js';

import type usePageData from './usePageData.js';
import type { UsePageDataHelper } from './usePageData.js';
import type usePageStatus from './usePageStatus.js';

export default function useEditor<TVm extends NonNullable<unknown>>(
  freezed: ReturnType<typeof usePageStatus>['freezed'],
  muteRealtimeUpdate: ReturnType<typeof usePageStatus>['muteRealtimeUpdate'],
  delayRealtimeUpdate: ReturnType<typeof usePageStatus>['delayRealtimeUpdate'],
  editMode: ReturnType<typeof usePageStatus>['editMode'],
  isDirty: ReturnType<typeof usePageStatus>['isDirty'],
  docKey: ReturnType<typeof usePageData>['docKey'],
  viewModel: UsePageDataHelper<never, TVm>['Return']['viewModel'],
  updateModel: UsePageDataHelper<never, TVm>['Return']['updateModel'],
  getModelAndViewModel: ReturnType<typeof usePageData>['getModelAndViewModel'],
) {
  // Private

  class UseFormHelper<K extends keyof TVm> {
    Return = useForm<Pick<TVm, K>>();
  }
  type UseFormResult<K extends keyof TVm> = UseFormHelper<K>['Return'];

  let internalValidate: UseFormResult<never>['validate'] | null = null;
  let internalCustomValidate: (() => Promise<boolean>) | null = null;

  async function validate() {
    let isValid = true;

    if (internalValidate) {
      isValid &&= (await internalValidate()).valid;
    }

    if (internalCustomValidate) {
      isValid &&= await internalCustomValidate();
    }

    return isValid;
  }

  // Composables

  const { notifyErrorDebug, notifyValidationError, notifySaveDataSuccess, notifySaveDataError } =
    useNotifications();

  const { toTop: scrollToTop } = useScroll();

  // Data

  const editorSaving = ref(false);

  // Methods

  function useValidationForm<T, K extends keyof T>(
    validationSchema: Schema<Pick<T, K>>,
    values: T | null,
    ...initialValuesKeys: K[]
  ) {
    const initialValues = values
      ? (Object.fromEntries(initialValuesKeys.map((key) => [key, values[key]])) as FormOptions<
          Pick<T, K>
        >['initialValues'])
      : undefined;

    return useForm<Pick<T, K>>({
      validationSchema,
      initialValues,
    });
  }

  function useValidation<K extends keyof TVm>(
    validationSchema: Schema<Pick<TVm, K>>,
    ...initialValuesKeys: K[]
  ) {
    const result = useValidationForm(validationSchema, viewModel.value, ...initialValuesKeys);

    internalCustomValidate = null;
    internalValidate = result.validate;
  }

  function useCustomValidation(customValidate: typeof internalCustomValidate) {
    internalValidate = null;
    internalCustomValidate = customValidate;
  }

  function edit() {
    editMode.value = true;
    scrollToTop();
  }

  function exitEditMode() {
    isDirty.value = false;
    editMode.value = false;
    scrollToTop();
  }

  async function editorSave() {
    docKey.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] docKey not specified');
      })();
    viewModel.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] viewModel not specified');
      })();
    updateModel.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] updateModel not specified');
      })();

    freezed.value = true;
    editorSaving.value = true;

    const isValid = await validate();

    if (!isValid) {
      notifyValidationError();

      editorSaving.value = false;
      freezed.value = false;
      return;
    }

    muteRealtimeUpdate.value = true;
    delayRealtimeUpdate.value = true;

    const payload: UpdateDocActionPayload<TVm> = {
      docKey: docKey.value,
      doc: viewModel.value,
      isViewModel: true,
    };

    try {
      await updateModel.value(payload);
    } catch (error) {
      console.error(error);
      notifySaveDataError();
      notifyErrorDebug(error);

      muteRealtimeUpdate.value = false;
      delayRealtimeUpdate.value = false;
      editorSaving.value = false;
      freezed.value = false;
      return;
    }

    notifySaveDataSuccess();

    editorSaving.value = false;
    freezed.value = false;

    exitEditMode();
    delayRealtimeUpdate.value = false;
  }

  function revert() {
    if (isDirty.value) {
      Dialog.create({
        title: 'Revert',
        message: 'Are you sure want to discard all changes?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        exitEditMode();
        getModelAndViewModel(false);
      });
    } else {
      exitEditMode();
    }
  }

  return {
    editorSaving,
    useValidationForm,
    useValidation,
    useCustomValidation,
    edit,
    exitEditMode,
    editorSave,
    revert,
  };
}
