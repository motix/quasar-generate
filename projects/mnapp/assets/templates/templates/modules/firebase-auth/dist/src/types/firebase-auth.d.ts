import type { UserClaims, UserRole } from 'models/firebase-auth/index.js';

declare module 'firebase/auth' {
  // ParsedToken is augmented so it actually has more members
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ParsedToken extends UserClaims {}
}

declare module 'vue-router' {
  interface RouteMeta {
    // Apply to this route only, override all parents
    anonymous?: boolean;
    // Apply to current route and its children
    requiresAuth?: boolean;
    roles?: Array<UserRole>;
  }
}
