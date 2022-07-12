// Parse arguments
// --program - [Required] The account address for your deployed program.
// --feed - The account address for the Chainlink data feed to retrieve
const args = require('minimist')(process.argv.slice(2));

// Initialize Anchor and provider
const anchor = require("@project-serum/anchor");
const provider = anchor.AnchorProvider.env();
// Configure the cluster.
anchor.setProvider(provider);

async function main() {
    // Read the generated IDL.
    const idl = JSON.parse(
        require("fs").readFileSync("./target/idl/product_db.json", "utf8")
    );

    // Address of the deployed program.
    const programId = new anchor.web3.PublicKey(args['program']);

    // Generate the program client from IDL.
    const program = new anchor.Program(idl, programId);

    //create an account to store the database
    let secretKey = Uint8Array.from([46,222,71,132,68,1,26,81,206,64,222,104,142,28,104,172,90,85,3,238,129,176,142,63,56,209,135,103,65,75,219,94,142,185,76,80,1,243,1,148,119,214,65,227,148,77,172,122,195,149,82,226,174,232,139,139,140,215,181,6,92,207,146,118]);
    let databaseAccount = anchor.web3.Keypair.fromSecretKey(secretKey);

    console.log('databaseAccount public key: ' + databaseAccount.publicKey);
    console.log('user public key: ' + provider.wallet.publicKey);

    // Execute the RPC.
    try {
        let tx = await program.rpc.setup({
            accounts: {
                database: databaseAccount.publicKey,
                user: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [databaseAccount],
        });
    } catch (error) {
        console.log(error);
    }

    try {
        await program.rpc.addProduct('sadsad', 'Description1', "2.32", {
            accounts: {
                database: databaseAccount.publicKey,
            },
            signers: []
        })
    } catch (error) {
        console.log(error.error.errorMessage);
    }

    try {
        await program.rpc.addProduct('dsad', 'Description2', "5", {
            accounts: {
                database: databaseAccount.publicKey,
            },
            signers: []
        })
    } catch (error) {
        console.log(error.error.errorMessage);
    }

    try {
        await program.rpc.addProduct('zccxzzx', 'Description2', "10", {
            accounts: {
                database: databaseAccount.publicKey,
            },
            signers: []
        })
    } catch (error) {
        console.log(error.error.errorMessage);
    }

    try {
        await program.rpc.removeProduct('adswqwqee', {
            accounts: {
                database: databaseAccount.publicKey,
            },
            signers: []
        })
    } catch (error) {
        console.log(error.error.errorMessage);
    } 

    const db = await program.account.database.fetch(databaseAccount.publicKey);
    console.log(JSON.stringify(db));
    console.log('Average Price Is: ' + db.averagePrice)
}

console.log("Running client...");
main().then(() => console.log("Success"));
