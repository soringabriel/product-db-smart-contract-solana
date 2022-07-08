use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[account]
pub struct Database {
    pub products: Vec<Product>,
    pub average_price: f64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Product {
    pub name: String,
    pub price: f64,
    pub description: String,
}

#[program]
pub mod product_db {
    use super::*;

    pub fn setup(ctx: Context<SetupDatabase>) -> Result<()> {
        let database: &mut Account<Database> = &mut ctx.accounts.database;

        database.products = Vec::new();
        database.average_price = 0.0;

        Ok(())
    }

    pub fn add_product(ctx: Context<AddProduct>, name: String, description: String, price: f64) -> Result<()> {
        let database: &mut Account<Database> = &mut ctx.accounts.database;

        if database.products.iter().any(|product| product.name == name) {
            return err!(Errors::DuplicateProduct);
        }

        database.products.push(Product{
            name: name,
            price: price,
            description: description
        });

        let sum: f64 = database.products.iter().map(|product| product.price).sum();
        database.average_price =  sum / database.products.len() as f64;

        Ok(())
    }

    pub fn remove_product(ctx: Context<AddProduct>, name: String) -> Result<()> {
        let database: &mut Account<Database> = &mut ctx.accounts.database;

        if !database.products.iter().any(|product| product.name == name) {
            return err!(Errors::NoProductFoundToRemove);
        }

        if let Some(pos) = database.products.iter().position(|product| *product.name == name) {
            database.products.remove(pos);
        }

        let sum: f64 = database.products.iter().map(|product| product.price).sum();
        database.average_price = sum / database.products.len() as f64;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetupDatabase<'info> {
    #[account(init, payer = user, space = 9000 )]
    pub database: Account<'info, Database>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddProduct<'info> {
    #[account(mut)]
    pub database: Account<'info, Database>,
}

#[derive(Accounts)]
pub struct RemoveProduct<'info> {
    #[account(mut)]
    pub database: Account<'info, Database>,
}

#[error_code]
pub enum Errors {
    #[msg("A product witht the same name already exists")]
    DuplicateProduct,

    #[msg("No such product found to remove")]
    NoProductFoundToRemove,
}