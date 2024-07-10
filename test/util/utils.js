const sinon = require('sinon');
const RESPONSE = {
    ok: sinon.stub(),
    badRequest: sinon.stub(),
    notFound: sinon.stub(),
    serverError: sinon.stub(),
    status: sinon.stub().returnsThis(),
    json: sinon.stub().returnsThis(),
}
const mockAsync = (model, module, result = null) => {
    return sinon.stub(model, module).resolves(result);
  };

module.exports = {
    mockAsync,
    RESPONSE,
}