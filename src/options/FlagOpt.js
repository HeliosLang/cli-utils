/**
 * @typedef {import("../ArgReader.js").ArgReader} ArgReader
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
        return `${this.long}${this.short ? `, ${this.short}` : ""} ${this.description ?? ""}`
    }

    /**
     * @param {ArgReader} r
     * @returns {boolean}
     */
    read(r) {
        return r.readFlag(this.long, this.short)
    }
}
