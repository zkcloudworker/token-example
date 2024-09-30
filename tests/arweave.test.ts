import { describe, expect, it } from "@jest/globals";
import { ARWEAVE_KEY_STRING } from "../env.json";
import { ArweaveService } from "../src/arweave";
import fs from "fs/promises";
import path from "path";

const arweave = new ArweaveService(ARWEAVE_KEY_STRING);
const image = "./image/m-coin.jpg";
const imageUrl =
  "https://arweave.net/XWyLzcAu7e7SvcU1ZFdXwu8u_mW7VOk__al3toiWd7o/m-coin.jpg";

describe("Arweave", () => {
  it(`should get balance`, async () => {
    const balance = await arweave.balance();
    console.log("balance", balance);
  });
  it.skip(`should pin image to arweave`, async () => {
    const size = (await fs.stat(image)).size;
    const data = await fs.readFile(image);
    const hash = await arweave.pinFile({
      data,
      filename: path.basename(image),
      size,
      mimeType: "image/jpeg",
      waitForConfirmation: true,
    });
    if (hash === undefined) throw new Error(`Arweave pin failed`);
    console.log("url:", arweave.hashToUrl(hash));
  });
  it.skip(`should pin image to arweave`, async () => {
    const json = {
      symbol: "M-COIN",
      image: imageUrl,
      issuer: "https://zkok.io",
      tokenContractCode:
        "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts",
      adminContractsCode: [
        "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleTokenAdmin.ts",
      ],
    };
    const hash = await arweave.pinString({
      data: JSON.stringify(json, null, 2),
      waitForConfirmation: true,
    });
    if (hash === undefined) throw new Error(`Arweave pin failed`);
    console.log("url:", arweave.hashToUrl(hash));
  });
});
