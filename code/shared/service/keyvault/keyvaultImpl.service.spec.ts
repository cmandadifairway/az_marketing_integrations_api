
import { KeyVaultServiceImpl } from "./keyvaultImpl.service";
import { CustomLoggerImpl } from "../../utils/customLoggerImpl.service";
import { SecretClient } from "@azure/keyvault-secrets";
import {KeyVaultSecretMockImpl} from "../../../testing/mock/keyVaultSecretMockImpl.service";
import  container  from "../../../inversify.config";
import { TYPES } from "../../inversify/types";
import { CustomLogger } from "../../utils/customLogger.service";
import {CustomLoggerMockImpl} from "../../../testing/mock/customLoggerMockimpl.service";
describe("KeyVaultService testing",() =>{

    test("getSecretValue  throws error", async()=>{
         jest.spyOn(CustomLoggerImpl.prototype,"trace").mockImplementation(() => jest.fn());
         jest.spyOn(CustomLoggerImpl.prototype,"info").mockImplementation(() => jest.fn());
         jest.spyOn(CustomLoggerImpl.prototype,"error").mockImplementation(() => Promise.resolve());
         jest.spyOn(SecretClient.prototype,"getSecret").mockImplementation(() => Promise.reject(Error("not found")));
         const KeyVaultService=new KeyVaultServiceImpl();
         const secretValue=await KeyVaultService.getSecretValue("TPO");
         expect(secretValue).toEqual(undefined);
      
          
        
    });
    test("getSecretValue from keyVault", async()=>{
         jest.spyOn(CustomLoggerImpl.prototype,"trace").mockImplementation(() => jest.fn());
         jest.spyOn(CustomLoggerImpl.prototype,"info").mockImplementation(() => jest.fn());
         jest.spyOn(CustomLoggerImpl.prototype,"error").mockImplementation(() => Promise.resolve());
         const secret=new KeyVaultSecretMockImpl();
         secret.value="TPO";
         jest.spyOn(SecretClient.prototype,"getSecret").mockImplementation(() => Promise.resolve(secret));
        const KeyVaultService=new KeyVaultServiceImpl();
        const secretValue=await KeyVaultService.getSecretValue("TPO");
        expect(secretValue).toEqual("TPO");
    });
    test("getSecretValue to fetch from environment", async()=>{
        jest.spyOn(CustomLoggerImpl.prototype,"trace").mockImplementation(() => jest.fn());
        jest.spyOn(CustomLoggerImpl.prototype,"info").mockImplementation(() => jest.fn());
        jest.spyOn(CustomLoggerImpl.prototype,"error").mockImplementation(() => Promise.resolve());
        process.env["TPO"] = "TPO";
    container.unbind(TYPES.CustomLogger);
     container.bind<CustomLogger>(TYPES.CustomLogger).to(CustomLoggerMockImpl);
    const KeyVaultService=new KeyVaultServiceImpl();
    const secretValue=await KeyVaultService.getSecretValue("TPO");
    console.log(`secretValue is ${secretValue}`);
    expect(secretValue).toEqual("TPO");
});

});