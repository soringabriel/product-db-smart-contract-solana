import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { ProductDb } from "../target/types/product_db";
import { expect, assert } from 'chai';

describe("product-db", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.ProductDb as Program<ProductDb>;

    it('setup works correctly', async () => {
        const databaseKeyPair = anchor.web3.Keypair.generate();
        const user = program.provider.wallet;
        await program.rpc.setup({
            accounts: {
                database: databaseKeyPair.publicKey,
                user: user.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [databaseKeyPair]
        });
    
        let db = await program.account.database.fetch(databaseKeyPair.publicKey);
        expect(db.products.length).to.equal(0);
        expect(db.averagePrice).to.equal(0);
    });
    
    it('add products works correctly', async () => {
        const databaseKeyPair = anchor.web3.Keypair.generate();
        const user = program.provider.wallet;
        await program.rpc.setup({
            accounts: {
                database: databaseKeyPair.publicKey,
                user: user.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [databaseKeyPair]
        });
        
        await program.rpc.addProduct('Product1', 'Description1', 2.32, {
            accounts: {
                database: databaseKeyPair.publicKey,
            },
            signers: []
        })

        try {
            await program.rpc.addProduct('Product1', 'Description1', 2.32, {
                accounts: {
                    database: databaseKeyPair.publicKey,
                },
                signers: []
            })
        } catch (error) {
            const expectedError = 'A product witht the same name already exists';
            assert.equal(error.error.errorMessage, expectedError);
        }

        let db = await program.account.database.fetch(databaseKeyPair.publicKey);
        expect(db.products.length).to.equal(1);
        expect(db.products[0].name).to.equal("Product1");
        expect(db.products[0].description).to.equal("Description1");
        expect(db.products[0].price).to.equal(2.32);
        expect(db.averagePrice).to.equal(2.32);
    });

    it('remove products works correctly', async () => {
        const databaseKeyPair = anchor.web3.Keypair.generate();
        const user = program.provider.wallet;
        await program.rpc.setup({
            accounts: {
                database: databaseKeyPair.publicKey,
                user: user.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            },
            signers: [databaseKeyPair]
        });
    
        await program.rpc.addProduct('Product1', 'Description1', 2.32, {
            accounts: {
                database: databaseKeyPair.publicKey,
            },
            signers: []
        });

        await program.rpc.addProduct('Product2', 'Description2', 5.32, {
            accounts: {
                database: databaseKeyPair.publicKey,
            },
            signers: []
        });

        try {
            await program.rpc.removeProduct('unexistent', {
                accounts: {
                    database: databaseKeyPair.publicKey,
                },
                signers: []
            })
        } catch (error) {
            const expectedError = 'No such product found to remove';
            assert.equal(error.error.errorMessage, expectedError);
        }

        await program.rpc.removeProduct('Product1', {
            accounts: {
                database: databaseKeyPair.publicKey,
            },
            signers: []
        })
        
        let db = await program.account.database.fetch(databaseKeyPair.publicKey);
        expect(db.products.length).to.equal(1);
        expect(db.products[0].name).to.equal("Product2");
        expect(db.products[0].description).to.equal("Description2");
        expect(db.products[0].price).to.equal(5.32);
        expect(db.averagePrice).to.equal(5.32);
    });
});
