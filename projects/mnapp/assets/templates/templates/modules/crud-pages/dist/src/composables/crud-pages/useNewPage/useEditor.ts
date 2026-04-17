import type { Ref } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import type { FormOptions } from 'vee-validate';
import { useForm } from 'vee-validate';
import type { Schema } from 'yup';

import type { CreateDocActionPayload } from 'stores/firebase-firestore/index.js';

import useNotifications from 'composables/useNotifications.js';

import type { UsePageDataHelper } from './usePageData.js';
import type usePageStatus from './usePageStatus.js';

export default function useEditor<TVm extends NonNullable<unknown>>(
  freezed: ReturnType<typeof usePageStatus>['freezed'],
  viewModel: UsePageDataHelper<TVm>['Return']['viewModel'],
  createModel: UsePageDataHelper<TVm>['Return']['createModel'],
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

  const router = useRouter();

  const {
    notifyErrorDebug,
    notifyValidationError,
    notifyCreateDataSuccessAndRedirect,
    notifyCreateDataError,
  } = useNotifications();

  // Data

  const viewUrl = ref<string | null>(null);
  const modelFindKeyField = ref<Extract<keyof TVm, string>>(
    'id' as Extract<keyof TVm, string>,
  ) as Ref<Extract<keyof TVm, string>>;
  const editorSaving = ref(false);
  const initiallyFilled = ref(false);

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

  async function editorSave() {
    viewModel.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] viewModel not specified');
      })();
    createModel.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] createModel not specified');
      })();
    viewUrl.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] viewUrl not specified');
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

    const payload: CreateDocActionPayload<TVm> = {
      doc: viewModel.value,
    };

    let newModel: TVm;
    try {
      newModel = await createModel.value(payload);
    } catch (error) {
      console.error(error);
      notifyCreateDataError();
      notifyErrorDebug(error);

      editorSaving.value = false;
      freezed.value = false;
      return;
    }

    notifyCreateDataSuccessAndRedirect();

    editorSaving.value = false;

    const newFindKey = String(newModel[modelFindKeyField.value]);
    void router.push(viewUrl.value + newFindKey.replaceAll('.', '_'));
  }

  return {
    viewUrl,
    modelFindKeyField,
    editorSaving,
    initiallyFilled,
    useValidationForm,
    useValidation,
    useCustomValidation,
    editorSave,
  };
}
