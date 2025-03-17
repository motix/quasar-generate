type OptionalPropertiesOf<T extends object> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
  }[keyof T],
  undefined
>;

/**
 * Helper function to assign optional properties with `undefined`
 * when `exactOptionalPropertyTypes` set to `true`.
 */
export default function <T extends object>(
  obj: T,
  props: { [key in OptionalPropertiesOf<T>]?: T[key] | undefined },
): T {
  // Since all properties of `props` are optional properties of `obj`,
  // we can asssign them all to `obj` even when they are `undefined`.
  return Object.assign(obj, props);
}
