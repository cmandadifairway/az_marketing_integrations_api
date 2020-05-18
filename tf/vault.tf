#KeyVault Resource Group
data "azurerm_resource_group" "kvrg" {
  name     = "rg-fim-${local.settings.subscipt}-${local.settings.environment}-core"



}

#Creating KeyVault
resource "azurerm_key_vault" "keyVault" {
  name                     = "kv-${local.settings.subscipt}-${local.settings.environment}-${local.settings.service}"
  location                 = local.settings.location
  resource_group_name      = data.azurerm_resource_group.kvrg.name
  tenant_id                = azurerm_function_app.service-name.identity.0.tenant_id
  tags                     = local.settings.default_tags
  soft_delete_enabled      = true
  purge_protection_enabled = false
  sku_name                 = "standard"

  lifecycle {
    ignore_changes = [
      access_policy,
    ]
  }
}



resource "azurerm_key_vault_access_policy" "webKeyVaultPolicy" {
  key_vault_id = azurerm_key_vault.keyVault.id

  tenant_id = azurerm_function_app.service-name.identity.0.tenant_id
  object_id = azurerm_function_app.service-name.identity.0.principal_id

  secret_permissions = [
    "get",
    "list",
  ]
}

resource "azurerm_key_vault_access_policy" "spnkeyvaultpolicy" {
  key_vault_id = azurerm_key_vault.keyVault.id

  tenant_id = azurerm_function_app.service-name.identity.0.tenant_id
  object_id = local.settings.spn_oid

  secret_permissions = [
    "get",
    "list",
    "set",
    "delete"
  ]
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
