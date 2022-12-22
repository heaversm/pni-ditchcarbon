const path = require("path");
const fs = require("fs");
const express = require("express");
let dotenv = require("dotenv").config();
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

const sdk = require("api")("@ditch-carbon/v1.0#17ljqvglbuxy0bt");
const ditchCarbonKey = process.env.DITCH_CARBON_KEY;
sdk.auth(ditchCarbonKey);

const productData = require("./pni-data.json");

const productNameData = require("./pni-products.json");
const productBrandData = require("./pni-brands.json");
const productPriceData = require("./pni-prices.json");

const mergeArraysIntoObject = function (array1, array2, array3) {
  if (!array1 || !array2 || !array3) {
    return null;
  }

  let mergedArray = [];
  for (let i = 0; i < array1.length; i++) {
    mergedArray.push({
      name: array1[i],
      manufacturer: array2[i],
      price: array3[i],
    });
  }
  return mergedArray;
};

const getProductData = async function (product) {
  const productPromise = new Promise((resolve, reject) => {
    sdk
      .lookupProduct({
        name: product.name,
        manufacturer: product.manufacturer,
        price_cents: product.price * 100,
        price_currency: "USD",
      })
      .then(({ data }) => {
        console.log(data);
        resolve(data);
      })
      .catch((err) => {
        console.error(err);
        resolve({
          carbon_footprint: "unknown",
          methodology: "unknown",
        });
      });
  });
  return productPromise;
};

const getAllProducts = async function (products) {
  const allProductsPromise = new Promise((resolve, reject) => {
    const allCarbonData = [];
    const numProducts = products.length;
    numProductsProcessed = 0;
    let totalCarbon = 0;
    products.forEach(async (product, i) => {
      const carbonData = await getProductData(product);
      numProductsProcessed++;
      // console.log(carbonData);
      productData[i].carbon_footprint = carbonData?.carbon_footprint
        ? carbonData.carbon_footprint
        : "unknown";
      productData[i].methodology = carbonData?.methodology
        ? carbonData.methodology
        : "unknown";

      if (carbonData?.carbon_footprint) {
        totalCarbon += carbonData.carbon_footprint;
        allCarbonData.push(carbonData);
        //MH TODO: merge with original product data
      }
      console.log(numProducts, numProductsProcessed);

      if (numProductsProcessed === numProducts) {
        console.log("finished");
        //console.log(totalCarbon);
        // console.log(allCarbonData);
        resolve(allCarbonData);
        //resolve(totalCarbon.toFixed(2));
      }
    });
  });
  return allProductsPromise;
};

const writeData = function (data) {
  const dataJSON = JSON.stringify(data);

  fs.writeFile("./pni-carbondata.json", dataJSON, "utf8", (err) => {
    if (err) {
      console.log(`Error writing file: ${err}`);
    } else {
      console.log(`File is written successfully!`);
    }
  });
};

app.get("/mergeData", async (req, res) => {
  //create merged data array of product names, brands, and prices

  const mergedData = mergeArraysIntoObject(
    productNameData,
    productBrandData,
    productPriceData
  );
  console.log(mergedData);
  res.send(mergedData);
});

app.get("/", async (req, res) => {
  //get product carbon data and write to file
  const allProducts = await getAllProducts(productData);
  console.log(allProducts);
  writeData(productData);
  res.send("Products written to file with their carbon data");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
