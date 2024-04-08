import { basename } from "node:path"
import { exit } from "node:process"
import { StringWriter } from "@helios-lang/codec-utils"
import { Command } from "./Command.js"
import { CliError } from "./CliError.js"

/**
 * @template T
 * @typedef {import("./options/index.js").Opt<T>} Opt
 */

/**
 * @template {{[arg: string]: Opt<any>}} O
 * @template {{[name: string]: Command<any, any>}} S
 * @typedef {import("./Command.js").CommandConfig<O, S>} CommandConfig
 */

/**
 * @template {{[arg: string]: Opt<any>}} O
 * @template {{[name: string]: Command<any, any>}} S
 */
export class Cli {
    /**
     * @readonly
     * @type {Command<O, S>}
     */
    entryPoint

    /**
     * @param {CommandConfig<O, S>} config
     */
    constructor(config) {
        this.entryPoint = new Command(config)
    }

    /**
     * @type {string}
     */
    get help() {
        const w = new StringWriter()

        w.writeLine(`${this.binName} help: show this message`)
        w.writeLine(this.entryPoint.makeHelp([this.binName]))

        return w.finalize()
    }

    /**
     * @type {string}
     */
    get binName() {
        return basename(process.argv[1])
    }

    /**
     * @type {string}
     */
    get version() {
        return process.env.npm_package_version ?? "n/a"
    }

    /**
     * @returns {Promise<void>}
     */
    async run() {
        const args = process.argv.slice(2)

        if (args[0] == "help") {
            console.log(this.help)
        } else if (args[0] == "version") {
            console.log(this.version)
        } else {
            try {
                await this.entryPoint.run(args)
            } catch (e) {
                if (e instanceof CliError) {
                    console.error(e.message)
                    console.error(this.help)
                    exit(1)
                } else {
                    throw e
                }
            }
        }
    }
}
