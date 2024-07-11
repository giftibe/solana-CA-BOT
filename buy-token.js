// // 5JeymgqTakW1VFF9XrucyvvuZmtagSC4eEffeBt2pump 

// const solanaWeb3 = require('@solana/web3.js');
// const fs = require('fs');
// const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
// const { PublicKey, Connection, Keypair, Transaction } = require('@solana/web3.js');
// const { getRaydiumSwapTx } = require('@raydium-io/raydium-sdk');

// // Load wallets from a JSON file
// function loadWallets(filePath) {
//     try {
//         const data = fs.readFileSync(filePath, 'utf8');
//         return JSON.parse(data);
//     } catch (error) {
//         console.error(`Failed to load wallets from file ${filePath}:`, error);
//         throw error;
//     }
// }

// // Function to perform token swaps on Raydium
// async function swapOnRaydium(wallets, fromTokenMint, toTokenMint, amount, rpcUrl = "https://api.mainnet-beta.solana.com") {
//     const connection = new Connection(rpcUrl, 'confirmed');
//     const fromTokenPubkey = new PublicKey(fromTokenMint);
//     const toTokenPubkey = new PublicKey(toTokenMint);

//     for (const wallet of wallets) {
//         try {
//             const secretKey = Uint8Array.from(Buffer.from(wallet.secretKey, 'hex'));
//             const account = Keypair.fromSecretKey(secretKey);

//             // Get Raydium swap transaction
//             const { transaction, signers } = await getRaydiumSwapTx({
//                 connection,
//                 fromTokenMint: fromTokenPubkey,
//                 toTokenMint: toTokenPubkey,
//                 fromWallet: account.publicKey,
//                 amountIn: amount * solanaWeb3.LAMPORTS_PER_SOL, // converting SOL to lamports
//                 slippage: 0.01, // Slippage tolerance of 1%
//             });

//             // Sign and send the transaction
//             transaction.partialSign(account, ...signers);
//             const signature = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });
//             await connection.confirmTransaction(signature, 'confirmed');
//             console.log(`Transaction for ${wallet.publicKey} sent: ${signature}`);
//         } catch (error) {
//             console.error(`Failed to process transaction for wallet ${wallet.publicKey}:`, error);
//         }
//     }
// }

// // Main function to load wallets and initiate the swap
// (async () => {
//     const walletsFile = 'wallets.json';
//     const amountToSwap = 1.0; // Amount in SOL
//     const fromTokenMint = 'So11111111111111111111111111111111111111112'; // Example SOL mint address
//     const toTokenMint = '5JeymgqTakW1VFF9XrucyvvuZmtagSC4eEffeBt2pump'; // Replace with the actual token mint address

//     try {
//         const wallets = loadWallets(walletsFile);
//         await swapOnRaydium(wallets, fromTokenMint, toTokenMint, amountToSwap);
//     } catch (error) {
//         console.error('An error occurred during the wallet loading or swapping process:', error);
//     }
// })();


const { PublicKey, Connection } = require('@solana/web3.js');

// Function to get the mint address from a token account address
async function getMintAddressFromTokenAccount(tokenAccountAddress, rpcUrl = "https://api.mainnet-beta.solana.com") {
    const connection = new Connection(rpcUrl, 'confirmed');
    const tokenAccountPubkey = new PublicKey(tokenAccountAddress);
    const tokenAccountInfo = await connection.getParsedAccountInfo(tokenAccountPubkey);

    if (tokenAccountInfo.value) {
        const tokenAccountData = tokenAccountInfo.value.data;
        return tokenAccountData.parsed.info.mint;
    } else {
        throw new Error('Token account not found');
    }
}

// Example usage
(async () => {
    const contractAddress = '5JeymgqTakW1VFF9XrucyvvuZmtagSC4eEffeBt2pump'; // Replace with your contract address
    try {
        const mintAddress = await getMintAddressFromTokenAccount(contractAddress);
        console.log(`Mint address for contract ${contractAddress}: ${mintAddress}`);
    } catch (error) {
        console.error('Error fetching mint address:', error);
    }
})();
