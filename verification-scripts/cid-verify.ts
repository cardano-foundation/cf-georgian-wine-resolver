import { CID } from "multiformats/cid";
import { code } from "multiformats/codecs/raw";
import { from } from "multiformats/hashes/hasher";
import { base58btc } from "multiformats/bases/base58";
import { createHash } from "blake2";

const blake2b256 = from({
  name: 'blake2b-256',
  code: 0xb220,  // From Multihash
  encode: (input) => {
    const hasher = createHash("blake2b", { digestLength: 32 });  // 256 -> 32 bytes
    hasher.update(Buffer.from(input));
    return hasher.digest();
  }
});

async function run() {
  if (process.argv.length !== 3) {
    throw new Error("You must provide the off-chain data as an argument without spaces");
  }
  
  // JSON.parse since we are wrapping in single quotes
  const data = Buffer.from(JSON.stringify(JSON.parse(process.argv[2]))); 
  const multihash = await blake2b256.digest(data);
  console.log(CID.createV1(code, multihash).toString(base58btc.encoder));
}

run();
