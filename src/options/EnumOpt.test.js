import { describe, it } from "node:test"
import { ArgReader } from "../ArgReader.js"
import { EnumOpt } from "./EnumOpt.js"

describe(EnumOpt.name, () => {
    it("typecheck ok", () => {
        const opt = new EnumOpt({
            long: "--my-enum",
            variants: /** @type {["a", "b"]} */ (["a", "b"]),
            default: "a"
        })

        const r = ArgReader.new(["--my-enum", "b"])

        /**
         * @satisfies {"a" | "b"}
         */
        const res = opt.read(r)
    })
})
