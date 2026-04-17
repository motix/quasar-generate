import { defineBoot } from '#q-app/wrappers';

export default defineBoot(({ router }) => {
  router.beforeEach((to, from) => {
    if (
      from.meta.isNoReturnPage ||
      // from route for first page
      (from.fullPath === '/' && Object.keys(from.meta).length === 0) ||
      // Foutes from firebase-auth module of mnapp extension
      from.name === 'SignIn' ||
      from.name === 'RemoteSignIn'
    ) {
      delete to.meta.history;
      return;
    }

    if (to.meta.returnRequired) {
      const history = from.meta.history || [];

      if (!from.meta.replaceRoute) {
        if (from.meta.goingBack) {
          history.shift();
        } else {
          history.unshift(from.path);
        }
      }

      to.meta.history = history;
    }

    delete from.meta.replaceRoute;
    delete from.meta.goingBack;
  });
});
