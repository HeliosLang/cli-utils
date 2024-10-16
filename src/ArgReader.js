import { CliError } from "./CliError.js"

/**
 * @typedef {string[] | ArgReader} ArgReaderLike
 */

/**
 * @typedef {{
 *   readEnum(list: string[]): string
 *   readFlag(long: string, short: string | undefined): boolean
 *   readOption(long: string, short: string | undefined, def: string | (() => string) | undefined): string
 *   readOptionalEnum(long: string, short: string | undefined, variants: string[], def: (string | (() => string))): string
 *   readPositional(): string
 *   readRest(): string[]
 * }} ArgReader
 */

/**
 * @param {{args: ArgReaderLike}} props
 * @returns {ArgReader}
 */
export function makeArgReader(props) {
    if (Array.isArray(props.args)) {
        return new ArgReaderImpl(props.args)
    } else {
        return props.args
    }
}

/**
 * @implements {ArgReader}
 */
class ArgReaderImpl {
    /**
     * @private
     * @type {string[]}
     */
    _args

    /**
     * @private
     * @type {Set<number>}
     */
    _used

    /**
     * @param {string[]} args
     */
    constructor(args) {
        this._args = args
        this._used = new Set()
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
     * @param {string | undefined} short
     * @returns {boolean}
     */
    readFlag(long, short) {
        const i = this.findFlag(long, short)

        if (i >= 0) {
            this._used.add(i)
            return true
        } else {
            return false
        }
    }

    /**
     * @param {string} long
     * @param {string | undefined} short
     * @param {string | (() => string) | undefined} def
     * @returns {string}
     */
    readOption(long, short, def) {
        const i = this.findFlag(long, short)

        if (i >= 0) {
            if (i >= this._args.length - 1) {
                throw new CliError(`expected argument after ${this._args[i]}`)
            }

            if (this._used.has(i + 1)) {
                throw new CliError(
                    `expected optional argument after ${this._args[i]} (argument already consumed)`
                )
            }

            this._used.add(i)
            this._used.add(i + 1)

            return this._args[i + 1]
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
     * @param {string | undefined} short
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
        for (let i = 0; i < this._args.length; i++) {
            if (this._used.has(i)) {
                continue
            }

            const arg = this._args[i]

            if (arg.startsWith("-")) {
                continue
            }

            this._used.add(i)
            return arg
        }

        throw new CliError("expected another argument")
    }

    /**
     * @returns {string[]}
     */
    readRest() {
        const rest = []

        for (let i = 0; i < this._args.length; i++) {
            if (this._used.has(i)) {
                continue
            }

            const arg = this._args[i]

            if (arg.startsWith("-")) {
                throw new CliError(`unrecognized flag ${arg}`)
            }

            this._used.add(i)
            rest.push(arg)
        }

        return rest
    }

    /**
     * @private
     * @param {string} long
     * @param {string | undefined} short - short name is optional
     * @returns {number} - returns -1 if not found
     */
    findFlag(long, short) {
        const il = this._args.indexOf(long)
        const is = short ? this._args.indexOf(short) : -1

        if (il >= 0 && is >= 0) {
            throw new CliError(
                `can't mix short and long flags (${long} and ${short}))`
            )
        }

        const i = il >= 0 ? il : is

        if (i >= 0) {
            if (this._used.has(i)) {
                throw new Error(
                    `internal error: arg ${this._args[i]} already used`
                )
            }

            this._args.forEach((arg, j) => {
                if ((arg == long || arg == short) && j != i) {
                    throw new CliError(`duplicate flag ${arg}`)
                }
            })
        }

        return i
    }
}
