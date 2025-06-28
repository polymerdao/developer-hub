---
sidebar_position: 0
sidebar_label: 'Solana to EVM'
---

# Solana Logs verification requirements

This guide will walk you through the process of proving and verifying Solana program logs on EVM chains using Polymer's state proof system. By following these steps, you'll be able to emit logs on Solana and then cryptographically verify them on any EVM chain.

This Solana documentation section will follow this example: [solana-polymer-prover-cpi](https://github.com/dpbmaverick98/solana-polymer-prover-cpi)

### Overview

1. Emit a log message on Solana with a specific format
2. Generate a state proof using Polymer's API
3. Verify the proof on an EVM chain using Polymer's prover contract

## Log Format Requirements

For logs to be properly recognized by the Light client on Polymer Rollup, you must:

1. Use the `msg!` macro in your Solana program
2. Include the `Prove:` prefix in your log messages
3. Emit the log from the program that you want to validate

Here's an example of a properly formatted log in Rust:

```rust
// Inside your Solana program
pub fn log_key_value(ctx: Context<LogKeyValue>, key: String, value: String) -> Result<()> {
    // Update state
    let logger_account = &mut ctx.accounts.logger_account;
    logger_account.nonce += 1;

    // Emit properly formatted log with "Prove:" prefix
    msg!("Prove: Key: {}, Value: {}, Nonce: {}", key, value, logger_account.nonce);

    // You can emit multiple provable logs in one transaction
    msg!("Prove: Another log that can be verified!");

    Ok(())
}

```

### Important Notes for Log Emission

- **Program Identity**: The logs must be emitted directly from the program you want to validate, not from a CPI call to another program.
- **Log Size**: Keep logs reasonably sized (<500 bytes) to ensure they fit in the transaction receipt.
- **Multiple Logs**: You can emit multiple logs with the "Prove:" prefix in a single transaction.
- **Transaction Success**: Only logs from successful transactions can be proven.
