import * as jose from "jose";
import { createPrivateKey, createPublicKey } from "crypto";
import canonicalize from "canonicalize";

async function run() {
  const privKey = createPrivateKey({
    key: { 
      kty: "OKP",
      crv: "Ed25519",
       x: "CV-aGlld3nVdgnhoZK0D36Wk-9aIMlZjZOK2XhPMnkQ",
       d: "m5N7gTItgWz6udWjuqzJsqX-vksUnxJrNjD5OilScBc"
    },
    format: "jwk"
  });

  const obj = {
    "company_name": "test",
    "company_rs_code": "xyz",
    "certificate_number": "GE-12345",
    "certificate_type": "TYPE-001",
    "export_country": "USA",
    "exam_protocol_number": "Analysis 2a",
    "tasting_protocol_number": "Tasting 5p",
    "products": [
        {
            "lot_number": "12345678920",
            "wine_name": "Wine Name",
            "wine_description": "Description of this wine",
            "serial_name": "Wine Serial No",
            "origin": "Product origin",
            "viticulture_area": "Bolnisi area",
            "type": "TYPE-001",
            "color": "WHITE",
            "sugar_content_category": "Dry",
            "grape_variety": "GrapeA",
            "harvest_year": 2022,
            "delayed_on_chacha": false,
            "bottle_type": "Ceramic",
            "bottling_date": "2022-01-22",
            "bottle_volume": 5.5,
            "bottle_count_in_lot": 1000
        }
    ]
  };

  const canonicalized = canonicalize(obj);
  if (!canonicalized) {
    throw new Error("Error canonicalising data...");
  }
  console.log(canonicalized);
  
  const offchainBase64url = Buffer.from(canonicalized).toString("base64url");
  const resp = await new jose.FlattenedSign(Buffer.from(offchainBase64url, "base64url")).setProtectedHeader({ alg: "EdDSA" }).sign(privKey);
  console.log(`resp is ${JSON.stringify(resp, null, 2)}`);
}

run();
