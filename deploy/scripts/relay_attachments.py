#!/usr/bin/env python
"""Copy attachment bytes from the production host to the test host.

The test environment restored the production database but never received
ALLFILE_DIR, so every legacy attachment renders in the UI and then 404s from
/BaseObject/downloadFile. This moves the referenced files across.

    uv run --with paramiko python deploy/scripts/relay_attachments.py --list names.txt --dry-run
    uv run --with paramiko python deploy/scripts/relay_attachments.py --list names.txt

`names.txt` is one `generated_name` per line - produced by
`node scripts/advice_attachments.js --list names.txt` in the backend.

Why a relay through this machine rather than rsync between the two servers:
rsync would need non-interactive auth from one host to the other, which means
either installing sshpass or planting an SSH key on the production box. Neither
is worth it for a one-off copy, and both leave something behind. This holds no
state, can be re-run, and skips whatever is already there - so an interrupted run
just resumes.

Bytes stream through `cat` on both ends over the SSH exec channel, which is
binary-safe; SFTP is not used because the test host's SFTP subsystem is
unreliable. Nothing is written to the local disk.

Safety: refuses to start if the destination would be left with less than
MIN_FREE_GB free. Both hosts' credentials come from the env files beside the
project and are never printed.
"""

import argparse
import os
import sys

import paramiko

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEST_DEFAULT = '/srv/clients/mncardio/files'
SRC_DEFAULT = '/home/admin630/upload_files'
MIN_FREE_GB = 5
CHUNK = 1 << 20


def load_env(name):
    path = os.path.join(ROOT, name)
    if not os.path.exists(path):
        sys.exit('missing credentials file: ' + path)
    values = {}
    with open(path, encoding='utf-8-sig') as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def connect(env):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        env['SSH_HOST'],
        port=int(env.get('SSH_PORT') or 22),
        username=env['SSH_USER'],
        password=env['SSH_PASSWORD'],
        timeout=30,
        banner_timeout=30,
        auth_timeout=30,
        look_for_keys=False,
        allow_agent=False,
    )
    return client


def capture(client, command, timeout=120):
    _, out, err = client.exec_command(command, timeout=timeout)
    text = out.read().decode('utf-8', 'replace').strip()
    out.channel.recv_exit_status()
    return text


def quote(value):
    """Single-quote a path for the remote shell. Names are [A-Za-z0-9_] but the
    quoting is not optional - a name is data, and data does not get to be shell."""
    return "'" + str(value).replace("'", "'\\''") + "'"


def free_bytes(client, path):
    out = capture(client, 'df -PB1 ' + quote(path) + " | awk 'NR==2{print $4}'")
    try:
        return int(out)
    except ValueError:
        return -1


def classify(client, base):
    """What the directory holds: name -> ('F'|'D', size in bytes as text).

    One `find` for the whole directory rather than a lookup per name. Feeding
    names in over stdin was the obvious approach and does not work - the remote
    shell finishes before it has drained the input, and paramiko then raises
    "Socket is closed" mid-write. A directory listing is ~15k lines, which costs
    nothing next to 638 round trips.

    Depth 2 because an older upload is a DIRECTORY holding a single file called
    `file`; the size that matters is the inner one.
    """
    script = (
        'cd ' + quote(base) + " || exit 1; find . -maxdepth 2 -printf '%y|%P|%s\\n' 2>/dev/null"
    )
    _, out, _ = client.exec_command(script, timeout=900)
    result = {}
    inner = {}
    for line in out.read().decode('utf-8', 'replace').splitlines():
        parts = line.strip().split('|')
        if len(parts) != 3 or not parts[1]:
            continue
        kind, name, size = parts
        if '/' in name:
            if name.endswith('/file'):
                inner[name[: -len('/file')]] = size
            continue
        if kind == 'f':
            result[name] = ('F', size)
        elif kind == 'd':
            result[name] = ('D', '-')
    out.channel.recv_exit_status()

    for name, size in inner.items():
        if result.get(name, ('', ''))[0] == 'D':
            result[name] = ('D', size)
    return result


def stream(src_client, src_path, dst_client, dst_path):
    """cat on one side, cat > on the other. Returns bytes moved."""
    _, src_out, _ = src_client.exec_command('cat ' + quote(src_path), timeout=3600)
    _, dst_out, dst_err = dst_client.exec_command(
        'mkdir -p "$(dirname ' + quote(dst_path) + ')" && cat > ' + quote(dst_path), timeout=3600
    )
    moved = 0
    while True:
        chunk = src_out.channel.recv(CHUNK)
        if not chunk:
            break
        dst_out.channel.sendall(chunk)
        moved += len(chunk)
    dst_out.channel.shutdown_write()
    code = dst_out.channel.recv_exit_status()
    src_out.channel.recv_exit_status()
    if code != 0:
        raise IOError(dst_err.read().decode('utf-8', 'replace').strip() or 'write failed')
    return moved


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--list', required=True, help='file of generated_name values, one per line')
    parser.add_argument('--src', default=SRC_DEFAULT)
    parser.add_argument('--dest', default=DEST_DEFAULT)
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--limit', type=int, default=0, help='copy at most N files (a smoke test)')
    args = parser.parse_args()

    with open(args.list, encoding='utf-8') as handle:
        names = [line.strip() for line in handle if line.strip()]
    names = list(dict.fromkeys(names))
    print(str(len(names)) + ' names to consider')

    prod = connect(load_env('ssh.env'))
    test = connect(load_env('test-environment.env'))
    try:
        source = classify(prod, args.src)
        target = classify(test, args.dest)
        print('production holds ' + str(len(source)) + ' entries; test host holds ' + str(len(target)))

        todo = []
        absent_upstream = []
        already = 0
        total = 0
        for name in names:
            kind, size = source.get(name, ('X', '-'))
            if kind == 'X':
                absent_upstream.append(name)
                continue
            if target.get(name, ('X', '-'))[0] != 'X':
                already += 1
                continue
            todo.append((name, kind))
            if size.isdigit():
                total += int(size)

        print('already on the test host : ' + str(already))
        print('missing upstream too     : ' + str(len(absent_upstream)))
        print('to copy                  : ' + str(len(todo)) + ' (' + str(round(total / 1048576.0, 1)) + ' MB)')

        free = free_bytes(test, args.dest)
        print('free on the test host    : ' + str(round(free / 1073741824.0, 1)) + ' GB')
        if free >= 0 and (free - total) < MIN_FREE_GB * 1073741824:
            sys.exit(
                'REFUSING: the copy would leave less than '
                + str(MIN_FREE_GB)
                + ' GB free, and that box serves other sites too.'
            )

        if absent_upstream:
            print('first few missing upstream: ' + ', '.join(absent_upstream[:5]))

        if args.dry_run:
            print('dry run - nothing written')
            return

        if args.limit:
            todo = todo[: args.limit]
            print('limited to ' + str(len(todo)) + ' files')

        moved = 0
        failures = []
        for i, (name, kind) in enumerate(todo, 1):
            src = args.src + '/' + name + ('/file' if kind == 'D' else '')
            dst = args.dest + '/' + name + ('/file' if kind == 'D' else '')
            try:
                moved += stream(prod, src, test, dst)
            except Exception as ex:  # noqa: BLE001 - report and keep going
                failures.append(name + ': ' + str(ex))
            if i % 25 == 0 or i == len(todo):
                print(
                    '  ' + str(i) + '/' + str(len(todo)) + '  ' + str(round(moved / 1048576.0, 1)) + ' MB'
                )

        print('copied ' + str(len(todo) - len(failures)) + ' files, ' + str(round(moved / 1048576.0, 1)) + ' MB')
        if failures:
            print('FAILED ' + str(len(failures)) + ':')
            for line in failures[:10]:
                print('  ' + line)
    finally:
        prod.close()
        test.close()


if __name__ == '__main__':
    main()
