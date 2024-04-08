import { ArgReader } from "../ArgReader.js"

/**
 * @typedef {import("./Opt.js").OptConfig} OptConfig
 */

/**
 * @template T
 * @typedef {import("./Opt.js").Opt<T>} Opt
 */

/**
 * @typedef {OptConfig} FlagOptConfig
 */

/**
 * @implements {Opt<boolean>}
 */
export class FlagOpt {
    /**
     * @param {FlagOptConfig} config
     */
    constructor({ long, short, description }) {
        this.long = long
        this.short = short
        this.description = description
    }

    /**
     * @returns {string}
     */
    makeHelp() {
        return `${this.long}${this.short ? `, ${this.short}` : ""}`
    }

    /**
     * @param {ArgReader} r
     * @returns {boolean}
     */
    read(r) {
        return r.readFlag(this.long, this.short)
    }
}

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
        return `${this.long}${this.short ? `, ${this.short}` : ""} <arg> ${this.description}`
    }

    /**
     *
     * @param {ArgReader} r
     */
    read(r) {
        return r.readOption(this.long, this.short, this.default)
    }
}
