export {}

/**
 * @typedef {{
 *   long: string
 *   short?: string
 *   description?: string
 *   minArgs?: number
 *   maxArgs?: number
 * } & ({
 *   kind: "flag"
 * } | {
 *   kind: "string"
 *   default?: string | (() => string)
 * }| {
 *   kind: "enum"
 *   variants: Array<string>
 *   default: string | (() => string)
 * })} OptionConfig
 */

/**
 * @template {OptionConfig} C
 * @typedef {C["kind"] extends "flag" ? boolean : C["kind"] extends "string" ? string : C extends {"kind": "enum", "variants": infer V} ? V : never} OptionType
 */
