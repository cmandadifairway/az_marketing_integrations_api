import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log("Health Check for marketing-integration API invoked.");
    context.res = {
        status: 200,
        body: "I am Awake.",
    };
};
export default httpTrigger;
