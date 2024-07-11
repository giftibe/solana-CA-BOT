const solanaWeb3 = require('@solana/web3.js');
const fs = require('fs');

// Function to generate wallet addresses and save them to a file without overwriting
async function generateWalletsAndSaveToFile(numWallets, solWallets) {
    // Check if the file exists
    if (fs.existsSync(solWallets)) {
        // Read the existing file
        const data = fs.readFileSync(solWallets, 'utf8');
        // Parse the existing JSON data
        const wallets = JSON.parse(data);
        console.log(`File already exists. Returning existing wallets from ${solWallets}:`);
        console.log(wallets);
        return wallets;
    } else {
        // Generate new wallets
        const wallets = [];
        for (let i = 0; i < numWallets; i++) {
            const keypair = solanaWeb3.Keypair.generate();
            const wallet = {
                publicKey: keypair.publicKey.toBase58(),
                secretKey: Buffer.from(keypair.secretKey).toString('hex')
            };
            wallets.push(wallet);
        }

        // Save the new wallets to the file in JSON format
        fs.writeFileSync(solWallets, JSON.stringify(wallets, null, 2), 'utf8');
        console.log(`Created ${numWallets} new wallets and saved to ${solWallets}`);
        return wallets;
    }
}
generateWalletsAndSaveToFile(5, 'wallets.json')