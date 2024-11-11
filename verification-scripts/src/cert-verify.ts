import * as jose from "jose";
import { createPublicKey } from "crypto";
import canonicalize from "canonicalize";

if (process.argv.length !== 5) {
  throw new Error("Invalid number of arguments past! Format: npm run cert-verify <pubKeyHex> <signatureHex> <offchainJson>");
}

async function run() {
  const response = await fetch("https://cardano.mepa.gov.ge/api/v1/publickeys/nwa/v/0");
  if (response.status !== 200) {
    throw new Error("Could not retrieve NWA public key - server may be down...");
  }

  const nwaKeyBytesApi = new Uint8Array(await response.arrayBuffer());
  const nwaKeyBytesArg = new Uint8Array(Buffer.from(process.argv[2], "hex"));

  if (JSON.stringify(nwaKeyBytesApi) !== JSON.stringify(nwaKeyBytesArg)) {
    throw new Error(`Provided hex-encoded NWA public key does not match the one fetched from the NWA API`);
  }

  // JSON.parse since we are wrapping in single quotes
  const canonicalized = canonicalize(JSON.parse(process.argv[4]));
  if (!canonicalized) {
    throw new Error("Error canonicalising data...");
  }
  
  const offchainBase64url = Buffer.from(canonicalized).toString("base64url");
  await jose.flattenedVerify({
    payload: offchainBase64url,
    signature: Buffer.from(process.argv[3], "hex").toString("base64url"),
    protected: "eyJhbGciOiJFZERTQSJ9"
  }, createPublicKey({
    key: {
      kty: "OKP",
      crv: "Ed25519",
      x: Buffer.from(process.argv[2], "hex").toString("base64url")
    },
    format: "jwk"
  }));

  // Will throw above if not successful
  console.log("Verficiation successful");
}

run();
