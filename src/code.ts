/*
import {
  AccountUpdate,
  Mina,
  PublicKey,
  Transaction,
  UInt64
} from "o1js";
import { FungibleToken } from "./FungibleToken.js";

export type SendTokenParams = {
  sender: string;
  receiver: string;
  tokenAddress: string;
  amount: number | string;
  isNewAccount?: boolean;
};

export async function tokenCompile() {
  await FungibleToken.compile();
}

export async function initMina(gqlUrl: string) {
  const Berkeley = Mina.Network(gqlUrl);
  Mina.setActiveInstance(Berkeley);
}

export async function buildToken({
  sender,
  receiver,
  tokenAddress,
  amount,
  isNewAccount,
}: SendTokenParams): Promise<Transaction<false, false>> {
  const senderPub = PublicKey.fromBase58(sender);
  const receiverPub = PublicKey.fromBase58(receiver);
  const tokenPub = PublicKey.fromBase58(tokenAddress);
  const token = new FungibleToken(tokenPub);
  const transferTx = await Mina.transaction(
    {
      sender: senderPub,
    },
    async () => {
      if (JSON.parse(String(isNewAccount))) {
        AccountUpdate.fundNewAccount(senderPub);
      }
      await token.transfer(senderPub, receiverPub, new UInt64(amount));
    }
  );
  try {
    await transferTx.prove();
  } catch (error) {
    throw new Error(`Error when proving FungibleToken.transfer()`);
  }

  return transferTx;
}
async function runBuild() {
  let tokenParams = {
    sender: "",
    receiver: "",
    tokenAddress: "B62qp7MvZUZ31NuysZYm5oqieCqyBdMxfc3HWZ21iKakXwWaepZSgox",
    amount: 100,
    isNewAccount: true,// this is get from fronted. Depends on whether this account has ever interacted with the current transfer token，if no ,set true
  };
  let gqlUrl = "";
  // timeStart
  await tokenCompile();
  await initMina(gqlUrl);
  const unSignTx = await buildToken(tokenParams);
  // timeEnd print duration here
}

runBuild()
*/
