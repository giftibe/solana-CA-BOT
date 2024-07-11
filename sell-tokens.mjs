import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import fs from 'fs';
import * as splToken from '@solana/spl-token';
// import raydiumSdk from '@raydium-io/raydium-sdk';
import pkg from '@raydium-io/raydium-sdk';
const { Raydium } = pkg;

// Load wallets from a JSON file
function loadWallets(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Function to get the token balance for a wallet
async function getTokenBalance(connection, walletPublicKey, tokenPublicKey) {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint: tokenPublicKey });
    const tokenAccount = tokenAccounts.value.find(accountInfo => accountInfo.account.data.parsed.info.tokenAmount.uiAmount > 0);
    return tokenAccount ? tokenAccount.account.data.parsed.info.tokenAmount.uiAmount : 0;
}


console.log("here 3333333333333333333")
// Function to perform the token swap back to SOL using Raydium
async function swapTokenToSol(wallets, percentage, contractAddress, rpcUrl = "https://api.mainnet-beta.solana.com") {
    const connection = new Connection(rpcUrl, 'confirmed');
    const contractPubkey = new PublicKey(contractAddress);

    for (const wallet of wallets) {
        const secretKey = Uint8Array.from(Buffer.from(wallet.secretKey, 'hex'));
        const account = Keypair.fromSecretKey(secretKey);
        const walletPublicKey = new PublicKey(wallet.publicKey);

        const tokenBalance = await getTokenBalance(connection, walletPublicKey, contractPubkey);
        console.log(tokenBalance)
        const swapAmount = tokenBalance * (percentage / 100);

        if (swapAmount > 0) {
            const transaction = new Transaction();

            const { transaction: swapTransaction } = await raydiumSdk.swap({
                connection,
                wallet: { publicKey: walletPublicKey, signTransaction: async tx => await sendAndConfirmTransaction(connection, tx, [account]) },
                poolKeys: await raydiumSdk.getPoolKeys('RAY-SOL'), // Replace with actual pool keys
                fromCoin: contractPubkey,
                toCoin: PublicKey.default,
                amountIn: swapAmount * (10 ** (await splToken.getMint(connection, contractPubkey).decimals)),
                slippage: 0.5 // 0.5% slippage
            });

            transaction.add(swapTransaction);
            const signature = await sendAndConfirmTransaction(connection, transaction, [account]);
            console.log(`Swapped ${percentage}% of token for ${wallet.publicKey}: ${signature}`);
        }
    }
}

// Main function to load wallets and initiate the swap
(async () => {
    const walletsFile = 'wallets.json';
    const percentageToSwap = 50; // Percentage of the token balance to swap (25, 50, or 100)
    const contractAddressToSwap = '5JeymgqTakW1VFF9XrucyvvuZmtagSC4eEffeBt2pump';

    const wallets = loadWallets(walletsFile);
    await swapTokenToSol(wallets, percentageToSwap, contractAddressToSwap);
})();







































































// const connection = new solanaWeb3.Connection(
//     solanaWeb3.clusterApiUrl('mainnet-beta'),
//     'confirmed'
// );

// // Replace with your actual wallet private keys in Uint8Array format
// const walletPrivateKeys = [
//     [/* Your first wallet private key */],
//     [/* Your second wallet private key */],
//     [/* Your third wallet private key */],
//     [/* Your fourth wallet private key */],
//     [/* Your fifth wallet private key */]
// ];

// const wallets = walletPrivateKeys.map(key => solanaWeb3.Keypair.fromSecretKey(new Uint8Array(key)));

// // Replace with the actual market and program IDs from Raydium
// const RAYDIUM_MARKET_ID = new solanaWeb3.PublicKey('MARKET_ID'); // Example: '9wFFaEodf3hY9KJKbpLAshwgyNrLxD6DQ1FzpTuMZC8t'
// const RAYDIUM_PROGRAM_ID = new solanaWeb3.PublicKey('AMM_PROGRAM_ID'); // Example: 'RVKd61ztZW9F7h6giinSXnS7yynQsWSyCrV6b6XYXJ15'

// // Function to get or create token account for a given wallet and token mint address
// async function getTokenAccount(wallet, tokenMintAddress) {
//     const token = new Token(connection, tokenMintAddress, TOKEN_PROGRAM_ID, wallet);
//     const tokenAccount = await token.getOrCreateAssociatedAccountInfo(wallet.publicKey);
//     return tokenAccount.address;
// }





// // Function to sell tokens on Raydium
// async function sellToken(wallet, tokenMintAddress, percentage) {
//     const market = await Market.load(connection, RAYDIUM_MARKET_ID, {}, RAYDIUM_PROGRAM_ID);
//     const tokenAccountAddress = await getTokenAccount(wallet, tokenMintAddress);
//     const token = new Token(connection, tokenMintAddress, TOKEN_PROGRAM_ID, wallet);
//     const tokenBalance = await token.getAccountInfo(tokenAccountAddress);

//     const amountToSell = tokenBalance.amount * (percentage / 100);
//     const transaction = market.makePlaceOrderTransaction(
//         connection,
//         {
//             owner: wallet,
//             payer: wallet.publicKey,
//             side: 'sell',
//             price: 1, // Replace with the appropriate price
//             size: amountToSell,
//             orderType: 'limit',
//         },
//         {
//             openOrdersAddressKey: (await OpenOrders.findForMarketAndOwner(
//                 connection,
//                 RAYDIUM_MARKET_ID,
//                 wallet.publicKey,
//                 RAYDIUM_PROGRAM_ID
//             ))[0]?.address,
//         }
//     );

//     const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [wallet]);
//     console.log(`Sold ${percentage}% of tokens for wallet: ${wallet.publicKey.toString()}. Transaction signature: ${signature}`);
// }

// const percentages = [25, 50, 100];
// for (const percentage of percentages) {
//     for (const wallet of wallets) {
//         await sellToken(wallet, tokenMintAddress, percentage);
//     }
// }

// const recipientAddress = 'CdACRUxWizLCzqn6H5xFnnU5YL9TNseAyeBWU61Dkxd'; // Replace with actual recipient address
// for (const wallet of wallets) {
//     await sendSol(wallet, recipientAddress, 1); // Replace 1 with the amount you want to send
// }