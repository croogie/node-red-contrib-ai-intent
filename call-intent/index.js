const PubSub = require("pubsub-js");
const { INTENT_STORE, ACTIVE_CONVERSATION } = require("../constants");

module.exports = function (RED) {
  function CallIntentHandlerNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on("input", function (msg) {
      const globalContext = node.context().global;
      const context = globalContext.get(INTENT_STORE) || {};
      const intentId = config.intentId || msg.payload?.intentId || "";
      const message = config.message || msg.payload?.message || "";
      console.log("config: ", config);
      if (!intentId) {
        return node.error("Missing intent id");
      } else if (!context[intentId]) {
        node.warn("There is no registered intent with id: ", intentId);
        return node.send(msg);
      }
      const payload = context[intentId];

      console.log(payload);

      if (payload.enableConversation) {
        globalContext.set(ACTIVE_CONVERSATION, intentId);
      }

      msg.payload = { ...payload, message };
      PubSub.publishSync(intentId, msg);
      node.send(msg);
    });
  }

  RED.nodes.registerType("Call Intent", CallIntentHandlerNode);
};