"""
    Processes a user's password reset entry and determines their password reset status 
    based on the last password change date provided in JSON format.

    This function calculates the number of days until the next password reset based on 
    the password change date (`pswdatechange`) and the last password reset date stored 
    in the user entry. It assigns a status such as "On track", "At risk in 3 weeks", 
    "At risk in 2 weeks", "At risk today", or "Password overdue" depending on how many 
    days remain until the next reset is due (90 days from the last reset).

    Args:
        entry (Dict[str, Any]): 
            A dictionary containing user information. Expected keys include:
                - 'email' (str): The user's email address.
                - 'last_pw_reset' (str): The date of the user's last password reset in 'YYYY-MM-DD' format.
        
        pswdatechange (str): 
            A JSON-formatted string containing the date the password was last changed.
            The expected structure is:
                '{"last_changed_date": "YYYY-MM-DD"}'
            The 'last_changed_date' is the date the password was last updated.

    Returns:
        tuple: 
            A tuple consisting of:
                - email (str): The user's email address.
                - status (str): The user's password reset status, which can be one of:
                    - "On track": If the next reset is more than 21 days away.
                    - "At risk in 3 weeks": If the reset is due in 15-21 days.
                    - "At risk in 2 weeks": If the reset is due in 8-14 days.
                    - "At risk today": If the reset is due within the next 7 days.
                    - "Password overdue": If the password reset is overdue.
                    - "Invalid date format": If there is an error parsing date strings.
                    - "Invalid JSON format": If there is an error parsing the JSON string.
    """
