import { makeApplication } from "./boot.js";
import { loadConfig } from "./loader.js";
import * as Client from "./client.js";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Application } from "@mainsail/kernel";
import { Helper } from "./helpers.js";
import { Peer } from "./types.js";

const GAS_PRICE = 1;
const GENESIS_PASSPHRASE =
    "bullet mean oxygen possible quiz body range ozone quantum elevator inspire cute inject work estate century must this defy siren aisle rich churn explain";
let genesisAddress = "";
let genesisNonce = 0;
// @ts-ignore
let validators = [];

let app!: Application;
let helper!: Helper;
let peer!: Peer;

const main = async () => {
    await init();
    await runTransfers();
};

const init = async () => {
    const config = loadConfig();
    peer = config.cli.peer;

    console.log(`Interacting with peer: ${peer.apiEvmUrl}`);

    app = await makeApplication(config);
    const addressFactory = app.getTagged<Contracts.Crypto.AddressFactory>(
        Identifiers.Cryptography.Identity.Address.Factory,
        "type",
        "wallet",
    );
    helper = new Helper(app, config);

    genesisAddress = await addressFactory.fromMnemonic(GENESIS_PASSPHRASE);
    genesisNonce = await Client.getWalletNonce(peer, genesisAddress);

    console.log(`Genesis address: ${genesisAddress} nonce: ${genesisNonce}`);

    validators = await Promise.all(
        config.cli.validatorPassphrases.map((passphrase) => addressFactory.fromMnemonic(passphrase)),
    );
};

const runTransfers = async () => {
    console.log("--------------------------------");
    console.log("---------T R A N S F E R--------");
    console.log("--------------------------------");

    const transferToSelf = await helper.makeTransfer({
        passphrase: GENESIS_PASSPHRASE,
        to: genesisAddress,
        amount: "1",
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
    });

    console.log(`Sending to self ${genesisAddress} should PASS. TX ${transferToSelf.id}`);
    await Client.postTransaction(peer, transferToSelf);

    const hotWallet = validators[1];
    const transferToHotWallet = await helper.makeTransfer({
        passphrase: GENESIS_PASSPHRASE,
        to: hotWallet,
        amount: "1",
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
    });

    console.log(`Sending to hot wallet ${hotWallet} should PASS. TX ${transferToHotWallet.id}`);
    await Client.postTransaction(peer, transferToHotWallet);
};

main();
