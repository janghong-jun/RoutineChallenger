import { spawn } from 'node:child_process';

const url = 'http://localhost:3000';
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const devProcess =
  process.platform === 'win32'
    ? spawn(
        process.env.ComSpec || 'cmd.exe',
        ['/d', '/s', '/c', 'pnpm.cmd exec turbo run dev --ui=stream'],
        { stdio: 'inherit' },
      )
    : spawn(pnpmCommand, ['exec', 'turbo', 'run', 'dev', '--ui=stream'], {
        stdio: 'inherit',
      });

let opened = false;

const openBrowser = () => {
  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', '""', url], { stdio: 'ignore', detached: true }).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref();
  }
};

const pollServer = async () => {
  if (opened) {
    return;
  }

  try {
    const response = await fetch(url);
    if (response.ok) {
      opened = true;
      openBrowser();
    }
  } catch {
    // The server is still starting.
  }

  if (!opened) {
    setTimeout(pollServer, 500);
  }
};

setTimeout(pollServer, 500);

devProcess.on('exit', (code) => {
  process.exitCode = code ?? 0;
});
