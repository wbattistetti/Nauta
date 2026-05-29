/**
 * Libera la porta API prima di avviare il server (evita EADDRINUSE).
 */
import { execSync } from 'child_process';

const port = String(process.env.PORT || 3001);

function freePortWindows() {
  let out = '';
  try {
    out = execSync(`netstat -ano | findstr ":${port}"`, { encoding: 'utf8' });
  } catch {
    return;
  }

  const pids = new Set();
  for (const line of out.split('\n')) {
    if (!line.includes('LISTENING')) continue;
    const local = line.trim().split(/\s+/)[1] ?? '';
    if (!local.endsWith(`:${port}`)) continue;
    const pid = line.trim().split(/\s+/).pop();
    if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid);
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`[free-port] Porta ${port} liberata (PID ${pid})`);
    } catch {
      console.warn(`[free-port] Impossibile terminare PID ${pid}`);
    }
  }
}

function freePortUnix() {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    for (const pid of pids) {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`[free-port] Porta ${port} liberata (PID ${pid})`);
    }
  } catch {
    /* nessun processo in ascolto */
  }
}

if (process.platform === 'win32') {
  freePortWindows();
} else {
  freePortUnix();
}
