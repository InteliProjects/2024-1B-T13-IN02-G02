const assert = require("assert");
const controller = require("../../../api/controllers/DoneFilesController");
const sinon = require("sinon");
const { RESPONSE, mockAsync } = require("../../util/utils");
const { DONE_FILE } = require("../../util/doneFile");
const jwt = require('jsonwebtoken');
const { debug } = require("console");


describe("DoneFilesController", () => {
    let findOneStub;
    let createStub;
    let jwtVerifyStub;
    beforeEach(() => {
        sinon.resetHistory();
        sinon.restore();
        findOneStub = null;
        createStub = null;
        jwtVerifyStub = null;
    })
    afterEach(() => {
        if (findOneStub) findOneStub.restore();
        if (createStub) createStub.restore();
        RESPONSE.ok.resetHistory();
        RESPONSE.badRequest.resetHistory();
        RESPONSE.serverError.resetHistory();
        
    });

    it("Deve retornar erro se fileId ou userId não forem fornecidos", async() => {
        const req = {
            body: {
                userId: "1",
            },
        };

        await controller.doneFile(req, RESPONSE);

        assert.strictEqual(RESPONSE.badRequest.calledOnce, true);
        assert.strictEqual(RESPONSE.badRequest.firstCall.args[0].error, 'As informações Arquivo são obrigatórias.');
    });

    it("Deve retornar erro se o arquivo já estiver marcado como feito", async() => {
        findOneStub = mockAsync(DoneFile, "findOne", DONE_FILE);
        jwtVerifyStub = sinon.stub(jwt, "verify").callsFake(() => {
            return { id: "1"};
        });

        const req = {
            body: {
                fileId: "1",
                userId: "1",
            },
            headers: {
                authorization: "JSON Web Token"
            }
        };

        await controller.doneFile(req, RESPONSE)
        debug("Teste de debug " + RESPONSE.ok.firstCall.args[0])
        assert.deepStrictEqual(RESPONSE.ok.firstCall.args[0], { doneFile: false, success: true });
    });

    it("Deve marcar o arquivo como feito com sucesso", async() => {
        findOneStub = mockAsync(DoneFile, "findOne", null);
        createStub = sinon.stub(DoneFile, "create").returns({
            fetch: sinon.stub().resolves({
                file: "1",
                user: "1"
            })
        });
        jwtVerifyStub = sinon.stub(jwt, "verify").callsFake(() => {
            return { id: "1"};
        });
        const req = {
            body: {
                fileId: "1",
                userId: "1",
            },
            headers: {
                authorization: "JSON Web Token"
            }
        };

        await controller.doneFile(req, RESPONSE);
        assert.deepStrictEqual(RESPONSE.ok.firstCall.args[0], { doneFile: true, success: true });
    });
});
