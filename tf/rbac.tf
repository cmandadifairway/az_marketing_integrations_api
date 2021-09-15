resource "azurerm_role_assignment" "ACM_Global" {
  scope                = local.settings.acmglobal
  role_definition_name = "App Configuration Data Reader"
  principal_id         = azurerm_function_app.ffadmin.identity.0.principal_id
}

resource "azurerm_role_assignment" "ACM_Global_Secondary" {
  scope                = local.settings.acmglobalsecondary
  role_definition_name = "App Configuration Data Reader"
  principal_id         = azurerm_function_app.ffadmin.identity.0.principal_id
}