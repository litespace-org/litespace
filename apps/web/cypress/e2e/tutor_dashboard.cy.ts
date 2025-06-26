import { IUser } from "@litespace/types";
import { Web } from "@litespace/utils/routes";


describe("", ()=> {
    beforeEach(() => {
        cy.flush();
        cy.execute("users:create", {
            role: IUser.Role.Student, 
            email: "test@litespace.org",
            password: "Password@9",
        }).as("student");
        cy.login("test@litespace.org", "Password@9");
    })

    it("should", ()=> {
        cy.get("[data_test_id='tutor-dashboard.overview.students']").should("have.text", "0`");
    })
})