import { TransactionBlock } from '@mysten/sui.js/transactions';
import { client, keypair, getId } from './utils.js';

(async () => {
	try {
		console.log("calling...")

		const tx = new TransactionBlock();

		let [returned_object] = tx.moveCall({
			target: `${getId("package")}::module_name::function_name`,
			arguments: [getId("module_name::Type_name"), "other_objet_id"],
		});

		tx.transferObjects([returned_object], keypair.getPublicKey().toSuiAddress());

		const result = await client.signAndExecuteTransactionBlock({
			signer: keypair,
			transactionBlock: tx,
			options: {
				showObjectChanges: true,
			},
			requestType: "WaitForLocalExecution"
		});

		console.log("result: ", JSON.stringify(result, null, 2));

	} catch (e) {
		console.log(e)
	}
})()