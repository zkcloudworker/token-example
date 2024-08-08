import { describe, expect, it } from "@jest/globals";
import {
  PrivateKey,
  Mina,
  AccountUpdate,
  VerificationKey,
  UInt64,
  Cache,
  PublicKey,
  setNumberOfWorkers,
  UInt8,
  Bool,
} from "o1js";

import {
  zkCloudWorkerClient,
  blockchain,
  sleep,
  Memory,
  fetchMinaAccount,
  fee,
  initBlockchain,
  serializeFields,
  accountBalanceMina,
} from "zkcloudworker";
import { zkcloudworker } from "..";
import { FungibleToken } from "../src/FungibleToken";
import { FungibleTokenAdmin } from "../src/FungibleTokenAdmin";
import { USER_PRIVATE_KEY, USER_PUBLIC_KEY, TOKEN_ADDRESS } from "../env.json";
import packageJson from "../package.json";
import { JWT } from "../env.json";

const ONE_ELEMENTS_NUMBER = 1;
const MANY_ELEMENTS_NUMBER = 1;
const MANY_BATCH_SIZE = 3;
setNumberOfWorkers(8);

const { name: repo, author: developer } = packageJson;
const { chain, compile, deploy, send, useLocalCloudWorker } =
  processArguments();

const api = new zkCloudWorkerClient({
  jwt: useLocalCloudWorker ? "local" : JWT,
  zkcloudworker,
  chain,
});

let deployer: PrivateKey;
let sender: PublicKey;

const oneValues: number[] = [];
const manyValues: number[][] = [];

const adminPrivateKey = PrivateKey.random();
const adminPublicKey = adminPrivateKey.toPublicKey();
const contractPrivateKey = PrivateKey.random();
const contractPublicKey =
  chain === "devnet"
    ? PublicKey.fromBase58(TOKEN_ADDRESS)
    : contractPrivateKey.toPublicKey();
const userPrivateKey = PrivateKey.fromBase58(USER_PRIVATE_KEY);
const userPublicKey = PublicKey.fromBase58(USER_PUBLIC_KEY);
const zkApp = new FungibleToken(contractPublicKey);
let contractVerificationKey: VerificationKey;
let adminVerificationKey: VerificationKey;
let blockchainInitialized = false;

describe("Token Worker", () => {
  it(`should initialize blockchain`, async () => {
    Memory.info("initializing blockchain");

    if (chain === "local" || chain === "lightnet") {
      console.log("local chain:", chain);
      const { keys } = await initBlockchain(chain, 2);
      expect(keys.length).toBeGreaterThanOrEqual(2);
      if (keys.length < 2) throw new Error("Invalid keys");
      deployer = keys[0].key;
    } else {
      console.log("non-local chain:", chain);
      await initBlockchain(chain);
      deployer = PrivateKey.fromBase58(USER_PRIVATE_KEY);
    }

    process.env.DEPLOYER_PRIVATE_KEY = deployer.toBase58();
    process.env.DEPLOYER_PUBLIC_KEY = deployer.toPublicKey().toBase58();

    console.log("contract address:", contractPublicKey.toBase58());
    sender = deployer.toPublicKey();
    console.log("sender:", sender.toBase58());
    console.log("Sender balance:", await accountBalanceMina(sender));
    expect(deployer).toBeDefined();
    expect(sender).toBeDefined();
    expect(deployer.toPublicKey().toBase58()).toBe(sender.toBase58());
    Memory.info("blockchain initialized");
    blockchainInitialized = true;
  });

  if (compile) {
    it(`should compile contract`, async () => {
      expect(blockchainInitialized).toBe(true);
      console.log("Analyzing contracts methods...");
      console.time("methods analyzed");
      const methods = [
        {
          name: "FungibleToken",
          result: await FungibleToken.analyzeMethods(),
          skip: true,
        },
        {
          name: "FungibleTokenAdmin",
          result: await FungibleTokenAdmin.analyzeMethods(),
          skip: true,
        },
      ];
      console.timeEnd("methods analyzed");
      const maxRows = 2 ** 16;
      for (const contract of methods) {
        // calculate the size of the contract - the sum or rows for each method
        const size = Object.values(contract.result).reduce(
          (acc, method) => acc + method.rows,
          0
        );
        // calculate percentage rounded to 0 decimal places
        const percentage = Math.round(((size * 100) / maxRows) * 100) / 100;

        console.log(
          `method's total size for a ${contract.name} is ${size} rows (${percentage}% of max ${maxRows} rows)`
        );
        if (contract.skip !== true)
          for (const method in contract.result) {
            console.log(method, `rows:`, (contract.result as any)[method].rows);
          }
      }

      console.time("compiled");
      console.log("Compiling contracts...");
      const cache: Cache = Cache.FileSystem("./cache");

      console.time("FungibleTokenAdmin compiled");
      adminVerificationKey = (await FungibleTokenAdmin.compile({ cache }))
        .verificationKey;
      console.timeEnd("FungibleTokenAdmin compiled");

      console.time("FungibleToken compiled");
      contractVerificationKey = (await FungibleToken.compile({ cache }))
        .verificationKey;
      console.timeEnd("FungibleToken compiled");
      console.timeEnd("compiled");
      console.log(
        "FungibleToken verification key",
        contractVerificationKey.hash.toJSON()
      );
      console.log(
        "FungibleTokenAdmin verification key",
        adminVerificationKey.hash.toJSON()
      );
      Memory.info("compiled");
    });
  }
  if (deploy) {
    it(`should deploy contract`, async () => {
      expect(blockchainInitialized).toBe(true);
      console.log(`Deploying contract...`);

      await fetchMinaAccount({ publicKey: sender, force: true });
      await fetchMinaAccount({ publicKey: userPublicKey });
      if (!Mina.hasAccount(userPublicKey)) {
        const topupTx = await Mina.transaction(
          {
            sender,
            fee: await fee(),
          },
          async () => {
            const senderUpdate = AccountUpdate.createSigned(sender);
            senderUpdate.balance.subInPlace(1000000000);
            senderUpdate.send({ to: userPublicKey, amount: 100_000_000_000 });
          }
        );
        topupTx.sign([deployer]);
        await sendTx(topupTx, "topup");
      }
      const adminContract = new FungibleTokenAdmin(adminPublicKey);
      await fetchMinaAccount({ publicKey: sender, force: true });

      const tx = await Mina.transaction(
        { sender, fee: await fee(), memo: "deploy" },
        async () => {
          AccountUpdate.fundNewAccount(sender, 3);
          await adminContract.deploy({ adminPublicKey });
          await zkApp.deploy({
            symbol: "ZKCW",
            src: "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts",
          });
          await zkApp.initialize(
            adminPublicKey,
            UInt8.from(9),
            // We can set `startPaused` to `Bool(false)` here, because we are doing an atomic deployment
            // If you are not deploying the admin and token contracts in the same transaction,
            // it is safer to start the tokens paused, and resume them only after verifying that
            // the admin contract has been deployed
            Bool(false)
          );
        }
      );
      await tx.prove();
      tx.sign([deployer, contractPrivateKey, adminPrivateKey]);

      await sendTx(tx, "deploy");
      Memory.info("deployed");

      const mintTx = await Mina.transaction(
        {
          sender,
          fee: await fee(),
        },
        async () => {
          AccountUpdate.fundNewAccount(sender, 1);
          await zkApp.mint(userPublicKey, new UInt64(100e9));
        }
      );
      await mintTx.prove();
      mintTx.sign([deployer, adminPrivateKey]);
      await sendTx(mintTx, "mint");
    });
  }

  if (send) {
    it(`should send tokens`, async () => {
      expect(blockchainInitialized).toBe(true);
      console.time(`Tokens sent`);

      const answer = await api.execute({
        developer,
        repo,
        transactions: [],
        task: "send",
        args: JSON.stringify({
          contractAddress: contractPublicKey.toBase58(),
          from: userPrivateKey.toBase58(),
          to: PrivateKey.random().toPublicKey().toBase58(),
          amount: 1_000_000,
        }),
        metadata: `send tokens`,
      });
      console.log("answer:", answer);
      expect(answer).toBeDefined();
      expect(answer.success).toBe(true);
      const jobId = answer.jobId;
      expect(jobId).toBeDefined();
      if (jobId === undefined) throw new Error("Job ID is undefined");
      const oneResult = await api.waitForJobResult({
        jobId,
        printLogs: true,
      });
      console.log("Token transfer result:", oneResult.result.result);

      console.timeEnd(`Tokens sent`);
      Memory.info(`Tokens sent`);
    });
  }
});

function processArguments(): {
  chain: blockchain;
  compile: boolean;
  deploy: boolean;
  send: boolean;
  useLocalCloudWorker: boolean;
} {
  function getArgument(arg: string): string | undefined {
    const argument = process.argv.find((a) => a.startsWith("--" + arg));
    return argument?.split("=")[1];
  }

  const chainName = getArgument("chain") ?? "local";
  const shouldDeploy = getArgument("deploy") ?? "true";
  const shouldSend = getArgument("send") ?? "true";
  const compile = getArgument("compile");
  const cloud = getArgument("cloud");

  if (
    chainName !== "local" &&
    chainName !== "devnet" &&
    chainName !== "lightnet" &&
    chainName !== "zeko"
  )
    throw new Error("Invalid chain name");
  return {
    chain: chainName as blockchain,
    compile:
      compile !== undefined
        ? compile === "true"
        : shouldDeploy === "true" || shouldSend === "true",
    deploy: shouldDeploy === "true",
    send: shouldSend === "true",
    useLocalCloudWorker: cloud
      ? cloud === "local"
      : chainName === "local" || chainName === "lightnet",
  };
}

async function sendTx(
  tx: Mina.Transaction<false, true> | Mina.Transaction<true, true>,
  description?: string
) {
  try {
    let txSent;
    let sent = false;
    while (!sent) {
      txSent = await tx.safeSend();
      if (txSent.status == "pending") {
        sent = true;
        console.log(
          `${description ?? ""} tx sent: hash: ${txSent.hash} status: ${
            txSent.status
          }`
        );
      } else if (chain === "zeko") {
        console.log("Retrying Zeko tx");
        await sleep(10000);
      } else {
        console.log(
          `${description ?? ""} tx NOT sent: hash: ${txSent?.hash} status: ${
            txSent?.status
          }`
        );
        return "Error sending transaction";
      }
    }
    if (txSent === undefined) throw new Error("txSent is undefined");
    if (txSent.errors.length > 0) {
      console.error(
        `${description ?? ""} tx error: hash: ${txSent.hash} status: ${
          txSent.status
        }  errors: ${txSent.errors}`
      );
    }

    if (txSent.status === "pending") {
      console.log(`Waiting for tx inclusion...`);
      const txIncluded = await txSent.safeWait();
      console.log(
        `${description ?? ""} tx included into block: hash: ${
          txIncluded.hash
        } status: ${txIncluded.status}`
      );
    }
  } catch (error) {
    if (chain !== "zeko") console.error("Error sending tx", error);
  }
  if (chain !== "local") await sleep(10000);
}
