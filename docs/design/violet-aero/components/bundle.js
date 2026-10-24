/* @ds-bundle: {"format":4,"namespace":"VioletAero","components":[{"name":"GlossButton"},{"name":"Tag"},{"name":"Eyebrow"},{"name":"Icon"},{"name":"IconTile"},{"name":"Orb"},{"name":"Bubble"},{"name":"GlassCard"},{"name":"GlassNav"},{"name":"SectionHeader"},{"name":"StackCard"},{"name":"ProjectCard"},{"name":"AeroWindow"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  }
  function omit(obj, keys) {
    var out = {};
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) === -1) out[k] = obj[k];
    }
    return out;
  }

  var PATHS = {
    web: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M3 12h18' }], ['path', { d: 'M12 3a14 14 0 0 1 0 18' }], ['path', { d: 'M12 3a14 14 0 0 0 0 18' }]],
    mobile: [['rect', { x: 6, y: 2.5, width: 12, height: 19, rx: 3 }], ['path', { d: 'M11 18h2' }]],
    desktop: [['rect', { x: 2.5, y: 4, width: 19, height: 13, rx: 2 }], ['path', { d: 'M8 21h8' }], ['path', { d: 'M12 17v4' }]],
    infra: [['path', { d: 'M12 2.5l8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5z' }], ['path', { d: 'M3.5 7.25L12 12l8.5-4.75' }], ['path', { d: 'M12 12v9.5' }]],
    design: [['path', { d: 'M12 19l7-7 3 3-7 7z' }], ['path', { d: 'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z' }], ['path', { d: 'M2 2l7.6 7.6' }], ['circle', { cx: 11, cy: 11, r: 2 }]],
    'arrow-right': [['path', { d: 'M5 12h14' }], ['path', { d: 'M13 6l6 6-6 6' }]],
    'arrow-up-right': [['path', { d: 'M7 17L17 7' }], ['path', { d: 'M8 7h9v9' }]]
  };

  function Icon(p) {
    var parts = PATHS[p.name] || [];
    var size = p.size || 24;
    var strokeWidth = p.strokeWidth || (p.name && p.name.indexOf('arrow') === 0 ? 2.4 : 1.9);
    var a11y = p.label ? { role: 'img', 'aria-label': p.label } : { 'aria-hidden': 'true' };
    return h('svg', Object.assign({
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth: strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', className: p.className
    }, a11y), parts.map(function (part, i) { return h(part[0], Object.assign({ key: i }, part[1])); }));
  }

  function GlossButton(p) {
    var variant = p.variant || 'violet';
    var size = p.size || 'md';
    var rest = omit(p, ['variant', 'size', 'className', 'children', 'href', 'icon']);
    var cls = cx('va-btn', 'va-btn-' + variant, 'va-btn-' + size, p.className);
    var kids = [h('span', { key: 'l' }, p.children)];
    if (p.icon) kids.push(h('span', { key: 'i', className: 'va-btn-icon' }, h(Icon, { name: p.icon, size: size === 'lg' ? 20 : 18 })));
    if (p.href) return h('a', Object.assign({}, rest, { href: p.href, className: cls }), kids);
    return h('button', Object.assign({ type: 'button' }, rest, { className: cls }), kids);
  }

  function Tag(p) {
    return h('span', { className: cx('va-tag', 'va-tag-' + (p.tone || 'pearl'), p.className) }, p.children);
  }

  function Eyebrow(p) {
    return h('span', { className: cx('va-eyebrow', 'va-eyebrow-' + (p.tone || 'sky'), p.className) }, p.children);
  }

  function IconTile(p) {
    return h('span', { className: cx('va-icon-tile', p.className), 'aria-hidden': p.label ? undefined : 'true', 'aria-label': p.label, role: p.label ? 'img' : undefined },
      p.children || h(Icon, { name: p.icon || 'web', size: 26 }));
  }

  function Orb(p) {
    return h('span', { className: cx('va-orb', 'va-orb-' + (p.size || 'md'), p.className), 'aria-hidden': p.decorative ? 'true' : undefined },
      h('span', null, p.children));
  }

  function Bubble(p) {
    var size = p.size || 60;
    var style = Object.assign({ width: size + 'px', height: size + 'px' }, p.style || {});
    return h('span', { className: cx('va-bubble', p.tone === 'dusk' && 'va-bubble-dusk', p.className), style: style, 'aria-hidden': 'true' });
  }

  function GlassCard(p) {
    var as = p.as || 'div';
    var rest = omit(p, ['as', 'radius', 'padding', 'lift', 'className', 'children']);
    return h(as, Object.assign({}, rest, {
      className: cx('va-glass', 'va-glass-' + (p.radius || 'xl'), 'va-glass-pad-' + (p.padding || 'md'), p.lift !== false && 'va-glass-lift', p.className)
    }), p.children);
  }

  function GlassNav(p) {
    var links = p.links || [];
    return h('nav', { className: cx('va-nav', p.className), 'aria-label': p.label || 'Основная навигация' },
      h('a', { className: 'va-nav-brand', href: p.brandHref || '#top' },
        h(Orb, { size: 'sm', decorative: true }, p.mark || '</>'),
        h('span', null, p.brand)),
      h('div', { className: 'va-nav-links' },
        links.map(function (l, i) { return h('a', { key: i, className: 'va-nav-link', href: l.href }, l.label); }),
        p.cta ? h(GlossButton, { href: p.cta.href, size: 'md' }, p.cta.label) : null));
  }

  function SectionHeader(p) {
    return h('div', { className: cx('va-section-head', p.className) },
      h('div', { className: 'va-section-head-main' },
        p.eyebrow ? h(Eyebrow, { tone: p.tone === 'dusk' ? 'dusk' : 'sky' }, p.eyebrow) : null,
        h('h2', { className: 'va-section-title', id: p.id }, p.title)),
      p.aside ? (typeof p.aside === 'string' ? h('p', { className: 'va-section-aside' }, p.aside) : p.aside) : null);
  }

  function tagList(tags, firstTone) {
    return h('div', { className: 'va-tags' }, (tags || []).map(function (t, i) { return h(Tag, { key: i, tone: 'pearl' }, t); }));
  }

  function StackCard(p) {
    return h(GlassCard, { as: 'article', radius: 'xl', padding: 'md', className: cx('va-card-col', p.className) },
      h(IconTile, { icon: p.icon }),
      h('h3', { className: 'va-card-title' }, p.title),
      p.text ? h('p', { className: 'va-card-text' }, p.text) : null,
      tagList(p.tags));
  }

  function ProjectCard(p) {
    return h(GlassCard, { as: 'article', radius: '2xl', padding: 'sm', className: cx('va-project', p.className) },
      h('div', { className: 'va-well' },
        p.image ? h('img', { src: p.image, alt: p.imageAlt || '' }) : h('span', { className: 'va-well-empty' }, p.placeholder || '[скриншот проекта]'),
        p.platform ? h(Tag, { tone: 'violet' }, p.platform) : null),
      h('div', { className: 'va-project-body' },
        h('div', { className: 'va-project-head' },
          h('h3', { className: 'va-project-title' }, p.title),
          p.year ? h('span', { className: 'va-project-year' }, p.year) : null),
        p.text ? h('p', { className: 'va-project-text' }, p.text) : null,
        tagList(p.tags)));
  }

  function AeroWindow(p) {
    var kind = p.kind || 'browser';
    var style = Object.assign({}, p.style || {});
    return h('div', { className: cx('va-window', p.className), style: style, 'aria-hidden': p.decorative === false ? undefined : 'true' },
      h('div', { className: 'va-window-bar' },
        kind === 'browser' ? h('span', { className: 'va-window-url' }, p.url || '[ваш-домен].dev') : null,
        h('span', { className: 'va-window-ctl' }),
        h('span', { className: 'va-window-ctl' }),
        h('span', { className: 'va-window-close' })),
      h('div', { className: 'va-window-client' }, p.children),
      p.label ? h(Tag, { tone: 'violet' }, p.label) : null);
  }

  var api = {
    GlossButton: GlossButton, Tag: Tag, Eyebrow: Eyebrow, Icon: Icon, IconTile: IconTile, Orb: Orb, Bubble: Bubble,
    GlassCard: GlassCard, GlassNav: GlassNav, SectionHeader: SectionHeader, StackCard: StackCard, ProjectCard: ProjectCard, AeroWindow: AeroWindow
  };
  window.VioletAero = Object.assign(window.VioletAero || {}, api);
})();
