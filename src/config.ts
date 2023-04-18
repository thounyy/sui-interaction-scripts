import { Ed25519Keypair, Connection, JsonRpcProvider, RawSigner, TransactionBlock } from "@mysten/sui.js";
import dotenv from "dotenv";

export const connection = new Connection({
    fullnode: "https://rpc-testnet.suiscan.xyz:443/",
    faucet: "",
});

dotenv.config();

export const keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(Buffer.from(process.env.KEY!, "base64")).slice(1));

export const provider = new JsonRpcProvider(connection);

export const signer = new RawSigner(keypair, provider);

export const tx = new TransactionBlock();

// ---------------------------------

export const PACKAGE_ID = "";
export const ADMIN_CAP = "";
