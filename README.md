## Georgian Wine Verification How-To
This document describes the verification process for verifiable on-chain records created in the Bolnisi Georgian Wine pilot program.
For the pilot, bottles produced by approximately 30 wineries (so far) in the Bolnisi region of Georgia will have QR codes attached that link to web pages hosted by our partner, [Scantrust](https://www.scantrust.com/).
Scantrust provide a track and trace solution with anti-counterfeit QR codes.

Upon scanning a QR code, you will be presented with:
- a series of Supply Chain Management data points,
- a Supply Chain Management data transaction ID which links to a Cardano explorer and related batch information (e.g. `2#0`)

You may or may now also be presetned with:
- a Certificate of Conformity transaction ID, which also links to a Cardano explorer and related batch information (a simple index, e.g. `1`)

The transactions published on-chain serves verification information for bottles of wine produced in the Bolnisi region of Georgia - the metadata label is 1904.
The 1904 metadata label documentation describes some concepts such as key rotation - this is for future proofing reasons and not relevant to this pilot phase, so please consider this documentation as more accurate to the actual process and not the wider specification.

**Note!** The rest of this document will describe how you can verify this yourself, but we have provided a sample TypeScript project to help - check it out [here](./verification-scripts/).
The README of this project will also step through an example which may make some of this document more clear!

## Verification data
Data in our system is in general both signed and hashed, and this verification data is added to a transaction as metadata.
The data itself is stored off-chain in JSON format.

Before performing any operations on the data (or storing it!), the data must be canonicalized using the [JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785) (JCS - RFC 8785).
This makes verification safer in case the JSON gets re-arranged by other applications as it is parsed.

### Signing
Data is signed as a [JSON Web Signature](https://datatracker.ietf.org/doc/html/rfc7515) (JWS - RFC 7575). 
The public key is embedded directly in the transaction metadata as a raw byte stream.
More details on how to verify the public key later.

### Hashing
By default, we use blake2b-256 to hash data but actually other algorithms may be used as we represent all hashes on-chain as [Content Identifiers](https://github.com/multiformats/cid) (CID).
This is a self-describing hash used by [IPFS](https://ipfs.tech/) that removes the ambiguity of both the hash encoding and hash algorithm.

### Off-chain data
As mentioned, the data itself is stored off-chain and may be resolved using the deployed resolver which accepts the CID/hash as input.
The current list of resolver APIs is available [here](./apis/OFFCHAIN) - simply replace `{cid}` with the intended CID (more details later!).
The resolver will return a pre-signed URL to the off-chain object store, and at this URL you will find all of the necessary data.

#### Batching
To save on on-chain costs, data is batched periodically.
The entire batch is hashed to a single CID (always!), so every transaction will only contain a single CID.
Since there may be multiple keys involved in signing a batch, or data outside of our system (e.g. in the National Wine Agency portal), each transaction will contain as many signatures as there are items in the batch and must be individually verified.
The “batch info” on Scantrust is used to decide which item must be extracted from the batch to verify for that particular bottle of wine.

## Supply Chain Management (SCM) data
As part of this project, we have collected supply chain information directly from the producers themselves.
All of the supply chain data points you see on Scantrust (i.e. Varietal Name, Fermentation Vessel) have also been converted into a verifiable record on-chain.

Every bottle belongs to a “lot” of wine, so every bottle with the same lot number will have the same SCM data and SCM transaction ID.
The data here is considered proof of origin data.

### Batching
Each winery in our system has a unique identifier (hex-based, beginning at 1).
Since a batch of SCM objects may be come from various wineries, we use the following format for off-chain data:
```
{
 “4527”: [{...}, {...}, {...}],
 “913a”: [{...}, {...}]
}
```

Each winery ID maps to an array, and each item in the array is an object of SCM data for a singular lot.
In the above example, there are 2 wineries: winery 4527 has 3 lots in this batch, and winery 913a has 2.

The batch information follows the format of “<wineryId>#<indexInArray>” - e.g. “4527#1” - zero-indexed, of course.

### Signing
Data is signed by Ed25519 key pairs belonging to each winery.
Signatures are stored on-chain within the `d` field and the format matches the off-chain data.

Here, each winery ID maps to an object containing the public key byte-stream `pk`, the JSON Web Signature (JCS) header - `h`, and an array of JCS detached-signatures - `s`.
The header in this case only contains the key type which is why it is commonly extracted from each signature to save on space.

```
{
  "1904": {
    "t": "scm",
    "st": "georgianWine",
    "v": "1",
    "cid": "X",
    "d": {
      "4527": {
        "pk": <pubKeyBytes>,
        "h": <headerBytes>,
        "s": [<sig1Bytes>, <sig2Bytes>, <sig3Bytes>]
	    },
      "913a": {
        "pk": <pubKeyBytes>,
        "h": <headerBytes>,
        "s": [<sig1Bytes>, <sig2Bytes>]
      }
    }
  }
}
```
The batch information of `4527#1` maps to `<sig2Bytes>` here.

## Certificate of Conformity data
Certificate of Conformity data serves as the stamp of quality from the National Wine Agency of Georgia.
All exported wine, and some domestic wines will have an associated certificate; however, some scanned bottles may not.

### Batching
All data is signed by the National Wine Agency instead of individual wineries.
As a result, the batching is a simple array and for each bottle (with a certificate) the index will be available to view on Scantrust.

### Signing
Signatures are stored in the top-level `s` field which matches the off-chain data (also just an array).
Since there is only 1 key to represent the National Wine Agency, `h` and `pk` are also top-level fields.

```
{
  "1904": {
    "st": "georgianWine"
    "s": [<sig1Bytes>, <sig2Bytes>, <sig3Bytes>]
    "t": "conformityCert"
    "v": "1"
    "h": <headerBytes>
    "pk": <pubKeyBytes>
    "cid": "X"
  }
}
```

## Verification process
Firstly, you must retrieve the transaction ID from the bottle you have just scanned on Scantrust.
Using an explorer or chain indexer, read the metadata of the given transaction.

### The Content Identifier
1. Retrieve the CID from the transaction metadata (`cid` field).
2. Retrieve the off-chain data by putting the CID from the transaction metadata into the resolver URL.
3. Resolve the returned pre-signed URL and the JSON will be returned.
4. Determine the hashing algorithm, codec and encoding from the CID.
    1. By default this will be blake2b-256, raw and base58btc.
5. Canonicalise the off-chain data using the JCS algorithm. (It should already be canonicalised from the API though!)
6. Hash the entire off-chain JSON using the hashing algorithm.
7. Calculate the CID using your favourite programming language with a CID package - we are using [this Java package](https://github.com/ipld/java-cid) in our backend.
    1. Check out our [sample in TypeScript](./verification-scripts/).
8. Verify that the CIDs match!

### The signature
1. Retrieve the batch info from Scantrust.
2. Use the batch info to extract the correct JSON object from the off-chain data obtained in the previous section (post-canonicalisation).
3. Use the batch info to extract the correct public key (`pk`), JWS header (`h`) and JWS detached signature (item in `s`, depends on the batch info) from the on-chain metadata.
4. Use a listed API endpoint to retrieve the relevant public key bytes.
    1. For SCM data, use this list [here](./apis/WINERY_PUBLIC_KEYS) - you must extract the winery ID from the batch info (everything before the # symbol).
    2. For certificate data, use the list [here](./apis/NWA_PUBLIC_KEY).
5. Verify that the public key embedded in the transaction metadata is the same as the public key returned by the API.
    1. If it’s not, then the transaction is not valid!
    2. **Hint:** Each of these values is a byte-stream in the metadata, but if you are viewing this on an explorer in your browser, it is probably represented in hex encoding.
6. Convert the public key, JWS header and JWS detached signature to base64url encoding.
    1. Base64url is the standard format for JSON Web Signatures so most libraries will expect this format, but the direct bytes may work.
7. Verify the signature using a JWS or JOSE package in your language of choice - [example Java package](https://mvnrepository.com/artifact/com.nimbusds/nimbus-jose-jwt).
    1. Once again... check out our [sample in TypeScript](./verification-scripts/).
