import { PACKAGE_ID, ADMIN_CAP, signer, tx } from "./config";

(async () => {
    console.log("running...");

    tx.moveCall({
        target: `${PACKAGE_ID}::module::function_name`,
        typeArguments: [],
        arguments: [
            tx.object(ADMIN_CAP),
        ]
    });
    tx.setGasBudget(10000000);
    const moveCallTxn = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        requestType: "WaitForLocalExecution",
        options: {
            showObjectChanges: true,
            showEffects: true,
        }
    });

    console.log("moveCallTxn", moveCallTxn);
    console.log("STATUS: ", moveCallTxn.effects?.status);
})()
