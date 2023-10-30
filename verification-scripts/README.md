## Verification helper scripts

Here you will find a sample TypeScript project to verify CIDs and signatures for this project.
The verification process is described [here](../README.md).

We encourage developers to write their own verification code, or audit this sample project.
Java was used in our backend but we are providing this example in TypeScript for simplicity.

**Note:** You must have NodeJS installed on your machine before running these commands - you can download it from [here](https://nodejs.org/en/download).

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

## Example
This example from one of our test environments contains a batch of 2 signatures from the same winery with ID 1. The transaction on preprod can be viewed [here](https://preprod.beta.explorer.cardano.org/en/transaction/d01d61ee9d03bfad686c2cd8779aec21087bb30c08967f1c59662bf8e3776c5a/metadata).

Bottles found on Scantrust will have a `supply_chain_data_txid` of `d01d61ee9d03bfad686c2cd8779aec21087bb30c08967f1c59662bf8e3776c5a` and a `supply_chain_data_batch_info` of either `1#0` or `1#1` as the winery ID is 1, and it is an array of length 2 (zero-indexed).

#### CID
Firstly lets verify the CID - which can be found in the transaction metadata and is:  `zCT5htkeEgtiRKiGnCddhHqu4mKn22NkmyjrHtR7j7V8Yx6URmXM`

Using the resolver, this resolves to:
```
{"1":[{"aging_recipient":"QvevriA2","aging_time":"6 MonthsA2","bottling_date":"2018-01-01","bottling_location":"bottling_locationA2","country_of_origin":"country_of_originA2","fermentation_duration":"1 MonthA","fermentation_vessel":"QvevriA2","harvest_date":"2018-10-05","harvest_location":"harvest_locationA2","lot_number":"12340000001","number_of_bottles":2050,"origin":"originA2","pressing_date":"2018-10-05","processing_location":"processing_locationA2","produced_by":"ProducerA","producer_address":"producer_addressA2","producer_latitude":21.4500004,"producer_longitude":24.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameA2","vintage_year":2018,"wine_color":"AmberA2","wine_name":"Wine Name","wine_type":"DryA2"},{"aging_recipient":"QvevriC","aging_time":"6 MonthsC","bottling_date":"2021-01-01","bottling_location":"bottling_locationC","country_of_origin":"country_of_originC","fermentation_duration":"1 MonthC","fermentation_vessel":"QvevriC","harvest_date":"2021-10-05","harvest_location":"harvest_locationC","lot_number":"12340000003","number_of_bottles":3000,"origin":"originC","pressing_date":"2021-10-05","processing_location":"processing_locationC","produced_by":"ProducerA","producer_address":"producer_addressC","producer_latitude":45.4500004,"producer_longitude":42.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameC","vintage_year":2021,"wine_color":"AmberC","wine_name":"Wine Name","wine_type":"DryAC"}]}
```

Running the verification:
```
~ ❯ npm run cid-verify '{"1":[{"aging_recipient":"QvevriA2","aging_time":"6 MonthsA2","bottling_date":"2018-01-01","bottling_location":"bottling_locationA2","country_of_origin":"country_of_originA2","fermentation_duration":"1 MonthA","fermentation_vessel":"QvevriA2","harvest_date":"2018-10-05","harvest_location":"harvest_locationA2","lot_number":"12340000001","number_of_bottles":2050,"origin":"originA2","pressing_date":"2018-10-05","processing_location":"processing_locationA2","produced_by":"ProducerA","producer_address":"producer_addressA2","producer_latitude":21.4500004,"producer_longitude":24.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameA2","vintage_year":2018,"wine_color":"AmberA2","wine_name":"Wine Name","wine_type":"DryA2"},{"aging_recipient":"QvevriC","aging_time":"6 MonthsC","bottling_date":"2021-01-01","bottling_location":"bottling_locationC","country_of_origin":"country_of_originC","fermentation_duration":"1 MonthC","fermentation_vessel":"QvevriC","harvest_date":"2021-10-05","harvest_location":"harvest_locationC","lot_number":"12340000003","number_of_bottles":3000,"origin":"originC","pressing_date":"2021-10-05","processing_location":"processing_locationC","produced_by":"ProducerA","producer_address":"producer_addressC","producer_latitude":45.4500004,"producer_longitude":42.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameC","vintage_year":2021,"wine_color":"AmberC","wine_name":"Wine Name","wine_type":"DryAC"}]}'

> georgian-wine-verify@1.0.0 cid-verify
> ts-node-esm src/cid-verify.ts {"1":[{"aging_recipient":"QvevriA2","aging_time":"6 MonthsA2","bottling_date":"2018-01-01","bottling_location":"bottling_locationA2","country_of_origin":"country_of_originA2","fermentation_duration":"1 MonthA","fermentation_vessel":"QvevriA2","harvest_date":"2018-10-05","harvest_location":"harvest_locationA2","lot_number":"12340000001","number_of_bottles":2050,"origin":"originA2","pressing_date":"2018-10-05","processing_location":"processing_locationA2","produced_by":"ProducerA","producer_address":"producer_addressA2","producer_latitude":21.4500004,"producer_longitude":24.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameA2","vintage_year":2018,"wine_color":"AmberA2","wine_name":"Wine Name","wine_type":"DryA2"},{"aging_recipient":"QvevriC","aging_time":"6 MonthsC","bottling_date":"2021-01-01","bottling_location":"bottling_locationC","country_of_origin":"country_of_originC","fermentation_duration":"1 MonthC","fermentation_vessel":"QvevriC","harvest_date":"2021-10-05","harvest_location":"harvest_locationC","lot_number":"12340000003","number_of_bottles":3000,"origin":"originC","pressing_date":"2021-10-05","processing_location":"processing_locationC","produced_by":"ProducerA","producer_address":"producer_addressC","producer_latitude":45.4500004,"producer_longitude":42.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameC","vintage_year":2021,"wine_color":"AmberC","wine_name":"Wine Name","wine_type":"DryAC"}]}

CID is: zCT5htkeEgtiRKiGnCddhHqu4mKn22NkmyjrHtR7j7V8Yx6URmXM
```

As we can see, the CIDs match!

#### Signatures
Both of the signatures in this batch come from the same winery, so the public key is the same: `3b68fe80c0d71f985050906509fdc976e9209977a7fba7761ddf84bc654534f6`.

The signature at index 0 is `abf3a499bd227d08554cbcf11ec6d88c82c5e5c7ad89e058d17176f3f6fadc946368111212ba7ca5de7e9bad72c907f09c99fcd6bc46b9ccb2cd43763286e703`. We can extract out of the off-chain JSON the first item in the array for winery 1 (as the offchain JSON is a map of winery ID to array) and verify if its correct.

```
~ ❯ npm run sig-verify 1 3b68fe80c0d71f985050906509fdc976e9209977a7fba7761ddf84bc654534f6 abf3a499bd227d08554cbcf11ec6d88c82c5e5c7ad89e058d17176f3f6fadc946368111212ba7ca5de7e9bad72c907f09c99fcd6bc46b9ccb2cd43763286e703 '{"aging_recipient":"QvevriA2","aging_time":"6 MonthsA2","bottling_date":"2018-01-01","bottling_location":"bottling_locationA2","country_of_origin":"country_of_originA2","fermentation_duration":"1 MonthA","fermentation_vessel":"QvevriA2","harvest_date":"2018-10-05","harvest_location":"harvest_locationA2","lot_number":"12340000001","number_of_bottles":2050,"origin":"originA2","pressing_date":"2018-10-05","processing_location":"processing_locationA2","produced_by":"ProducerA","producer_address":"producer_addressA2","producer_latitude":21.4500004,"producer_longitude":24.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameA2","vintage_year":2018,"wine_color":"AmberA2","wine_name":"Wine Name","wine_type":"DryA2"}'

> georgian-wine-verify@1.0.0 sig-verify
> ts-node-esm src/sig-verify.ts 1 3b68fe80c0d71f985050906509fdc976e9209977a7fba7761ddf84bc654534f6 abf3a499bd227d08554cbcf11ec6d88c82c5e5c7ad89e058d17176f3f6fadc946368111212ba7ca5de7e9bad72c907f09c99fcd6bc46b9ccb2cd43763286e703 {"aging_recipient":"QvevriA2","aging_time":"6 MonthsA2","bottling_date":"2018-01-01","bottling_location":"bottling_locationA2","country_of_origin":"country_of_originA2","fermentation_duration":"1 MonthA","fermentation_vessel":"QvevriA2","harvest_date":"2018-10-05","harvest_location":"harvest_locationA2","lot_number":"12340000001","number_of_bottles":2050,"origin":"originA2","pressing_date":"2018-10-05","processing_location":"processing_locationA2","produced_by":"ProducerA","producer_address":"producer_addressA2","producer_latitude":21.4500004,"producer_longitude":24.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameA2","vintage_year":2018,"wine_color":"AmberA2","wine_name":"Wine Name","wine_type":"DryA2"}

Verficiation successful
```

It worked! Now lets try it on the other signature, `6b00a977f5b6077873176dec8dc50c97840d8ec3e979ac2350175c060bdf092d1a6516e291900046a1a95c6e7d1b43a848cd7430da511ffd91ff0e7c4187730f`, and the second item in the array of the offchain data.

```
~ ❯ npm run sig-verify 1 3b68fe80c0d71f985050906509fdc976e9209977a7fba7761ddf84bc654534f6 6b00a977f5b6077873176dec8dc50c97840d8ec3e979ac2350175c060bdf092d1a6516e291900046a1a95c6e7d1b43a848cd7430da511ffd91ff0e7c4187730f '{"aging_recipient":"QvevriC","aging_time":"6 MonthsC","bottling_date":"2021-01-01","bottling_location":"bottling_locationC","country_of_origin":"country_of_originC","fermentation_duration":"1 MonthC","fermentation_vessel":"QvevriC","harvest_date":"2021-10-05","harvest_location":"harvest_locationC","lot_number":"12340000003","number_of_bottles":3000,"origin":"originC","pressing_date":"2021-10-05","processing_location":"processing_locationC","produced_by":"ProducerA","producer_address":"producer_addressC","producer_latitude":45.4500004,"producer_longitude":42.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameC","vintage_year":2021,"wine_color":"AmberC","wine_name":"Wine Name","wine_type":"DryAC"}'

> georgian-wine-verify@1.0.0 sig-verify
> ts-node-esm src/sig-verify.ts 1 3b68fe80c0d71f985050906509fdc976e9209977a7fba7761ddf84bc654534f6 6b00a977f5b6077873176dec8dc50c97840d8ec3e979ac2350175c060bdf092d1a6516e291900046a1a95c6e7d1b43a848cd7430da511ffd91ff0e7c4187730f {"aging_recipient":"QvevriC","aging_time":"6 MonthsC","bottling_date":"2021-01-01","bottling_location":"bottling_locationC","country_of_origin":"country_of_originC","fermentation_duration":"1 MonthC","fermentation_vessel":"QvevriC","harvest_date":"2021-10-05","harvest_location":"harvest_locationC","lot_number":"12340000003","number_of_bottles":3000,"origin":"originC","pressing_date":"2021-10-05","processing_location":"processing_locationC","produced_by":"ProducerA","producer_address":"producer_addressC","producer_latitude":45.4500004,"producer_longitude":42.532091,"storage_vessel":"Stainless Steel","varietal_name":"varietal_nameC","vintage_year":2021,"wine_color":"AmberC","wine_name":"Wine Name","wine_type":"DryAC"}

Verficiation successful
```

Success!
