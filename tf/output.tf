output "FUNCAPP_NAME" {
  description = "The name of the created web app."
  value       = azurerm_windows_function_app.service-name.name
}

output "funcapp_serviceplan_name" {
  description = "The name of the created web app service plan."
  value       = azurerm_service_plan.service-name.name
}


output "FUNCAPPRG_NAME" {
  description = "The name of the webapp resource group."
  value       = azurerm_resource_group.service-name.name
}

output "keyvault_name" {
  value = azurerm_key_vault.keyVault.name
}

output "keyvault_uri" {
  value = azurerm_key_vault.keyVault.vault_uri
}

output "keyvault_id" {
  value = azurerm_key_vault.keyVault.id
}