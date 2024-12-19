import { makeApplication } from "./boot.js";
import { loadConfig } from "./loader.js";
import * as Client from "./client.js";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { generateMnemonic } from "bip39";
import { Application } from "@mainsail/kernel";
import { Helper } from "./helpers.js";
import { Peer } from "./types.js";
import DARK20 from "./builds/DARK20.json" with { type: "json" };
import AllowPayment from "./builds/AllowPayment.json" with { type: "json" };
import RejectWithError from "./builds/RejectWithError.json" with { type: "json" };
import RejectWithMessage from "./builds/RejectWithMessage.json" with { type: "json" };
import { getContractAddress } from "viem";

const GAS_PRICE = 1;
const GENESIS_PASSPHRASE =
    "bullet mean oxygen possible quiz body range ozone quantum elevator inspire cute inject work estate century must this defy siren aisle rich churn explain";
let genesisAddress = "";
let genesisNonce = 0;
let validators = [];

let app!: Application;
let helper!: Helper;
let peer!: Peer;
let addressFactory!: Contracts.Crypto.AddressFactory;

// Call deploy to fill addresses
let ERC20Address!: string;
let allowPaymentAddress!: string;
let rejectWithErrorAddress!: string;
let rejectWithMessageAddress!: string;

const main = async () => {
    await init();
    await deployContracts();
    // await runTransfers();
};

const init = async () => {
    const config = loadConfig();
    peer = config.cli.peer;

    console.log(`Interacting with peer: ${peer.apiEvmUrl}`);

    app = await makeApplication(config);
    addressFactory = app.getTagged<Contracts.Crypto.AddressFactory>(
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

const deployContracts = async () => {
    console.log("--------------------------------");
    console.log("----------D E P L O Y-----------");
    console.log("--------------------------------");

    const deployERC20 = await helper.makeDeploy({
        passphrase: GENESIS_PASSPHRASE,
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
        payload: DARK20.bytecode,
        gasLimit: 2000000,
    });

    ERC20Address = getContractAddress({
        from: deployERC20.data.senderAddress as any,
        nonce: deployERC20.data.nonce.toBigInt(),
    });

    console.log(`DEPLOY ERC20 to address ${ERC20Address} should PASS. TX ${deployERC20.id}`);
    await Client.postTransaction(peer, deployERC20);

    const deployAllowPayment = await helper.makeDeploy({
        passphrase: GENESIS_PASSPHRASE,
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
        payload: AllowPayment.bytecode,
        gasLimit: 2000000,
    });

    allowPaymentAddress = getContractAddress({
        from: deployAllowPayment.data.senderAddress as any,
        nonce: deployAllowPayment.data.nonce.toBigInt(),
    });

    console.log(`DEPLOY AllowPayment to address ${allowPaymentAddress} should PASS. TX ${deployAllowPayment.id}`);
    await Client.postTransaction(peer, deployAllowPayment);

    const deployRejectWithError = await helper.makeDeploy({
        passphrase: GENESIS_PASSPHRASE,
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
        payload: RejectWithError.bytecode,
        gasLimit: 2000000,
    });

    rejectWithErrorAddress = getContractAddress({
        from: deployRejectWithError.data.senderAddress as any,
        nonce: deployRejectWithError.data.nonce.toBigInt(),
    });

    console.log(
        `DEPLOY RejectWithError to address ${rejectWithErrorAddress} should PASS. TX ${deployRejectWithError.id}`,
    );
    await Client.postTransaction(peer, deployRejectWithError);

    const deployRejectWithMessage = await helper.makeDeploy({
        passphrase: GENESIS_PASSPHRASE,
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
        payload: RejectWithMessage.bytecode,
        gasLimit: 2000000,
    });

    rejectWithMessageAddress = getContractAddress({
        from: deployRejectWithError.data.senderAddress as any,
        nonce: deployRejectWithError.data.nonce.toBigInt(),
    });

    console.log(
        `DEPLOY RejectWithMessage to address ${rejectWithMessageAddress} should PASS. TX ${deployRejectWithMessage.id}`,
    );
    await Client.postTransaction(peer, deployRejectWithError);
};

const runTransfers = async () => {
    console.log("--------------------------------");
    console.log("---------T R A N S F E R--------");
    console.log("--------------------------------");

    const transferToSelf = await helper.makeTx({
        passphrase: GENESIS_PASSPHRASE,
        to: genesisAddress,
        amount: "1",
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
    });

    console.log(`Sending to self ${genesisAddress} should PASS. TX ${transferToSelf.id}`);
    await Client.postTransaction(peer, transferToSelf);

    const hotWallet = validators[1];
    const transferToHotWallet = await helper.makeTx({
        passphrase: GENESIS_PASSPHRASE,
        to: hotWallet,
        amount: "1",
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
    });

    console.log(`Sending to hot wallet ${hotWallet} should PASS. TX ${transferToHotWallet.id}`);
    await Client.postTransaction(peer, transferToHotWallet);

    const coldWallet = await addressFactory.fromMnemonic(generateMnemonic(256));
    const transferToColdWallet = await helper.makeTx({
        passphrase: GENESIS_PASSPHRASE,
        to: hotWallet,
        amount: "1",
        nonce: genesisNonce++,
        gasPrice: GAS_PRICE,
    });

    console.log(`Sending to cold wallet ${coldWallet} should PASS. TX ${transferToColdWallet.id}`);
    await Client.postTransaction(peer, transferToColdWallet);
};

main();
