import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
  getNetworkDetails,
} from "@stellar/freighter-api";
import * as StellarSdk from "stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

// Re-export the Horizon module from stellar-sdk
const { Horizon } = StellarSdk;
const Server = (Horizon as any)?.Server || (StellarSdk as any).Server;
const { TransactionBuilder, Operation } = StellarSdk as any;

export async function connectFreighter(): Promise<string> {
  // Check if Freighter is installed
  const connStatus = await isConnected();
  if (!connStatus.isConnected) {
    throw new Error("Freighter cüzdanı yüklü değil veya bağlı değil.");
  }

  // Try to get address without prompting first
  let addressResult = await getAddress();

  // If not authorized, request access
  if (!addressResult.address || addressResult.error) {
    addressResult = await requestAccess();
  }

  if (addressResult.error) {
    throw new Error(`Freighter bağlantı hatası: ${addressResult.error}`);
  }

  if (!addressResult.address) {
    throw new Error("Freighter adres alınamadı.");
  }

  return addressResult.address;
}

export async function getAccountBalance(publicKey: string): Promise<string> {
  try {
    const server = new Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);
    
    // Get native (XLM) balance
    const nativeBalance = account.balances.find((b: any) => b.asset_type === "native");
    return nativeBalance ? nativeBalance.balance : "0";
  } catch (error) {
    console.error("Bakiye alma hatası:", error);
    return "0";
  }
}

export async function sendDefuseTransaction(publicKey: string): Promise<string> {
  // Get network details from Freighter
  const networkDetails = await getNetworkDetails();
  if (networkDetails.error) {
    throw new Error(`Ağ bilgisi alınamadı: ${networkDetails.error}`);
  }

  const NETWORK_PASSPHRASE = networkDetails.networkPassphrase;

  // Create transaction
  const server = new Server(HORIZON_URL);
  const account = await server.loadAccount(publicKey);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.manageData({
        name: "stellar_bomb",
        value: "defused",
      })
    )
    .setTimeout(60)
    .build();

  // Sign with Freighter
  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: publicKey,
  });

  if (signResult.error) {
    throw new Error(`İmzalama hatası: ${signResult.error}`);
  }

  // Submit signed transaction
  const signedTx = TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    NETWORK_PASSPHRASE
  );
  const result = await server.submitTransaction(signedTx);

  return result.hash;
}

// Avatar satın alma - XLM transferi
export async function purchaseAvatar(
  publicKey: string,
  avatarName: string,
  costXLM: number
): Promise<string> {
  if (costXLM === 0) {
    throw new Error("Ücretsiz avatar satın alınamaz!");
  }

  // Get network details
  const networkDetails = await getNetworkDetails();
  if (networkDetails.error) {
    throw new Error(`Ağ bilgisi alınamadı: ${networkDetails.error}`);
  }

  const NETWORK_PASSPHRASE = networkDetails.networkPassphrase;

  // Admin hesabına para gönder
  const AVATAR_SHOP_ADDRESS = "GDSPUJG45447VF2YSW6SIEYHZVPBCVQVBXO2BS3ESA5MHPCXUJHBAFDA";

  const server = new Server(HORIZON_URL);
  const account = await server.loadAccount(publicKey);

  // İşlemi oluştur (memo ile avatar bilgisi)
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addMemo(StellarSdk.Memo.text(`Avatar: ${avatarName}`))
    .addOperation(
      Operation.payment({
        destination: AVATAR_SHOP_ADDRESS,
        asset: StellarSdk.Asset.native(),
        amount: costXLM.toString(),
      })
    )
    .setTimeout(60)
    .build();

  // Freighter ile imzala
  const signResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: publicKey,
  });

  if (signResult.error) {
    throw new Error(`İmzalama hatası: ${signResult.error}`);
  }

  // İşlemi gönder
  const signedTx = TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    NETWORK_PASSPHRASE
  );
  
  try {
    const result = await server.submitTransaction(signedTx);
    console.log(`✅ Avatar "${avatarName}" satın alındı! Hash: ${result.hash}`);
    return result.hash;
  } catch (error: any) {
    throw new Error(`İşlem gönderilemedi: ${error.message}`);
  }
}
