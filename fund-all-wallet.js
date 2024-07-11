const solanaWeb3 = require('@solana/web3.js');
const fs = require('fs');

// Function to fund the wallets from a single wallet
async function fundWalletsFromSingleWallet(fundingWallet, solWallets, amountToSend) {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
    const sourceWallet = solanaWeb3.Keypair.fromSecretKey(Buffer.from(fundingWallet.secretKey, 'hex'));

    // Read the existing wallets file
    const data = fs.readFileSync(solWallets, 'utf8');
    const wallets = JSON.parse(data);

    // Calculate the amount to send to each wallet
    const amountPerWallet = amountToSend / wallets.length;
    const lamportsPerWallet = amountPerWallet * solanaWeb3.LAMPORTS_PER_SOL;

    // Fund each wallet
    for (const wallet of wallets) {
        const recipientPublicKey = new solanaWeb3.PublicKey(wallet.publicKey);
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: sourceWallet.publicKey,
                toPubkey: recipientPublicKey,
                lamports: lamportsPerWallet,
            })
        );
        await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [sourceWallet]);
        console.log(`Sent ${amountPerWallet} SOL to wallet ${wallet.publicKey}`);
    }
}

// Example usage
const fundingWallet = {
    publicKey: 'YourSourceWalletPublicKey',
    secretKey: 'YourSourceWalletSecretKey'
};
const solWallets = 'wallets.json';
const amountToSend = 5; // Amount in SOL

fundWalletsFromSingleWallet(fundingWallet, solWallets, amountToSend);
