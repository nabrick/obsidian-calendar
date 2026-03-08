![Version](https://img.shields.io/badge/version-1.0.0-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)
![Status](https://img.shields.io/badge/status-active-lightgrey.svg)

# Calendario for Obsidian
Plugin para Obsidian que añade un calendario interactivo en el panel lateral para crear y navegar tus notas diarias.

## Características
- Calendario mensual en el **panel lateral derecho**
- Marcador visual en días que ya tienen nota
- **Resaltado de hoy** con contorno de acento
- Clic en un día → abre la nota si existe, o **crea una nueva** automáticamente
- Botón **Hoy** para volver al mes actual
- Carpeta y prefijo de nombre de nota **configurables** desde Ajustes
- Comando integrado: `Abrir Calendario`

## Instalación

### Método manual (GitHub)

1. Descarga este repositorio como `.zip`
2. Extrae el contenido
3. Copia la carpeta `calendar-plugin` dentro de:
   ```
   <tu-vault>/.obsidian/plugins/
   ```
4. Abre Obsidian → *Settings* → *Community plugins*
5. Activa **Calendario**

> Asegúrate de tener activados los *Community plugins*.

## Uso

1. Haz clic en el icono 📅 del ribbon lateral, o usa el comando `Abrir Calendario`
2. Navega entre meses con `←` y `→`
3. Haz clic en cualquier día para abrir o crear la nota de ese día
4. Los días con nota aparecen resaltados en color de acento

## Configuración

Ve a **Settings → Calendario** para personalizar:

| Opción | Descripción | Por defecto |
|---|---|---|
| Carpeta de notas diarias | Dónde se guardan las notas | `Diario` |
| Prefijo del nombre de nota | Texto antes de la fecha en el nombre del archivo | `Diario` |

Ejemplo con los valores por defecto: la nota del 1 de junio de 2025 se crea como `Diario/Diario 2025-06-01.md`.

## Estructura del proyecto

```
calendar-plugin/
├── main.js
├── manifest.json
├── package.json
└── styles.css
```

## Licencia

Este proyecto está bajo licencia **MIT**

## Contribuciones

Pull requests y mejoras son bienvenidas.