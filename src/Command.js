import { makeStringWriter } from "@helios-lang/codec-utils"
import { makeArgReader } from "./ArgReader.js"

/**
 * @typedef {import("./ArgReader.js").ArgReader} ArgReader
 * @typedef {import("./ArgReader.js").ArgReaderLike} ArgReaderLike
 */

/**
 * @template T
 * @typedef {import("./options/index.js").Opt<T>} Opt
 */

/**
 * @template {Opt<any>} O
 * @typedef {import("./options/index.js").OptType<O>} OptType
 */

/**
 * @template {{[arg: string]: Opt<any>}} O
 * @template {{[name: string]: Command<any, any>}} S
 * @typedef {{
 *   options?: O
 *   minArgs?: number
 *   maxArgs?: number
 *   action(args: string[], options: {
 *      [D in keyof O]: OptType<O[D]>
 *    }): Promise<void>
 * } | {
 *   commands: S
 * }} CommandConfig
 */

/**
 * @template {{[arg: string]: Opt<any>}} O
 * @template {{[name: string]: Command<any, any>}} S
 */
export class Command {
    /**
     * @readonly
     * @type {CommandConfig<O, S>}
     */
    config

    /**
     * @param {CommandConfig<O, S>} config
     */
    constructor(config) {
        this.config = config
    }

    /**
     * @param {string[]} route
     * @returns {string}
     */
    makeHelp(route) {
        const w = makeStringWriter()

        if ("commands" in this.config) {
            for (let key in this.config.commands) {
                w.writeLine(
                    this.config.commands[key].makeHelp(route.concat([key]))
                )
            }
        } else {
            w.writeLine(
                `${route.join(" ")} [options]${this.config.minArgs ? " args" : ""}`
            )

            for (let key in this.config.options) {
                const opt = this.config.options[key]
                w.writeLine(`  ${opt.makeHelp()}`)
            }
        }

        return w.finalize()
    }

    /**
     * @param {ArgReaderLike} args - all cli args minus the env/binary name
     * @returns {Promise<void>}
     */
    async run(args) {
        const r = makeArgReader({ args })

        if ("commands" in this.config) {
            const name = r.readEnum(Object.keys(this.config.commands))

            const cmd = this.config.commands[name]

            return cmd.run(r)
        } else {
            /**
             * @type {any}
             */
            let optionalArgs = {}

            if (this.config.options) {
                for (let key in this.config.options) {
                    const opt = this.config.options[key]
                    optionalArgs[key] = opt.read(r)
                }
            }

            return this.config.action(r.readRest(), optionalArgs)
        }
    }
}
