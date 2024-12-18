import { makeApplication } from "./boot.js";
import { loadConfig } from "./loader.js";
import * as Client from "./client.js";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Application } from "@mainsail/kernel";
import { Helper } from "./helpers.js";

const GAS_PRICE = 1;
const GENESIS_PASSPHRASE =
    "bullet mean oxygen possible quiz body range ozone quantum elevator inspire cute inject work estate century must this defy siren aisle rich churn explain";

let app!: Application;

const main = async () => {
    const config = loadConfig();
    const peer = config.cli.peer;

    console.log(`Interacting with peer: ${peer.apiEvmUrl}`);

    app = await makeApplication(config);
    const addressFactory = app.getTagged<Contracts.Crypto.AddressFactory>(
        Identifiers.Cryptography.Identity.Address.Factory,
        "type",
        "wallet",
    );

    const genesisAddress = await addressFactory.fromMnemonic(GENESIS_PASSPHRASE);
    let genesisNonce = await Client.getWalletNonce(peer, genesisAddress);

    console.log(`Genesis address: ${genesisAddress} nonce: ${genesisNonce}`);

    console.log("--------------------------------");
    console.log("---------T R A N S F E R--------");
    console.log("--------------------------------");

    const helper = new Helper(app, config);

    const transferToSelf = await helper.makeTransfer({
        passphrase: GENESIS_PASSPHRASE,
        to: genesisAddress,
        amount: "1",
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
    });

    console.log(`Sending to self ${genesisAddress} should PASS. TX ${transferToSelf.id}`);
    await Client.postTransaction(peer, transferToSelf);
};

main();
