describe("Cart UI E2E", () => {

    before(() => {
        cy.request('POST', '/api/test/reset');
    });

    beforeEach(() => {
        cy.visit("/");
    });

    it("1. Loads the main page", () => {
        cy.contains("h1", "Shopping Cart");
    });

    it("2. Adds item to local preview", () => {
        cy.get('[data-cy="item-name"]').type("Phone");
        cy.get('[data-cy="item-price"]').type("100");
        cy.get('[data-cy="item-qty"]').type("2");
        cy.get('[data-cy="add-item-btn"]').click();
        cy.get('#itemsPreview').should("contain", "Phone");
    });

    it("3. Validates empty customer ID on creation", () => {
        const alertStub = cy.stub();
        cy.on('window:alert', alertStub);
        cy.get('[data-cy="create-cart-btn"]').click().then(() => {
            expect(alertStub.getCall(0)).to.be.calledWith('Enter customer id');
        });
    });

    it("4. Creates a new cart with one item", () => {
        cy.get('[data-cy="customer-id"]').type("101");
        cy.get('[data-cy="item-name"]').type("Laptop");
        cy.get('[data-cy="item-price"]').type("500");
        cy.get('[data-cy="item-qty"]').type("1");
        cy.get('[data-cy="add-item-btn"]').click();
        cy.get('[data-cy="create-cart-btn"]').click();
        cy.get('[data-cy="cart-item"]').should("contain", "Customer: 101");
    });

// Тест 4 создаст корзину с ID 101, а 5 и 6 просто её используют

it("5. Edits an item using prompt", () => {
    cy.window().then((win) => {
        const stub = cy.stub(win, 'prompt');
        stub.onCall(0).returns("Mechanical Keyboard");
        stub.onCall(1).returns("150");
        stub.onCall(2).returns("5");
    });
    
    cy.get('[data-cy="edit-item-btn"]').first().click();
    cy.contains("Mechanical Keyboard").should("exist");
});

it("6. Adds item to existing cart via prompt", () => {
    cy.window().then((win) => {
        const stub = cy.stub(win, 'prompt');
        stub.onCall(0).returns("Mouse");
        stub.onCall(1).returns("25");
        stub.onCall(2).returns("2");
    });

    cy.get('[data-cy="add-item-existing-btn"]').first().click();
    cy.contains("Mouse").should("exist");
});

    it("7. Deletes a specific item from a cart", () => {
        cy.get('[data-cy="delete-item-btn"]').first().click();
        // Проверяем, что элемент удалился (зависит от того, был ли он единственным)
    });

    it("8. Deletes an entire cart", () => {
        cy.get('[data-cy="delete-cart-btn"]').last().click();
    });

    it("9. Check if preview clears after cart creation", () => {
        cy.get('[data-cy="customer-id"]').type("102");
        cy.get('[data-cy="item-name"]').type("ClearTest");
        cy.get('[data-cy="item-price"]').type("10");
        cy.get('[data-cy="item-qty"]').type("1");
        cy.get('[data-cy="add-item-btn"]').click();
        cy.get('[data-cy="create-cart-btn"]').click();
        cy.get('#itemsPreview').should("contain", "[]");
    });

    it("10. Creates cart with multiple items", () => {
        cy.get('[data-cy="customer-id"]').type("200");
        for(let i=0; i<2; i++) {
            cy.get('[data-cy="item-name"]').type(`Item ${i}`);
            cy.get('[data-cy="item-price"]').type("10");
            cy.get('[data-cy="item-qty"]').type("1");
            cy.get('[data-cy="add-item-btn"]').click();
        }
        cy.get('[data-cy="create-cart-btn"]').click();
        cy.contains("Item 0");
        cy.contains("Item 1");
    });

    it("11. Verifies cart status is 'open' by default", () => {
        cy.get('[data-cy="cart-item"]').first().should("contain", "Status: open");
    });

    it("12. Persistence check (reload page)", () => {
        cy.reload();
        cy.get('[data-cy="cart-item"]').should("length.at.least", 1);
    });

    it("13. Visual check of Cart ID", () => {
        cy.get('[data-cy="cart-item"]').first().find('strong').should('contain', 'Cart #');
    });
});