resource "azurerm_storage_account" "ff-admin-api" {
  name                      = "sainfapp${local.settings.environment}${local.settings.locabbrev}${local.settings.service}"
  resource_group_name       = azurerm_resource_group.ff-admin-api.name
  location                  = local.settings.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  account_kind              = "StorageV2"
  enable_https_traffic_only = true
  min_tls_version           = "TLS1_2"
  allow_blob_public_access  = false
  tags = merge(

    local.settings.default_tags,
    local.settings.tags,
  )
}