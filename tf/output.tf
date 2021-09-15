output "FUNCAPP_NAME" {
  description = "The name of the created web app."
  value       = azurerm_function_app.ff-admin-api.name
}

output "funcapp_serviceplan_name" {
  description = "The name of the created web app service plan."
  value       = azurerm_app_service_plan.ff-admin-api.name
}


output "FUNCAPPRG_NAME" {
  description = "The name of the webapp resource group."
  value       = azurerm_resource_group.ff-admin-api.name
}
