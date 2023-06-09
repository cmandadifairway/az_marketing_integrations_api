locals {
  workspace_path = "${path.module}/workspaces/${terraform.workspace}.yaml"
  defaults       = file("${path.module}/config.yaml")
  workspace      = fileexists(local.workspace_path) ? file(local.workspace_path) : yamlencode({})
  settings = merge(
    yamldecode(local.defaults),
    yamldecode(local.workspace)
  )
}
variable "client_secret" {
  description = "What is the password for the service principal account"
}
terraform {
  backend "azurerm" {
    container_name = "tstate"
    key            = "service-name/terraform.tfstate"
  }
}

provider "azurerm" {
  subscription_id = local.settings.subscription_id
  client_id       = local.settings.spn_id
  client_secret   = var.client_secret
  tenant_id       = "a79a9d63-7f9b-498d-adff-e17197fb1575"
  features {}
}