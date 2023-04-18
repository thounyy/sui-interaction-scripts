import { OwnedObjectRef, SuiTransactionBlockResponse } from "@mysten/sui.js";
import { execSync } from "child_process";
import * as fs from "fs";
import { stringify } from "csv";

import { tx, signer, keypair, provider } from "./config";

interface IObjectInfo {
    id: string | undefined
    type: string | undefined
}

(async () => {
    console.log("running...");

    const cliPath = process.env.CLI_PATH!;
    const packagePath = process.env.PACKAGE_PATH!;
    const address = keypair.getPublicKey().toSuiAddress();

    const { modules, dependencies } = JSON.parse(
        execSync(
            `${cliPath} move build --dump-bytecode-as-base64 --path ${packagePath}`,
            { encoding: "utf-8" }
        )
    );

    try {
        tx.setGasBudget(100000000);

        const [upgradeCap] = tx.publish({
            modules,
            dependencies,
        });

        tx.transferObjects([upgradeCap], tx.pure(address));

        const publishTb: SuiTransactionBlockResponse = await signer.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEffects: true,
            },
            requestType: "WaitForLocalExecution"
        });
        console.log("publishTb", JSON.stringify(publishTb, null, 2));

        if (publishTb.effects?.status?.status !== "success") {
            console.log(publishTb);
            return;
        }

        const createdObjectIds = publishTb.effects.created!.map(
            (item: OwnedObjectRef) => item.reference.objectId
        );

        const createdObjects = await provider.multiGetObjects({
            ids: createdObjectIds,
            options: { showContent: true, showType: true, showOwner: true }
        });

        let packageObjectId = "";
        const objects: IObjectInfo[] = [];

        createdObjects.forEach((item) => {
            if (item.data?.type === "package") {
                packageObjectId = item.data.objectId;
            } else {
                if (!item.data!.type!.startsWith("0x2::")) {
                    objects.push({
                        id: item.data?.objectId,
                        type: item.data?.type!.slice(68),
                    });
                }
            }
        });

        const writableStream = fs.createWriteStream("./created_objects.csv");
        const stringifier = stringify({ header: true, columns: ["type", "id"] });

        for (let i = 0; i < objects.length; i++) {
            stringifier.write([objects[i].id, objects[i].type]);
        }
        stringifier.pipe(writableStream);

        console.log("Successfully deployed at: " + packageObjectId);
    } catch (e) {
        console.log(e);
    }
})()
