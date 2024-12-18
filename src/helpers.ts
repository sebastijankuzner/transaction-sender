import { Application } from "@mainsail/kernel";
import { Config } from "./types.js";
import { EvmCallBuilder } from "@mainsail/crypto-transaction-evm-call";

type TransferOptions = {
    passphrase: string;
    to: string;
    amount: string;
    nonce: number;
    gasPrice: number;
};

export class Helper {
    constructor(
        private app: Application,
        private config: Config,
    ) {}

    async makeTransfer(transferOptions: TransferOptions): Promise<any> {
        const signed = await this.app
            .resolve(EvmCallBuilder)
            .gasPrice(transferOptions.gasPrice)
            .network(this.config.crypto.network.pubKeyHash)
            .gasLimit(21000)
            .nonce(transferOptions.nonce.toString())
            .recipientAddress(transferOptions.to)
            .value(transferOptions.amount)
            .payload("")
            .sign(transferOptions.passphrase);

        return signed.build();
    }
}
