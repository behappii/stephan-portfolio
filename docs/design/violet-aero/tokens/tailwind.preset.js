// Violet Aero — пресет Tailwind CSS. Подключите tokens.css, затем: presets: [require("./tailwind.preset.js")]
// Значения ссылаются на CSS-переменные из tokens.css.
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "sky-50": "var(--sky-50)",
        "sky-100": "var(--sky-100)",
        "sky-200": "var(--sky-200)",
        "sky-300": "var(--sky-300)",
        "sky-400": "var(--sky-400)",
        "ink": "var(--ink)",
        "ink-body": "var(--ink-body)",
        "ink-nav": "var(--ink-nav)",
        "ink-muted": "var(--ink-muted)",
        "lilac": "var(--lilac)",
        "lilac-line": "var(--lilac-line)",
        "lilac-tint": "var(--lilac-tint)",
        "glow": "var(--glow)",
        "violet-gloss-top": "var(--violet-gloss-top)",
        "violet-gloss-mid": "var(--violet-gloss-mid)",
        "violet-gloss-low": "var(--violet-gloss-low)",
        "violet-gloss-base": "var(--violet-gloss-base)",
        "violet-500": "var(--violet-500)",
        "violet-600": "var(--violet-600)",
        "violet-700": "var(--violet-700)",
        "violet-800": "var(--violet-800)",
        "violet-900": "var(--violet-900)",
        "dusk": "var(--dusk)",
        "on-violet": "var(--on-violet)",
        "on-dusk-muted": "var(--on-dusk-muted)",
        "glass": "var(--glass)",
        "glass-fade": "var(--glass-fade)",
        "glass-edge": "var(--glass-edge)",
        "bubble": "var(--bubble)",
        "link": "var(--link)",
        "link-hover": "var(--link-hover)"
      },
      "spacing": {
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "7": "var(--space-7)",
        "8": "var(--space-8)",
        "12": "var(--space-12)",
        "16": "var(--space-16)",
        "24": "var(--space-24)",
        "32": "var(--space-32)"
      },
      "borderRadius": {
        "xs": "var(--radius-xs)",
        "sm": "var(--radius-sm)",
        "md": "var(--radius-md)",
        "icon": "var(--radius-icon)",
        "lg": "var(--radius-lg)",
        "xl": "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "device": "var(--radius-device)",
        "pill": "var(--radius-pill)"
      },
      "boxShadow": {
        "glass": "var(--shadow-glass)",
        "glass-hover": "var(--shadow-glass-hover)",
        "gloss": "var(--shadow-gloss)",
        "gloss-sm": "var(--shadow-gloss-sm)",
        "pearl": "var(--shadow-pearl)",
        "icon": "var(--shadow-icon)",
        "window": "var(--shadow-window)",
        "focus-ring": "var(--focus-ring)"
      },
      "backdropBlur": {
        "window": "var(--blur-window)",
        "glass": "var(--blur-glass)",
        "nav": "var(--blur-nav)"
      },
      "fontFamily": {
        "display": [
          "var(--font-display)"
        ],
        "body": [
          "var(--font-body)"
        ]
      }
    }
  }
};
