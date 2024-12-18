import { Contracts } from "@mainsail/contracts";
import cli from "../config/config.js";

export type Peer = typeof cli.peer;

export type Config = {
    crypto: Contracts.Crypto.NetworkConfig;
    cli: typeof cli;
};

export type EthViewParameters = {
    from: string;
    to: string;
    data: string;
};
