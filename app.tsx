import paramiko
from prefect import task, flow

@task
def connect_sftp(host: str, port: int, username: str, password: str):
    """Connect to SFTP server and return client."""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname=host, port=port, username=username, password=password)
    sftp = ssh.open_sftp()
    return sftp, ssh

@task
def upload_file(sftp, local_path: str, remote_path: str):
    """Upload file to remote server."""
    sftp.put(local_path, remote_path)
    return f"Uploaded {local_path} to {remote_path}"

@task
def close_connection(sftp, ssh):
    """Close SFTP and SSH connections."""
    sftp.close()
    ssh.close()

@flow(name="SFTP File Upload")
def sftp_upload_flow(
    host: str,
    username: str,
    password: str,
    local_file: str,
    remote_file: str,
    port: int = 22
):
    """Upload a file via SFTP."""
    sftp, ssh = connect_sftp(host, port, username, password)
    result = upload_file(sftp, local_file, remote_file)
    close_connection(sftp, ssh)
    return result
