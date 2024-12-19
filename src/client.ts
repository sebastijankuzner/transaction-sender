import { http } from "@mainsail/utils";
import { Peer, EthViewParameters } from "./types.js";
import { Contracts } from "@mainsail/contracts";

const parseJSONRPCResult = <T>(method: string, response: any): T => {
    if (response.statusCode !== 200) {
        const error = `Error on ${method}. Status code is ${response.statusCode}`;
        console.error(error);
        throw new Error(error);
    } else if (response.data.error) {
        const error = `Error on ${method}. Error code: ${response.data.error.code}, message: ${response.data.error.message}`;
        console.error(error);
        throw new Error(error);
    }

    return response.data.result;
};

const JSONRPCCall = async <T>(peer: Peer, method: string, params: any[]): Promise<T> => {
    try {
        const response = await http.post(`${peer.apiEvmUrl}/api/`, {
            headers: { "Content-Type": "application/json" },
            body: {
                jsonrpc: "2.0",
                method,
                params,
                id: null,
            },
        });

        return parseJSONRPCResult<T>(method, response);
    } catch (err) {
        console.error(`Error on ${method}. ${err.message}`);
        throw err;
    }
};

export const getWalletNonce = async (peer: Peer, address: string): Promise<number> => {
    return parseInt(await JSONRPCCall<string>(peer, "eth_getTransactionCount", [address, "latest"]));
};

export const getHeight = async (peer: Peer): Promise<number> => {
    return parseInt(await JSONRPCCall<string>(peer, "eth_blockNumber", []));
};

export const postEthView = async (peer: Peer, viewParameters: EthViewParameters): Promise<string> => {
    return JSONRPCCall<string>(peer, "eth_call", [viewParameters, "latest"]);
};

export const postTransaction = async (peer: Peer, transaction: Contracts.Crypto.Transaction): Promise<void> => {
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
        const response = await http.post(`${peer.apiTxPoolUrl}/api/transactions`, {
            headers: { "Content-Type": "application/json" },
            body: {
                transactions: [transaction.serialized.toString("hex")] as any,
            },
        });

        if (response.statusCode !== 200) {
            console.log(JSON.stringify(response.data));

            return response.data;
        } else {
            return response.data;
        }
    } catch (err) {
        console.error(`Cannot post transaction: ${err.message}`);
    }
};
