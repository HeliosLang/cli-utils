import { describe, it } from "node:test"
import { EnumOpt } from "./options/index.js"
import { Command } from "./Command.js"

describe(Command.name, () => {
    it("typecheck ok for enum", () => {
        /**
         * @typedef {"a" | "b" | "c"} MyEnum
         */

        const cmd = new Command({
            options: {
                myEnum: new EnumOpt({
                    long: "--my-enum",
                    variants: /** @type {MyEnum[]} */ (["a", "b", "c"]),
                    default: "a"
                })
            },
            action: async (args, options) => {
                /**
                 * @satisfies {"a" | "b" | "c"}
                 */
                const res = options.myEnum
            }
        })
    })
})
