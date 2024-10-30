import { diff } from "@/diff";
import { expect } from "chai";
describe("Difference", () => {
    it("should find the difference between two objects", () => {
        expect(diff({ name: "Jone" }, { name: "Jone Doe" })).to.be.deep.eq({
            name: "Jone",
        });
        expect(diff({ age: 21 }, { name: "Jone", age: 22, gender: "male" })).to.be.deep.eq({ age: 21 });
    });
    it("should ignore undefined target fields", () => {
        expect(diff({
            name: null,
            email: null,
            age: undefined,
        }, {
            name: undefined,
            email: "you@example.com",
            age: 21,
        })).to.be.deep.eq({
            name: null,
            email: null,
        });
    });
});
//# sourceMappingURL=diff.test.js.map