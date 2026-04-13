/* eslint-disable @typescript-eslint/no-explicit-any */

export default function extensionRegistered<
  TBase extends (...args: any[]) => any,
  TExtension extends ($p: ReturnType<TBase>) => any,
>(
  list: (($p: ReturnType<TBase>) => void)[],
  extension: TExtension,
  errorMessage?: string,
): list is (($p: ReturnType<TBase> & ReturnType<TExtension>) => void)[] {
  return (
    list.includes(extension) ||
    (() => {
      throw new Error(errorMessage || `Extension '${extension.name}' is not registered`);
    })()
  );
}
