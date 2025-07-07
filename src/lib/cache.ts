import { unstable_cache as nextCache } from "next/cache"
import { cache as reactCache } from "react"

type AsyncFn<Args extends any[], Result> = (...args: Args) => Promise<Result>

export function cache<Args extends any[], Result>(
  fn: AsyncFn<Args, Result>,
  keyParts: string[],
  options: { revalidate?: number | false; tags?: string[] } = {}
): AsyncFn<Args, Result> {
  const reactCached = reactCache(fn)
  return nextCache(reactCached, keyParts, options)
}
