// test/controllers/FavoritesController.test.js
const assert = require('assert');
const controller = require('../../../api/controllers/FavoritesController');
const sinon = require('sinon');
const { RESPONSE, mockAsync } = require('../../util/utils');
const jwt = require('jsonwebtoken');
const { debug } = require("console");

describe("FavoritesController", () => {
    let findOneStub;
    let createStub;
    let jwtVerifyStub;
    let findManualStub;
    beforeEach(() => {
        sinon.resetHistory();
        sinon.restore();
        findOneStub = null;
        createStub = null;
        jwtVerifyStub = null;
        findManualStub = null;
    });
    afterEach(() => {
        if (findOneStub) findOneStub.restore();
        if (createStub) createStub.restore();
        if (findManualStub) findManualStub.restore();
        RESPONSE.ok.resetHistory();
        RESPONSE.badRequest.resetHistory();
        RESPONSE.serverError.resetHistory();
    });

    it("Deve retornar erro se o token não for fornecido", async() => {
        const req = {
            body: {
                manualId: 1,
            },
            headers: {}
        };

        await controller.addFavorite(req, RESPONSE);

        assert.strictEqual(RESPONSE.badRequest.calledOnce, true);
        assert.strictEqual(RESPONSE.badRequest.firstCall.args[0].error, "Token não fornecido.");
    });

    it("Deve retornar erro se o manual não for encontrado", async() => {
        findManualStub = mockAsync(Manual, "findOne", null);
        jwtVerifyStub = sinon.stub(jwt, "verify").callsFake(() => {
            return { id: "1" };
        });
        const req = {
            body: {
                manualId: 1,
            },
            headers: {
                authorization: "JSON Web Token"
            }
        };

        await controller.addFavorite(req, RESPONSE);

        assert.strictEqual(RESPONSE.status.calledWith(404), true);
        assert.strictEqual(RESPONSE.json.calledWith({ error: "Manual não encontrado." }), true);
    });

    it("Deve adicionar um manual aos favoritos com sucesso", async() => {
        findManualStub = mockAsync(Manual, "findOne", { id: "1" });
        findOneStub = mockAsync(Favorite, "findOne", null);
        createStub = sinon.stub(Favorite, "create").returns({
            fetch: sinon.stub().resolves({
                id: "1",
                user: "1",
                manual: "1"
            })
        });
        jwtVerifyStub = sinon.stub(jwt, "verify").callsFake(() => {
            return { id: "1" };
        });

        const req = {
            body: {
                manualId: 1,
            },
            headers: {
                authorization: "JSON Web Token"
            }
        };

        await controller.addFavorite(req, RESPONSE);
        assert.strictEqual(RESPONSE.status.calledWith(200), true);
        assert.deepStrictEqual(RESPONSE.json.firstCall.args[0], { error: 'Manual não encontrado.' });
    });
});