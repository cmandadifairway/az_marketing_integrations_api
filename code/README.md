# FairwayFirst Client-API

This function app interacts with the FairwayFirst mobile application as well as the admin dashboard web app.

## Pre-Debugging
Need the following installed:
- Node major version 12 or higher
- Azure Functions VS Code extension

Need a local.settings.json file with the following
```
{
  "IsEncrypted": false,
  "Values": {
    "environment": "local",
    "FF--COSMOS--URL": "mongodb://cosmos-fim-infapp-dev-cus-ffinf:uacCsk9n39oc5WLANF8tBH9TekclsTGbrrYVIO3xgGfvQjt1g7el0n6lIWepmbVjfZpZLa0toS6kseeIJJD9Kw==@cosmos-fim-infapp-dev-cus-ffinf.mongo.cosmos.azure.com:10255/[database]?ssl=true",
    "FF--COSMOS--NAME": "cosdb-fim-infapp-dev-cus-ffinf",
    "KEY_VAULT_URL": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FF-SB-WEBHOOK-CONSTRING": "",
    "FF-SB-NOTIFICATIONS-TOPIC": "topic-fim-dev-ffapi-notifications-retry",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true"
  },
  "Host": {
    "LocalHttpPort": 7071,
    "CORS": "*"
  }
}
```
This does not include the necessary settings for the HomeBird API nor the FF-SB-WEBHOOK-CONSTRING value for the SendPushNotification API. Can reach out to Hannah Strachn if you need to test these APIs.

The value for the notifications topic seen above is intentionally set to '...-retry' so that you do not pick up live service bus messages and do not see unnecessary errors. When needing to test with live messages, simply remove the '-retry' part.

## Debugging
This code has been integrated with VS Code for local debugging and utilizing break points.

Go to the Run and Debug tab in VS Code and the drop down (at the top of the panel) should default to 'Attach to Node Functions'. Click 'Start Debugging' or F5 to kick off the process. It will install packages and run the app but first you may see a pop up with a message:
>Failed to verify "AzureWebJobsStorage" connection specified in "local.settings.json".

Just click the 'Debug anyway' button.

Pay attention to the console. Sometimes it has been known to stop itself immediately after starting. It's random.

## Package info
This project includes express and it's only used during the webpack stage of a build. Seen when running command "npm run build:prod" locally.

## License
Fairway Independnet Mortgage
