import * as jose from "jose";
import { createPublicKey } from "crypto";
import canonicalize from "canonicalize";

if (process.argv.length !== 6) {
  throw new Error("Invalid number of arguments past! Format: npm run sig-verify <wineryId> <pubKeyHex> <signatureHex> <offchainJson>");
}

async function run() {
  const wineryId = process.argv[2];
  const response = await fetch(`https://api.pro.cf-bolnisi-mainnet.eu-west-1.bnwa.metadata.dev.cf-deployments.org/api/v1/pubkeys/${wineryId}/v/0`);
  if (response.status !== 200) {
    throw new Error("Could not retrieve winery public key - are you sure the winery ID (first argument) past is correct?");
  }

  const wineryKeyBytesApi = new Uint8Array(await response.arrayBuffer());
  const wineryKeyBytesArg = new Uint8Array(Buffer.from(process.argv[3], "hex"));

  if (JSON.stringify(wineryKeyBytesApi) !== JSON.stringify(wineryKeyBytesArg)) {
    throw new Error(`Provided hex-encoded winery public key does not match the one fetched from the URL with winery ID ${wineryId}`);
  }

  // JSON.parse since we are wrapping in single quotes
  const canonicalized = canonicalize(JSON.parse(process.argv[5]));
  if (!canonicalized) {
    throw new Error("Error canonicalising data...");
  }
  
  const offchainBase64url = Buffer.from(canonicalized).toString("base64url");
  await jose.flattenedVerify({
    payload: offchainBase64url,
    signature: Buffer.from(process.argv[4], "hex").toString("base64url"),
    protected: "eyJhbGciOiJFZERTQSJ9"
  }, createPublicKey({
    key: {
      kty: "OKP",
      crv: "Ed25519",
      x: Buffer.from(process.argv[3], "hex").toString("base64url")
    },
    format: "jwk"
  }));

  // Will throw above if not successful
  console.log("Verficiation successful");
}

run();
