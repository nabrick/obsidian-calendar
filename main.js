// main.js

const { Plugin, ItemView, Notice, PluginSettingTab, Setting } = require('obsidian');

const DEFAULT_SETTINGS = {
  dailyNotesFolder: 'Diario',
  dailyNotePrefix: 'Diario',
};

class CalendarPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    new Notice('Plugin Calendario activado');

    this.registerView('calendar-view', (leaf) => new CalendarView(leaf, this));

    this.addRibbonIcon('calendar', 'Abrir Calendario', () => {
      this.activateView();
    });

    this.addCommand({
      id: 'open-calendar',
      name: 'Abrir vista',
      callback: () => this.activateView(),
    });

    this.addSettingTab(new CalendarSettingTab(this.app, this));
  }

  onunload() {
    new Notice('Plugin Calendario desactivado');
  }

  async activateView() {
    let leaf = this.app.workspace.getLeavesOfType('calendar-view')[0];

    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false);
      await leaf.setViewState({ type: 'calendar-view' });
    }

    this.app.workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class CalendarView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.current = new Date();
  }

  getViewType() {
    return 'calendar-view';
  }

  getDisplayText() {
    return 'Calendario';
  }

  getIcon() {
    return 'calendar';
  }

  async onOpen() {
    this.containerEl.empty();
    this.calendarEl = this.containerEl.createDiv({ cls: 'calendar-content' });

    const files = this.app.vault.getFiles();
    await this.renderCalendar(this.current, files);
  }

  buildDateSet(files) {
    const dateSet = new Set();
    const datePattern = /\d{4}-\d{2}-\d{2}/;
    for (const file of files) {
      const match = file.name.match(datePattern);
      if (match) dateSet.add(match[0]);
    }
    return dateSet;
  }

  async renderCalendar(date, files) {
    if (!this.calendarEl) return;
    this.calendarEl.empty();

    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const dateSet = this.buildDateSet(files);

    const header = this.calendarEl.createDiv({ cls: 'calendar-header' });

    const prevBtn = header.createEl('button', { text: '←' });
    prevBtn.setAttribute('aria-label', 'Mes anterior');
    prevBtn.onclick = () => {
      this.current = new Date(this.current.getFullYear(), this.current.getMonth() - 1, 1);
      this.refreshCalendar();
    };

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    header.createEl('span', { text: `${monthNames[month]} ${year}`, cls: 'calendar-month-title' });

    const nextBtn = header.createEl('button', { text: '→' });
    nextBtn.setAttribute('aria-label', 'Mes siguiente');
    nextBtn.onclick = () => {
      this.current = new Date(this.current.getFullYear(), this.current.getMonth() + 1, 1);
      this.refreshCalendar();
    };

    const todayBtn = header.createEl('button', { text: 'Hoy' });
    todayBtn.classList.add('calendar-today-button');
    todayBtn.onclick = () => {
      this.current = new Date();
      this.refreshCalendar();
    };

    const table = this.calendarEl.createEl('table', { cls: 'calendar-table' });
    table.setAttribute('role', 'grid');

    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const headRow = table.createEl('tr');
    days.forEach(day => headRow.createEl('th', { text: day, attr: { scope: 'col' } }));

    let tempDate = new Date(year, month, 1);
    const startDay = (tempDate.getDay() + 6) % 7;
    tempDate.setDate(tempDate.getDate() - startDay);

    for (let week = 0; week < 6; week++) {
      const row = table.createEl('tr');

      for (let day = 0; day < 7; day++) {
        const isCurrentMonth = tempDate.getMonth() === month;
        const dateStr = tempDate.toISOString().split('T')[0];
        const dayNumber = tempDate.getDate();

        const td = row.createEl('td');

        if (isCurrentMonth) {
          td.setText(String(dayNumber));
          td.addClass('active-day');
          td.setAttribute('aria-label', dateStr);
          td.style.cursor = 'pointer';

          if (dateStr === todayStr) {
            td.addClass('today');
          }

          if (dateSet.has(dateStr)) {
            td.addClass('has-file');
          }

          td.onclick = async () => {
            const allFiles = this.app.vault.getFiles();
            const match = allFiles.find(f => f.name.includes(dateStr));

            if (match) {
              await this.app.workspace.openLinkText(match.path, '', false);
            } else {
              await this.createDailyNote(dateStr);
            }

            await this.refreshCalendar();
          };
        } else {
          td.setText(String(dayNumber));
          td.addClass('inactive-day');
        }

        tempDate.setDate(tempDate.getDate() + 1);
      }
    }
  }

  async refreshCalendar() {
    const files = this.app.vault.getFiles();
    await this.renderCalendar(this.current, files);
  }

  async createDailyNote(dateStr) {
    const folder = this.plugin.settings.dailyNotesFolder;
    const prefix = this.plugin.settings.dailyNotePrefix;

    try {
      await this.app.vault.createFolder(folder);
    } catch (e) {
    }

    const filePath = `${folder}/${prefix} ${dateStr}.md`;
    const content = `---
Fecha: ${dateStr}
Etiqueta: Diario
---

`;

    try {
      await this.app.vault.create(filePath, content);
      await this.app.workspace.openLinkText(filePath, '', false);
    } catch (e) {
      new Notice(`Error al crear la nota: ${e.message}`);
    }
  }

  async onClose() {
    this.containerEl.empty();
  }
}

class CalendarSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Calendario — Ajustes' });

    new Setting(containerEl)
      .setName('Carpeta de notas diarias')
      .setDesc('Carpeta donde se guardarán las notas del diario.')
      .addText(text => text
        .setPlaceholder('Diario')
        .setValue(this.plugin.settings.dailyNotesFolder)
        .onChange(async (value) => {
          this.plugin.settings.dailyNotesFolder = value.trim() || 'Diario';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Prefijo del nombre de nota')
      .setDesc('Texto antes de la fecha en el nombre del archivo. Ej: "Diario" → "Diario 2025-06-01.md"')
      .addText(text => text
        .setPlaceholder('Diario')
        .setValue(this.plugin.settings.dailyNotePrefix)
        .onChange(async (value) => {
          this.plugin.settings.dailyNotePrefix = value.trim() || 'Diario';
          await this.plugin.saveSettings();
        }));
  }
}

module.exports = CalendarPlugin;