Here you will find a sample TypeScript project to verify CIDs and signatures for this project.
The verification process is described [here](../README.md).

We encourage developers to write their own verification code, or audit this sample project.
Java was used in our backend but we are providing this example in TypeScript for simplicity.

**Note:** You must have NodeJS installed on your machine before running these commands.

```
npm i

// To verify a CID
npm run cid-verify <offchainJSON>

// To verify a signature
npm run sig-verify <wineryId> <pubKeyHex> <sigHex> <offchainJSON>
```

The CID verification accepts a single argument which is the off-chain data. This must be provided as a command line argument with no spaces (i.e. as it was returned from the API), and also be enclosed in single quotes. e.g. `npm run cid-verify '{"offchain":"data"}'`

The signature verification accepts 4 ordered arguments:
- The winery ID,
- The **hex** encoded public key,
- The **hex** encoded signature,
- The off-chain data, again with no spaces and enclosed in single quotes.

**Why hex encoding?** Just because most explorers will represent the byte stream as hex when displaying it, so this makes it easy to copy paste. If you are actually processing the transactions using a chain indexer, you should convert the byte stream to the correct format if needed (most like base64url).

The signature verification script will retrieve the public key from the API (based on the winery ID) and verify that it matches the one passed in the arguments.

**Remember!** For the CID verification, the off-chain JSON passed is the __entire__ JSON returned from the URL.
But each batch contains a set of signatures, so for each signature you must extract the correct JSON object from the correct array only - otherwise the verification will fail!
This is described in detail in [here](../README.md).
