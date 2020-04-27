/**
 *
 * main() will be run when you invoke this action
 *
 * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
 */
var request = require("request-promise");
const DiscoveryV1 = require("watson-developer-cloud/discovery/v1");

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
async function main(params) {
  if (params.type === "api") {
    try {
      const summary = await request({
        method: "GET",
        uri: "https://api.rootnet.in/covid19-in/stats/latest",
        json: true,
      });
      const summary1 = await request({
        method: "GET",
        uri: "https://api.covid19api.com/summary",
        json: true,
      });
      const summary2 = await request({
        method: "GET",
        uri: "https://raw.githubusercontent.com/julianfelixleo/covid/master/sum.json",
        json: true,
      });

      if (params.location) {                                                     /* checks if tally is wanted */
          var indsta = [];                                                                 
               for (var j = 0; j < summary.data.regional.length; j++) {
                   indsta[j] = summary.data.regional[j].loc.toLowerCase();
               }
            var ussta = [];
             for (var l = 0; l < summary2.USAsta.length; l++) {
                   ussta[l] = summary2.USAsta[l].state.toLowerCase();
               }
               for (var k = 0; k < indsta.length; k++){
                        if(params.location.toLowerCase() === indsta[k].toLowerCase()){         /* checks if it as Indian state */
                            const discovery = new DiscoveryV1({
                            version: "2019-03-25",
                            iam_apikey: params.api_key,
                            url: params.url,
                             });
                            const offset = getRandomInt(50);
                            const queryParams = {
                                environment_id: params.env_id,
                                collection_id: params.collection_id,
                                natural_language_query:
                                "corona virus " + params.location || "corona virus news",
                                count: 3,
                                offset: offset,
                            };
                            try {
                                data = await discovery.query(queryParams);
                                let response = data.results.map((v, i) => {
                                    return `${v.title}
                                            ${v.text}
                                            ${v.url}`;
                                });
                                return {
                                    result:
                                            `Total Cases: ${summary.data.regional[k].totalConfirmed}\nTotal Deaths: ${summary.data.regional[k].deaths}\nTotal Recovered: ${summary.data.regional[k].discharged}\nSource: The Ministry of Health and Family Welfare\n\n`+
                                            "\n\nHere are some recent news articles we found. We can’t verify the accuracy of all of these sources.\n\n" +
                                            response.join("\n\n"),
                                        };
                                } catch (err) {
                                    return { error: "it failed : " + err };
                                    }
                  
              } 
             }
               for (var m = 0; m < ussta.length; m++){
                    if(params.location.toLowerCase() === ussta[m].toLowerCase()){                       /* checks if it a USA state */
                        const discovery = new DiscoveryV1({
                        version: "2019-03-25",
                        iam_apikey: params.api_key,
                        url: params.url,
                        });
                        const offset = getRandomInt(50);
                        const queryParams = {
                            environment_id: params.env_id,
                            collection_id: params.collection_id,
                            natural_language_query:
                            "corona virus " + params.location || "corona virus news",
                            count: 3,
                            offset: offset,
                        };
                        try {
                            data = await discovery.query(queryParams);
                            let response = data.results.map((v, i) => {
                                return `${v.title}
                                        ${v.text}
                                        ${v.url}`;
                             });
                            return {
                                result: `Total Cases: ${summary2.USAsta[m].cases}\nTotal Deaths: ${summary2.USAsta[m].deaths}\nSource: The Ministry of Health and Family Welfare\n\n`+
                                        "\n\nHere are some news recent articles we found. We can’t verify the accuracy of all of these sources.\n\n" +
                                        response.join("\n\n"),
                                    };
                        } catch (err) {
                            return { error: "it failed : " + err };
                             }
                    } 
                }
            
        for (var i = 0; i < summary1.Countries.length; i++) {
          if (
            summary1.Countries[i].Country.toLowerCase() ===
              params.location.toLowerCase() ||
            summary1.Countries[i].CountryCode.toLowerCase() ===
              params.location.toLowerCase()
          ) {
            return {
              result: `Total Cases: ${summary1.Countries[i].TotalConfirmed}\nTotal Deaths: ${summary1.Countries[i].TotalDeaths}\nTotal Recovered: ${summary1.Countries[i].TotalRecovered}\n\nSource: Johns Hopkins CSSE`,
            };
          }
             }
      return { error: "did not find location" };
               }
        // country was the old param, could be states in us.
      let totalCases = summary1.Global.TotalConfirmed;
      let totalDeaths = summary1.Global.TotalDeaths;
      let totalRecovered = summary1.Global.TotalRecovered;
      return {
        result: `Total Cases: ${totalCases}\nTotal Deaths: ${totalDeaths}\nTotal Recovered: ${totalRecovered}\n\nSource: Johns Hopkins CSSE`,
      };
      
    } catch (err) {
      return { error: "it failed : " + err };
    }
    
  } else {
    const discovery = new DiscoveryV1({
      version: "2019-03-25",
      iam_apikey: params.api_key,
      url: params.url,
    });

    const offset = getRandomInt(50);

    const queryParams = {
      environment_id: params.env_id,
      collection_id: params.collection_id,
      natural_language_query:
        "corona virus " + params.input || "corona virus news",
      count: 3,
      offset: offset,
    };
    try {
      data = await discovery.query(queryParams);
      let response = data.results.map((v, i) => {
        return `${v.title}
                 ${v.text}
                 ${v.url}`;
      });
      return {
        result:
          "Here are some news articles we found. We can’t verify the accuracy of all of these sources.\n\n" +
          response.join("\n\n"),
      };
    } catch (err) {
      return { error: "it failed : " + err };
    }
  }
}
