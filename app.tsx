import bonsai
import bonsai.errors
import csv

AD_SERVER = "ldap://your.domain.controller"  # e.g. ldap://dc1.corp.local
AD_USER = "your-username@domain.com"         # use UPN format
AD_PASSWORD = "your-password"
BASE_DN = "DC=domain,DC=com"                 # adjust for your AD

SEARCH_FILTER = "(&(objectClass=user)(company=aakb))"

def get_users():
    client = bonsai.LDAPClient(AD_SERVER)
    client.set_credentials("SIMPLE", user=AD_USER, password=AD_PASSWORD)

    with client.connect() as conn:
        users = []

        res = conn.paged_search(
            BASE_DN,
            bonsai.LDAPSearchScope.SUBTREE,
            SEARCH_FILTER,
            attrlist=["displayName", "mail", "sAMAccountName"],
            page_size=1000
        )

        for entry in res:
            users.append(entry)
        return users

def split_display_name(display_name):
    """Split displayName into FirstName and LastName (basic approach)."""
    if not display_name:
        return "", ""
    parts = display_name.split()
    if len(parts) == 1:
        return parts[0], ""       # only one name available
    return parts[0], " ".join(parts[1:])  # first word = first name, rest = last name

def write_to_csv(users, filename="aakb_users.csv"):
    with open(filename, mode="w", newline="", encoding="utf-8") as csvfile:
        fieldnames = ["FirstName", "LastName", "sAMAccountName", "mail", "DisplayName"]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for user in users:
            display_name = user.get("displayName", [""])[0] if "displayName" in user else ""
            first, last = split_display_name(display_name)

            writer.writerow({
                "FirstName": first,
                "LastName": last,
                "sAMAccountName": user.get("sAMAccountName", [""])[0] if "sAMAccountName" in user else "",
                "mail": user.get("mail", [""])[0] if "mail" in user else "",
                "DisplayName": display_name
            })

if __name__ == "__main__":
    all_users = get_users()
    print(f"Retrieved {len(all_users)} users.")
    write_to_csv(all_users, "aakb_users.csv")
    print("Users exported to aakb_users.csv")
