export {}

/**
 * @typedef {import("../ArgReader.js").ArgReader} ArgReader
 */

/**
 * @template {Opt<any>} C
 * @typedef {C extends Opt<infer R> ? R : never} OptType
 */

/**
 * @typedef {{
 *   long: string
 *   short?: string
 *   description?: string
 * }} OptConfig
 */

/**
 * @template T
 * @typedef {{
 *   makeHelp(): string
 *   read(r: ArgReader): T
 * }} Opt
 */
