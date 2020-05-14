output "FUNCAPP_NAME" {
  description = "The name of the created web app."
  value       = azurerm_function_app.service-name.name
}

output "funcapp_serviceplan_name" {
  description = "The name of the created web app service plan."
  value       = azurerm_app_service_plan.service-name.name
}


output "FUNCAPPRG_NAME" {
  description = "The name of the webapp resource group."
  value       = azurerm_resource_group.service-name.name
}
