/**
 * @typedef {import("../ArgReader.js").ArgReader} ArgReader
 * @typedef {import("./Opt.js").OptConfig} OptConfig
 */

/**
 * @template T
 * @typedef {import("./Opt.js").Opt<T>} Opt
 */

/**
 * @typedef {OptConfig & {
 *   default?: string | (() => string)
 * }} StringOptConfig
 */

/**
 * @implements {Opt<string>}
 */
export class StringOpt {
    /**
     * @param {StringOptConfig} param0
     */
    constructor({ long, short, description, default: def }) {
        this.long = long
        this.short = short
        this.description = description
        this.default = def
    }

    /**
     * @returns {string}
     */
    makeHelp() {
        return `${this.long}${this.short ? `, ${this.short}` : ""} <arg> ${this.description ?? ""}`
    }

    /**
     *
     * @param {ArgReader} r
     */
    read(r) {
        return r.readOption(this.long, this.short, this.default)
    }
}
