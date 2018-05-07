const fs = require('fs');
const path = require('path');
require('isomorphic-fetch');
const { getCheerio$ } = require('./util');
// const allContrieCodes = ["AF", "AL", "DZ", "AO", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "KH", "CM", "CA", "CV", "KY", "TD", "CL", "CN", "CO", "CG", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "CD", "DK", "DJ", "DO", "EC", "EG", "SV", "GQ", "EE", "ET", "FJ", "FI", "FR", "GF", "PF", "GA", "GM", "GE", "DE", "GH", "GR", "GP", "GU", "GT", "GN", "GY", "HT", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LT", "LU", "MO", "MK", "MG", "MW", "MY", "MV", "ML", "MT", "MQ", "MR", "MU", "YT", "MX", "MD", "MN", "ME", "MA", "MZ", "MM", "NA", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NO", "OM", "PK", "PS", "PA", "PG", "PY", "PE", "PH", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "LC", "VC", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SO", "ZA", "KR", "ES", "LK", "SD", "SR", "SZ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TT", "TN", "TR", "TM", "UG", "UA", "AE", "GB", "US", "UY", "UZ", "VU", "VE", "VN", "YE", "ZM", "ZW"];
const contrieCodes = ["US", "TW", "CN", "JP", "KR", "HK", "SG"]

async function getDomainInfos() {
    const domainsInfo = [];
    const promises = contrieCodes.map(code => getCheerio$(`https://www.alexa.com/topsites/countries/${code}`))
    const results = await Promise.all(promises)
    results.map($ => {
        const country = $('.page-title-text').text().split('in ')[1].trim();
        $('.DescriptionCell a[href*="/site"]').each((index, anchor) => domainsInfo.push(
            {
                domain: $(anchor).text(),
                rankInCountry: index + 1,
                country,
            }
        ))
    });
    // fs.writeFileSync(path.resolve(__dirname, 'domains.json'), JSON.stringify(domains));
    return domainsInfo.sort((a, b) => a.domain.split('.')[0] > b.domain.split('.')[0] ? 1 : -1);
}

async function getPrice() {
    const priceInfo = []
    const domainInfos = await getDomainInfos();
    const promises = domainInfos.map(domainInfo =>
        fetch(`https://find.godaddy.com/domainsapi/v1/search/exact?key=dpp_search&pc=&ptl=&isc=gofhtw17&q=${domainInfo.domain.split('.')[0]}.app`, { headers: { cookie: 'currency=TWD;' } })
            .then(async res => {
                const godaddyResult = await res.json()
                return {
                    ...godaddyResult,
                    domainInfo,
                }
            }))
    const results = await Promise.all(promises)
    results.filter(({ ExactMatchDomain: { IsPurchasable } }) => IsPurchasable)
        .map(({ ExactMatchDomain, Products, domainInfo }) => priceInfo.push({ ...domainInfo, appDomain: ExactMatchDomain.Fqdn, price: Products[2].PriceInfo.CurrentPriceDisplay }))
    fs.writeFileSync(path.resolve(__dirname, 'priceInfo.json'), JSON.stringify(priceInfo));
}

getPrice()