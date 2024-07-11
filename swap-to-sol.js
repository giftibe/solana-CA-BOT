const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const fs = require('fs');

// Load wallets from a JSON file
function loadWallets(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

const walletsFile = 'wallets.json';
const wallets = loadWallets(walletsFile);
console.log(wallets)

// Function to convert tokens back to SOL for all wallets
async function convertTokensToSol(wallets, amount, tokenMintAddress, rpcUrl = "https://api.mainnet-beta.solana.com") {
    const connection = new solanaWeb3.Connection(rpcUrl, 'confirmed');
    const tokenMintPubkey = new solanaWeb3.PublicKey(tokenMintAddress);

    for (const wallet of wallets) {
        const secretKey = Uint8Array.from(Buffer.from(wallet.secretKey, 'hex'));
        const account = solanaWeb3.Keypair.fromSecretKey(secretKey);

        // Get the associated token account for the wallet
        const associatedTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            account,
            tokenMintPubkey,
            account.publicKey
        );

        // Create a transaction to burn tokens (this assumes a burn and redeem mechanism)
        const transaction = new solanaWeb3.Transaction().add(
            splToken.createBurnInstruction(
                associatedTokenAccount.address,
                tokenMintPubkey,
                account.publicKey,
                amount * splToken.TOKEN_PROGRAM_ID
            ),
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: account.publicKey,
                toPubkey: associatedTokenAccount.address,
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL // Converting the amount of tokens to lamports (assuming 1:1 conversion)
            })
        );

        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [account]);
        console.log(`Transaction for ${wallet.publicKey} sent: ${signature}`);
    }
}

// Main function to load wallets and initiate the conversion
(async () => {
    const walletsFile = 'wallets.json';
    const amountToConvert = 1.0; // Amount of tokens to convert
    const tokenMintAddress = '5JeymgqTakW1VFF9XrucyvvuZmtagSC4eEffeBt2pump';  // Replace with your token mint address

    const wallets = loadWallets(walletsFile);
    await convertTokensToSol(wallets, amountToConvert, tokenMintAddress);

})();
