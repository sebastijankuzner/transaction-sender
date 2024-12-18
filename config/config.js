import crypto from "@mainsail/core/bin/config/testnet/core/crypto.json" with { type: "json" };

const config = {
    senderPassphrase:
        "bullet mean oxygen possible quiz body range ozone quantum elevator inspire cute inject work estate century must this defy siren aisle rich churn explain", // REPLACE senderPassphrase WITH THE PASSPHRASE OF YOUR WALLET
    peer: {
        apiTxPoolUrl: "http://127.0.0.1:4007",
        apiEvmUrl: "http://127.0.0.1:4008",
    },
    crypto: crypto,
};

export default config;
