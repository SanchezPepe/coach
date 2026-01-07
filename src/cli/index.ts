/**
 * CLI Module - Interactive command line interface
 */

import * as readline from 'readline';

export interface MenuOption {
  key: string;
  label: string;
  action: () => Promise<void> | void;
}

export class CLI {
  private rl: readline.Interface;
  private running = false;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async promptNumber(question: string): Promise<number | null> {
    const answer = await this.prompt(question);
    const num = parseFloat(answer);
    return isNaN(num) ? null : num;
  }

  async confirm(question: string): Promise<boolean> {
    const answer = await this.prompt(`${question} (s/n): `);
    return answer.toLowerCase() === 's' || answer.toLowerCase() === 'si';
  }

  async selectFromMenu(title: string, options: MenuOption[]): Promise<void> {
    console.log(`\n${title}`);
    console.log('─'.repeat(40));

    for (const opt of options) {
      console.log(`  [${opt.key}] ${opt.label}`);
    }
    console.log('');

    const choice = await this.prompt('Selecciona una opción: ');
    const selected = options.find(o => o.key.toLowerCase() === choice.toLowerCase());

    if (selected) {
      await selected.action();
    } else {
      console.log('Opción no válida');
    }
  }

  async selectFromList<T>(title: string, items: T[], formatter: (item: T) => string): Promise<T | null> {
    console.log(`\n${title}`);
    console.log('─'.repeat(40));

    items.forEach((item, i) => {
      console.log(`  [${i + 1}] ${formatter(item)}`);
    });
    console.log(`  [0] Cancelar`);
    console.log('');

    const choice = await this.promptNumber('Selecciona: ');

    if (choice === null || choice === 0) {
      return null;
    }

    const index = Math.floor(choice) - 1;
    if (index >= 0 && index < items.length) {
      return items[index];
    }

    console.log('Selección no válida');
    return null;
  }

  print(message: string): void {
    console.log(message);
  }

  printHeader(title: string): void {
    console.log('\n' + '═'.repeat(50));
    console.log(`  ${title}`);
    console.log('═'.repeat(50));
  }

  printSection(title: string): void {
    console.log(`\n▸ ${title}`);
    console.log('─'.repeat(40));
  }

  printTable(headers: string[], rows: string[][]): void {
    const widths = headers.map((h, i) => {
      const maxRowWidth = Math.max(...rows.map(r => (r[i] || '').length));
      return Math.max(h.length, maxRowWidth);
    });

    const header = headers.map((h, i) => h.padEnd(widths[i])).join(' │ ');
    const separator = widths.map(w => '─'.repeat(w)).join('─┼─');

    console.log(header);
    console.log(separator);

    for (const row of rows) {
      const line = row.map((cell, i) => (cell || '').padEnd(widths[i])).join(' │ ');
      console.log(line);
    }
  }

  formatPace(secondsPerKm: number): string {
    const mins = Math.floor(secondsPerKm / 60);
    const secs = Math.round(secondsPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  close(): void {
    this.rl.close();
  }

  clear(): void {
    console.clear();
  }

  async waitForEnter(): Promise<void> {
    await this.prompt('\nPresiona Enter para continuar...');
  }
}
