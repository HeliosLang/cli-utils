import { basename } from "node:path"
import { exit } from "node:process"
import { StringWriter } from "@helios-lang/codec-utils"
import { CliError } from "./CliError.js"
import { Command } from "./Command.js"

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
     * @type {string}
     */
    name

    /**
     * @readonly
     * @type {Command<O, S>}
     */
    entryPoint

    /**
     * @param {string} name
     * @param {CommandConfig<O, S>} config
     */
    constructor(name, config) {
        this.name = name
        this.entryPoint = new Command(config)
    }

    /**
     * @type {string}
     */
    get help() {
        const w = new StringWriter()

        w.writeLine(`${this.name} help: show this message`)
        w.writeLine(this.entryPoint.makeHelp([this.name]))

        return w.finalize()
    }

    /**
     * @type {string}
     */
    get version() {
        return process.env.npm_package_version ?? "n/a"
    }

    /**
     * @param {string[]} rawArgs
     * @returns {Promise<void>}
     */
    async run(rawArgs = process.argv) {
        const i = rawArgs.findIndex((arg) => basename(arg).includes(this.name))

        if (i == -1) {
            throw new Error(
                `Internal error: Cli name ${this.name} doesn't correspond with binary name`
            )
        }

        const args = rawArgs.slice(i + 1)

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
