# Privacy Not Included Carbon Data

This repository contains data on the carbon emissions of products in the [Privacy Not Included](https://www.privacynotincluded.org) database. It uses the [Ditch Carbon API](https://docs.ditchcarbon.com/reference/lookupproduct) to calculate product LCA carbon emissions, and requires product names, brands, and prices.

## Methodology

Ditch Carbon's `carbon_footprint` is a product lifecycle assessment estimate for the amount of carbon dioxide equivalent (CO2e) emissions associated with a product (in kg). In addition to co2, each product is labeled with its methodology for obtaining the calculation, which can be one of the following:

* `product` when data is from a direct assessment of the requested product
* `product_category` when the data is from a product category average
* `supplier` when the data is from a spend-based calculation (which is why the API requires price)

