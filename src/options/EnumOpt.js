/**
 * @typedef {import("../ArgReader.js").ArgReader} ArgReader
 * @typedef {import("./Opt.js").OptConfig} OptConfig
 */

/**
 * @template T
 * @typedef {import("./Opt.js").Opt<T>} Opt
 */

/**
 * @template {Array<string>} V
 * @typedef {OptConfig & {
 *   variants: V
 *   default: string | (() => string)
 * }} EnumOptConfig
 */

/**
 * @template {Array<string>} V
 * @implements {Opt<V[number]>}
 */
export class EnumOpt {
    /**
     * @param {EnumOptConfig<V>} param0
     */
    constructor({ long, short, description, variants, default: def }) {
        this.long = long
        this.short = short
        this.description = description
        this.variants = variants
        this.default = def
    }

    /**
     * @returns {string}
     */
    makeHelp() {
        return `${this.long}${this.short ? `, ${this.short}` : ""} <${this.variants.join(" | ")}> ${this.description ?? ""}`
    }

    /**
     * @param {ArgReader} r
     * @returns {V[number]}
     */
    read(r) {
        return r.readOptionalEnum(
            this.long,
            this.short,
            this.variants,
            this.default
        )
    }
}
