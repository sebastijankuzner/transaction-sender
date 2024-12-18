import { Application } from "@mainsail/kernel";
import { Contracts } from "@mainsail/contracts";
import { Config } from "./types.js";
import { EvmCallBuilder } from "@mainsail/crypto-transaction-evm-call";

type TxOptions = {
    passphrase: string;
    to: string;
    amount?: string;
    nonce: number;
    gasPrice: number;
    payload?: string;
    gasLimit?: number;
};

export class Helper {
    constructor(
        private app: Application,
        private config: Config,
    ) {}

    async makeTx(options: TxOptions): Promise<Contracts.Crypto.Transaction> {
        const signed = await this.app
            .resolve(EvmCallBuilder)
            .gasPrice(options.gasPrice)
            .network(this.config.crypto.network.pubKeyHash)
            .gasLimit(options.gasLimit ?? 21000)
            .nonce(options.nonce.toString())
            .recipientAddress(options.to)
            .value(options.amount ?? "0")
            .payload(options.payload ?? "")
            .sign(options.passphrase);

        return signed.build();
    }
}
