import crypto from "@mainsail/core/bin/config/testnet/core/crypto.json" with { type: "json" };
import validators from "@mainsail/core/bin/config/testnet/core/validators.json" with { type: "json" };

const config = {
    peer: {
        apiTxPoolUrl: "http://127.0.0.1:4007",
        apiEvmUrl: "http://127.0.0.1:4008",
    },
    validatorPassphrases: validators.secrets,
    crypto: crypto,
};

export default config;
