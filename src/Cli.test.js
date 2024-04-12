import { describe, it } from "node:test"
import { EnumOpt, StringOpt } from "./options/index.js"
import { Cli } from "./Cli.js"
import { strictEqual } from "node:assert"

describe(Cli.name, () => {
    let output = ""

    const cli = new Cli("hl2ts", {
        minArgs: 0,
        maxArgs: 0,
        options: {
            output: new StringOpt({
                long: "--output",
                short: "-o",
                default: () => process.cwd()
            })
        },
        action: async (args, { output: o }) => {
            output = o
        }
    })

    it("correctly parses the --output arg", async () => {
        await cli.run([
            "/usr/bin/node",
            "/home/user/src/project/node_modules/.bin/hl2ts",
            "--output",
            "./dist"
        ])

        strictEqual(output, "./dist")
    })
})
