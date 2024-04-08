import {} from "@helios-lang/type-utils"
import { CliError } from "./CliError.js"

/**
 * @typedef {string[] | ArgReader} ArgReaderLike
 */

export class ArgReader {
    /**
     * @private
     * @type {string[]}
     */
    args

    /**
     * @private
     * @type {Set<number>}
     */
    used

    /**
     * @private
     * @param {string[]} args
     */
    constructor(args) {
        this.args = args
        this.used = new Set()
    }

    /**
     * @param {ArgReaderLike} args
     * @returns {ArgReader}
     */
    static new(args) {
        if (args instanceof ArgReader) {
            return args
        } else if (Array.isArray(args)) {
            return new ArgReader(args)
        } else {
            throw new Error("unexpected argument")
        }
    }

    /**
     * @param {string[]} list
     * @returns {string}
     */
    readEnum(list) {
        const arg = this.readPositional()

        if (!list.includes(arg)) {
            throw new CliError(`expected ${list}, got ${arg}`)
        }

        return arg
    }

    /**
     * @param {string} long
     * @param {Option<string>} short
     * @returns {boolean}
     */
    readFlag(long, short) {
        const i = this.findFlag(long, short)

        if (i >= 0) {
            this.used.add(i)
            return true
        } else {
            return false
        }
    }

    /**
     * @param {string} long
     * @param {Option<string>} short
     * @param {Option<string | (() => string)>} def
     * @returns {string}
     */
    readOption(long, short, def) {
        const i = this.findFlag(long, short)

        if (i >= 0) {
            if (i >= this.args.length - 1) {
                throw new CliError(`expected argument after ${this.args[i]}`)
            }

            if (this.used.has(i + 1)) {
                throw new CliError(
                    `expected optional argument after ${this.args[i]} (argument already consumed)`
                )
            }

            this.used.add(i + 1)

            return this.args[i + 1]
        } else {
            if (def) {
                if (typeof def == "string") {
                    return def
                } else {
                    return def()
                }
            } else {
                return ""
            }
        }
    }

    /**
     * @param {string} long
     * @param {Option<string>} short
     * @param {string[]} variants
     * @param {(string | (() => string))} def
     * @returns {string}
     */
    readOptionalEnum(long, short, variants, def) {
        const opt = this.readOption(long, short, def)

        if (!variants.includes(opt)) {
            throw new CliError(`expected ${variants}, got ${opt}`)
        }

        return opt
    }

    /**
     * @returns {string}
     */
    readPositional() {
        for (let i = 0; i < this.args.length; i++) {
            if (this.used.has(i)) {
                continue
            }

            const arg = this.args[i]

            if (arg.startsWith("-")) {
                continue
            }

            this.used.add(i)
            return arg
        }

        throw new CliError("expected another argument")
    }

    /**
     * @returns {string[]}
     */
    readRest() {
        const rest = []

        for (let i = 0; i < this.args.length; i++) {
            if (this.used.has(i)) {
                continue
            }

            const arg = this.args[i]

            if (arg.startsWith("-")) {
                throw new CliError(`unrecognized flag ${arg}`)
            }

            this.used.add(i)
            rest.push(arg)
        }

        return rest
    }

    /**
     * @private
     * @param {string} long
     * @param {Option<string>} short - short name is optional
     * @returns {number} - returns -1 if not found
     */
    findFlag(long, short) {
        const il = this.args.indexOf(long)
        const is = short ? this.args.indexOf(short) : -1

        if (il >= 0 && is >= 0) {
            throw new CliError(
                `can't mix short and long flags (${long} and ${short}))`
            )
        }

        const i = il >= 0 ? il : is

        if (i >= 0) {
            if (this.used.has(i)) {
                throw new Error(
                    `internal error: arg ${this.args[i]} already used`
                )
            }

            this.args.forEach((arg, j) => {
                if ((arg == long || arg == short) && j != i) {
                    throw new CliError(`duplicate flag ${arg}`)
                }
            })
        }

        return i
    }
}
