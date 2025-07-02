Connection Type: File-based integration with API automation
The Cognos report is exported as a CSV file to a shared network drive. A script hosted on an internal server picks up this file and uploads the data to Monday.com using the Monday API, authenticated via API token.

🔐 Optional Security/Infra Detail:
This process involves no direct connection between the application and Cognos. Data is transferred through a controlled file drop, and the upload to Monday.com is handled securely via a server-side script using HTTPS and token-based authentication.
