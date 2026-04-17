import { Notify } from 'quasar';

export default function () {
  // Methods

  function notifyErrorDebug(error: unknown) {
    process.env.DEBUGGING &&
      Notify.create({
        message: `[DEBUGGING] ${(error as Error).message || String(error)}`,
        type: 'negative',
        color: 'grey-6',
        timeout: 0,
        actions: [{ label: 'Dismiss', color: 'dark' }],
      });
  }

  function notifyLoadDataError() {
    Notify.create({
      message: 'Load data error. Refresh the page to try again or contact support.',
      type: 'negative',
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  function notifyValidationError() {
    Notify.create({
      message: 'Invalid data input. Please revise marked fields.',
      type: 'negative',
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  function notifyCreateDataSuccessAndRedirect() {
    Notify.create({
      message: 'Data created successfully. Redirected to details page.',
      type: 'positive',
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  function notifyCreateDataError() {
    Notify.create({
      message: 'Create data error. Refresh the page to try again or contact support.',
      type: 'negative',
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  function notifySaveDataSuccess() {
    Notify.create({
      message: 'Data saved successfully.',
      type: 'positive',
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  function notifySaveDataError() {
    Notify.create({
      message: 'Save data error. Refresh the page to try again or contact support.',
      type: 'negative',
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  function notifyDeleteDataSuccessAndRedirect() {
    Notify.create({
      message: 'Data deleted successfully. Redirecting to list page.',
      type: 'positive',
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  function notifyDeleteDataError() {
    Notify.create({
      message: 'Delete data error. Refresh the page to try again or contact support.',
      type: 'negative',
      actions: [{ icon: 'close', color: 'white' }],
    });
  }

  return {
    notifyErrorDebug,
    notifyLoadDataError,
    notifyValidationError,
    notifyCreateDataSuccessAndRedirect,
    notifyCreateDataError,
    notifySaveDataSuccess,
    notifySaveDataError,
    notifyDeleteDataSuccessAndRedirect,
    notifyDeleteDataError,
  };
}
