import { ServiceBusClient, ServiceBusMessage } from "@azure/service-bus";
import { ServiceBase } from "../serviceBase";

export class ServiceBusUtility extends ServiceBase {
    public async serviceBusCall(
        leadObj: object,
        connectionStringKey: string,
        topicName: string,
        appProperties: any
    ): Promise<boolean> {
        try {
            // Get the corressponding values for the incoming keys.
            const connectionStringVal = process.env[connectionStringKey];
            const topicNameVal = process.env[topicName];
            //Message Builder
            let message: ServiceBusMessage = {
                contentType: "application/json",
                body: leadObj,
            };
            if (appProperties) {
                message.applicationProperties = appProperties;
            }

            await this.sendToServiceBus(connectionStringVal, topicNameVal, message);
            return true;
        } catch (error) {
            const errorMsg = `Error in creating message for Service Bus for ${topicName}`;
            this.customLogger.error(errorMsg, error);
            throw new Error(errorMsg);
        }
    }

    private async sendToServiceBus(
        connectionString: string,
        topicName: string,
        message: ServiceBusMessage
    ): Promise<void> {
        const sbClient: ServiceBusClient = new ServiceBusClient(connectionString);
        const sender = sbClient.createSender(topicName);
        try {
            await sender.sendMessages(message);
            console.log(`Successfully sent a message to the topic: ${topicName}`);
        } catch (error) {
            const errorMsg = `Error in sending message to Service Bus for ${topicName}`;
            this.customLogger.error(errorMsg, error);
            throw new Error(errorMsg);
        } finally {
            await sender.close();
            await sbClient.close();
        }
    }
}
