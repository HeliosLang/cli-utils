import { StringWriter } from "@helios-lang/codec-utils"
import { ArgReader } from "./ArgReader.js"

/**
 * @typedef {import("./ArgReader.js").ArgReaderLike} ArgReaderLike
 * @typedef {import("./OptionConfig.js").OptionConfig} OptionConfig
 */

/**
 * @template {OptionConfig} C
 * @typedef {import("./OptionConfig.js").OptionType<C>} OptionType
 */

/**
 * @template {{[arg: string]: OptionConfig}} O
 * @template {{[name: string]: Command<any, any>}} S
 * @typedef {{
 *   options?: O
 *   minArgs?: number
 *   maxArgs?: number
 *   action(args: string[], options: {
 *      [D in keyof O]: OptionType<O[D]>
 *    }): Promise<void>
 * } | {
 *   commands: S
 * }} CommandConfig
 */

/**
 * @template {{[arg: string]: OptionConfig}} O
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
        const w = new StringWriter()

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

                if (opt.kind == "flag") {
                    w.writeLine(
                        `  ${opt.long}${opt.short ? `, ${opt.short}` : ""}`
                    )
                } else if (opt.kind == "string") {
                    w.writeLine(
                        `  ${opt.long}${opt.short ? `, ${opt.short}` : ""} <${key}>`
                    )
                } else if (opt.kind == "enum") {
                    w.writeLine(
                        `  ${opt.long}${opt.short ? `, ${opt.short}` : ""} <${opt.variants.join(" | ")}>`
                    )
                } else {
                    throw new Error("unhandled option kind")
                }
            }
        }

        return w.finalize()
    }

    /**
     * @param {ArgReaderLike} args - all cli args minus the env/binary name
     * @returns {Promise<void>}
     */
    async run(args) {
        const r = ArgReader.new(args)

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

                    if (opt.kind == "flag") {
                        optionalArgs[key] = r.readFlag(opt.long, opt.short)
                    } else if (opt.kind == "string") {
                        optionalArgs[key] = r.readOption(
                            opt.long,
                            opt.short,
                            opt.default
                        )
                    } else if (opt.kind == "enum") {
                        optionalArgs[key] = r.readOptionalEnum(
                            opt.long,
                            opt.short,
                            opt.variants,
                            opt.default
                        )
                    } else {
                        throw new Error("unhandled option type")
                    }
                }
            }

            return this.config.action(r.readRest(), optionalArgs)
        }
    }
}
