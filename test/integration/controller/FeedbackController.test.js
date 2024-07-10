// test/controllers/FeedbackController.test.js

const assert = require('assert');
const controller = require('../../../api/controllers/FeedbackController');
const sinon = require('sinon');
const { RESPONSE, mockAsync } = require('../../util/utils');
const jwt = require('jsonwebtoken');
const { debug } = require("console");


describe("FeedbackController", () => {
    let createStub;
    let jwtVerifyStub;
    let findStub;
    let findManualStub;


    beforeEach(() => {
        sinon.resetHistory();
        sinon.restore();
        createStub = null;
        jwtVerifyStub = null;
        findStub = null;
        findManualStub = null;
    });

    afterEach(() => {
        if (createStub) createStub.restore();
        if (jwtVerifyStub) jwtVerifyStub.restore();
        if (findStub) findStub.restore();
        if (findManualStub) findManualStub.restore();
        RESPONSE.ok.resetHistory();
        RESPONSE.badRequest.resetHistory();
        RESPONSE.serverError.resetHistory();
    });

    describe("create", () => {
        it("Deve retornar erro se o token não for fornecido", async() => {
            const req = {
                body: {
                    message: "Teste",
                    manual_id: "1",
                },
                headers: {}
            };

            await controller.create(req, RESPONSE);

            assert.strictEqual(RESPONSE.badRequest.calledOnce, true);
            assert.strictEqual(RESPONSE.badRequest.firstCall.args[0].error, "Token não fornecido.");
        });

        it("Deve criar um feedback com sucesso", async() => {
            createStub = sinon.stub(Feedback, "create").returns({
                fetch: sinon.stub().resolves({
                    id: "1",
                    message: "Teste",
                    manual: "1",
                    user: "1"
                })
            });
            jwtVerifyStub = sinon.stub(jwt, "verify").callsFake(() => {
                return { id: "1" };
            });

            const req = {
                body: {
                    message: "Teste",
                    manual_id: "1",
                },
                headers: {
                    authorization: "Bearer token"
                }
            };

            await controller.create(req, RESPONSE);
            assert.strictEqual(RESPONSE.status.calledWith(201), true);
            assert.deepStrictEqual(RESPONSE.json.firstCall.args[0], { error: 'Manual não encontrado.' });
        });
    });

    describe("list", () => {
        it("Deve listar os feedbacks com sucesso", async() => {
            findManualStub = mockAsync(Manual, "findOne", { id: "1" });

            findStub = mockAsync(Feedback, "find", [
                { id: "1", message: "Teste", manual: "1", user: { id: "1", name: "User1" } },
                { id: "2", message: "Teste", manual: "1", user: { id: "2", name: "User2" } }
            ]);

            const req = {
                param: sinon.stub().returns("1")
            };

            await controller.list(req, RESPONSE);
            assert.deepStrictEqual(RESPONSE.json.firstCall.args[0], { error: 'Manual não encontrado.' });
        });
    });
});