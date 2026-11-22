# Eskgo — Design tokens

Fonte da verdade no Figma: arquivo *W5 — Do Design ao Deploy (Community)*, coleções **Primitivos** e **Semânticos**. Este documento é gerado a partir dessas coleções.

## Convenções

- Nomes em **kebab-case**; grupos separados por `/` no Figma e por `-` no CSS (`color/bg/page` → `--color-bg-page`).
- **Primitivos**: valores brutos, sem significado de uso. Escopos vazios no Figma (ficam escondidos dos seletores).
- **Semânticos**: *aliases* dos primitivos, nomeados pelo papel (`color/bg/page`, `space/inset/screen-x`). Componentes só devem usar estes.
- Modo único **Dark** (o app é escuro). Um modo `Light` poderá ser adicionado depois só na coleção semântica.
- Valores negativos: `space/neg-N` (primitivo) e `space/overlap/*` (semântico).
- Totais: **158 primitivos** · **183 semânticos**.

---

# Tokens primitivos

## Cor · `color`

| Token | Variável CSS | Valor |
|---|---|---|
| `color/neutral/0` | `--color-neutral-0` | `#ffffff` |
| `color/neutral/50` | `--color-neutral-50` | `#f2f2f2` |
| `color/neutral/400` | `--color-neutral-400` | `#9a9a9a` |
| `color/neutral/500` | `--color-neutral-500` | `#85858b` |
| `color/neutral/700` | `--color-neutral-700` | `#26262a` |
| `color/neutral/750` | `--color-neutral-750` | `#242428` |
| `color/neutral/800` | `--color-neutral-800` | `#1f1f22` |
| `color/neutral/850` | `--color-neutral-850` | `#1c1c1f` |
| `color/neutral/875` | `--color-neutral-875` | `#18181b` |
| `color/neutral/900` | `--color-neutral-900` | `#151518` |
| `color/neutral/925` | `--color-neutral-925` | `#131315` |
| `color/neutral/950` | `--color-neutral-950` | `#111111` |
| `color/neutral/975` | `--color-neutral-975` | `#0a0a0c` |
| `color/neutral/980` | `--color-neutral-980` | `#0a0a0a` |
| `color/neutral/990` | `--color-neutral-990` | `#030303` |
| `color/neutral/1000` | `--color-neutral-1000` | `#000000` |
| `color/champagne/200` | `--color-champagne-200` | `#ecddb0` |
| `color/champagne/300` | `--color-champagne-300` | `#e6d3a3` |
| `color/sand/100` | `--color-sand-100` | `#efebe1` |
| `color/gold/400` | `--color-gold-400` | `#cfae5e` |
| `color/gold/500` | `--color-gold-500` | `#c9a452` |
| `color/bronze/600` | `--color-bronze-600` | `#a8873f` |
| `color/green/500` | `--color-green-500` | `#3dbe5a` |

## Opacidade · `opacity`

| Token | Variável CSS | Valor |
|---|---|---|
| `opacity/8` | `--opacity-8` | `8` |
| `opacity/12` | `--opacity-12` | `12` |
| `opacity/35` | `--opacity-35` | `35` |
| `opacity/50` | `--opacity-50` | `50` |
| `opacity/60` | `--opacity-60` | `60` |
| `opacity/70` | `--opacity-70` | `70` |
| `opacity/85` | `--opacity-85` | `85` |
| `opacity/100` | `--opacity-100` | `100` |

## Família tipográfica · `font-family`

| Token | Variável CSS | Valor |
|---|---|---|
| `font-family/satoshi` | `--font-family-satoshi` | `Satoshi` |
| `font-family/plex-mono` | `--font-family-plex-mono` | `IBM Plex Mono` |

## Tamanho de fonte (px) · `font-size`

| Token | Variável CSS | Valor |
|---|---|---|
| `font-size/10` | `--font-size-10` | `10` |
| `font-size/11` | `--font-size-11` | `11` |
| `font-size/12` | `--font-size-12` | `12` |
| `font-size/13` | `--font-size-13` | `13` |
| `font-size/14` | `--font-size-14` | `14` |
| `font-size/15` | `--font-size-15` | `15` |
| `font-size/16` | `--font-size-16` | `16` |
| `font-size/17` | `--font-size-17` | `17` |
| `font-size/19` | `--font-size-19` | `19` |
| `font-size/20` | `--font-size-20` | `20` |
| `font-size/21` | `--font-size-21` | `21` |
| `font-size/22` | `--font-size-22` | `22` |
| `font-size/26` | `--font-size-26` | `26` |
| `font-size/29` | `--font-size-29` | `29` |
| `font-size/30` | `--font-size-30` | `30` |
| `font-size/32` | `--font-size-32` | `32` |
| `font-size/34` | `--font-size-34` | `34` |
| `font-size/36` | `--font-size-36` | `36` |
| `font-size/38` | `--font-size-38` | `38` |
| `font-size/40` | `--font-size-40` | `40` |
| `font-size/42` | `--font-size-42` | `42` |
| `font-size/44` | `--font-size-44` | `44` |
| `font-size/52` | `--font-size-52` | `52` |
| `font-size/58` | `--font-size-58` | `58` |
| `font-size/66` | `--font-size-66` | `66` |

## Peso da fonte · `font-weight`

| Token | Variável CSS | Valor |
|---|---|---|
| `font-weight/400` | `--font-weight-400` | `400` |
| `font-weight/500` | `--font-weight-500` | `500` |
| `font-weight/600` | `--font-weight-600` | `600` |
| `font-weight/700` | `--font-weight-700` | `700` |

## Altura de linha (%) · `line-height`

| Token | Variável CSS | Valor |
|---|---|---|
| `line-height/100` | `--line-height-100` | `100` |
| `line-height/125` | `--line-height-125` | `125` |
| `line-height/150` | `--line-height-150` | `150` |

## Espaçamento entre letras (% do corpo) · `letter-spacing`

| Token | Variável CSS | Valor |
|---|---|---|
| `letter-spacing/neg-5` | `--letter-spacing-neg-5` | `-5` |
| `letter-spacing/neg-4` | `--letter-spacing-neg-4` | `-4` |
| `letter-spacing/neg-3` | `--letter-spacing-neg-3` | `-3` |
| `letter-spacing/neg-2` | `--letter-spacing-neg-2` | `-2` |
| `letter-spacing/0` | `--letter-spacing-0` | `0` |
| `letter-spacing/8` | `--letter-spacing-8` | `8` |

## Espaço / gap (px) · `space`

| Token | Variável CSS | Valor |
|---|---|---|
| `space/0` | `--space-0` | `0` |
| `space/1` | `--space-1` | `1` |
| `space/2` | `--space-2` | `2` |
| `space/3` | `--space-3` | `3` |
| `space/4` | `--space-4` | `4` |
| `space/6` | `--space-6` | `6` |
| `space/8` | `--space-8` | `8` |
| `space/10` | `--space-10` | `10` |
| `space/12` | `--space-12` | `12` |
| `space/14` | `--space-14` | `14` |
| `space/16` | `--space-16` | `16` |
| `space/18` | `--space-18` | `18` |
| `space/20` | `--space-20` | `20` |
| `space/24` | `--space-24` | `24` |
| `space/28` | `--space-28` | `28` |
| `space/32` | `--space-32` | `32` |
| `space/36` | `--space-36` | `36` |
| `space/40` | `--space-40` | `40` |
| `space/44` | `--space-44` | `44` |
| `space/48` | `--space-48` | `48` |
| `space/56` | `--space-56` | `56` |
| `space/64` | `--space-64` | `64` |
| `space/80` | `--space-80` | `80` |
| `space/neg-1` | `--space-neg-1` | `-1` |
| `space/neg-2` | `--space-neg-2` | `-2` |
| `space/neg-4` | `--space-neg-4` | `-4` |
| `space/neg-6` | `--space-neg-6` | `-6` |
| `space/neg-8` | `--space-neg-8` | `-8` |
| `space/neg-12` | `--space-neg-12` | `-12` |
| `space/neg-16` | `--space-neg-16` | `-16` |
| `space/neg-20` | `--space-neg-20` | `-20` |
| `space/neg-24` | `--space-neg-24` | `-24` |

## Tamanho (px) · `size`

| Token | Variável CSS | Valor |
|---|---|---|
| `size/4` | `--size-4` | `4` |
| `size/7` | `--size-7` | `7` |
| `size/8` | `--size-8` | `8` |
| `size/16` | `--size-16` | `16` |
| `size/26` | `--size-26` | `26` |
| `size/32` | `--size-32` | `32` |
| `size/36` | `--size-36` | `36` |
| `size/40` | `--size-40` | `40` |
| `size/44` | `--size-44` | `44` |
| `size/48` | `--size-48` | `48` |
| `size/52` | `--size-52` | `52` |
| `size/56` | `--size-56` | `56` |
| `size/64` | `--size-64` | `64` |
| `size/76` | `--size-76` | `76` |
| `size/88` | `--size-88` | `88` |
| `size/480` | `--size-480` | `480` |
| `size/520` | `--size-520` | `520` |
| `size/1200` | `--size-1200` | `1200` |

## Breakpoint (px) · `breakpoint`

| Token | Variável CSS | Valor |
|---|---|---|
| `breakpoint/md` | `--breakpoint-md` | `800` |
| `breakpoint/lg` | `--breakpoint-lg` | `1100` |

## Raio (px) · `radius`

| Token | Variável CSS | Valor |
|---|---|---|
| `radius/0` | `--radius-0` | `0` |
| `radius/4` | `--radius-4` | `4` |
| `radius/12` | `--radius-12` | `12` |
| `radius/14` | `--radius-14` | `14` |
| `radius/18` | `--radius-18` | `18` |
| `radius/22` | `--radius-22` | `22` |
| `radius/26` | `--radius-26` | `26` |
| `radius/28` | `--radius-28` | `28` |
| `radius/32` | `--radius-32` | `32` |
| `radius/34` | `--radius-34` | `34` |
| `radius/36` | `--radius-36` | `36` |
| `radius/full` | `--radius-full` | `9999` |

## Contorno / stroke (px) · `stroke`

| Token | Variável CSS | Valor |
|---|---|---|
| `stroke/0` | `--stroke-0` | `0` |
| `stroke/1` | `--stroke-1` | `1` |
| `stroke/1-8` | `--stroke-1-8` | `1.8` |
| `stroke/2` | `--stroke-2` | `2` |
| `stroke/3` | `--stroke-3` | `3` |
| `stroke/4` | `--stroke-4` | `4` |
| `stroke/5` | `--stroke-5` | `5` |
| `stroke/8` | `--stroke-8` | `8` |

## Desfoque (px) · `blur`

| Token | Variável CSS | Valor |
|---|---|---|
| `blur/2` | `--blur-2` | `2` |
| `blur/12` | `--blur-12` | `12` |
| `blur/30` | `--blur-30` | `30` |

## Deslocamento de sombra (px) · `shadow-offset`

| Token | Variável CSS | Valor |
|---|---|---|
| `shadow-offset/y-10` | `--shadow-offset-y-10` | `10` |
| `shadow-offset/y-neg-12` | `--shadow-offset-y-neg-12` | `-12` |

## Duração (ms) · `duration`

| Token | Variável CSS | Valor |
|---|---|---|
| `duration/1` | `--duration-1` | `1` |
| `duration/200` | `--duration-200` | `200` |
| `duration/260` | `--duration-260` | `260` |
| `duration/320` | `--duration-320` | `320` |
| `duration/380` | `--duration-380` | `380` |
| `duration/700` | `--duration-700` | `700` |

## Curva de animação · `easing`

| Token | Variável CSS | Valor |
|---|---|---|
| `easing/ease-out` | `--easing-ease-out` | `ease-out` |
| `easing/spring-soft` | `--easing-spring-soft` | `cubic-bezier(0.2, 0.9, 0.25, 1)` |

## Camada (z-index) · `z-index`

| Token | Variável CSS | Valor |
|---|---|---|
| `z-index/header` | `--z-index-header` | `40` |
| `z-index/overlay` | `--z-index-overlay` | `50` |

---

# Tokens semânticos

## Cor · `color`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `color/bg/page` | `--color-bg-page` | `color/neutral/990` | `#030303` |
| `color/bg/page-alt` | `--color-bg-page-alt` | `color/neutral/975` | `#0a0a0c` |
| `color/bg/surface` | `--color-bg-surface` | `color/neutral/950` | `#111111` |
| `color/bg/surface-alt` | `--color-bg-surface-alt` | `color/neutral/925` | `#131315` |
| `color/bg/elevated` | `--color-bg-elevated` | `color/neutral/900` | `#151518` |
| `color/bg/sheet` | `--color-bg-sheet` | `color/neutral/875` | `#18181b` |
| `color/bg/icon` | `--color-bg-icon` | `color/neutral/750` | `#242428` |
| `color/bg/track` | `--color-bg-track` | `color/neutral/700` | `#26262a` |
| `color/bg/action` | `--color-bg-action` | `color/gold/500` | `#c9a452` |
| `color/bg/brand-soft` | `--color-bg-brand-soft` | `color/champagne/300` | `#e6d3a3` |
| `color/bg/brand-deep` | `--color-bg-brand-deep` | `color/bronze/600` | `#a8873f` |
| `color/bg/inverse` | `--color-bg-inverse` | `color/neutral/50` | `#f2f2f2` |
| `color/bg/card-light` | `--color-bg-card-light` | `color/sand/100` | `#efebe1` |
| `color/bg/knob-off` | `--color-bg-knob-off` | `color/neutral/400` | `#9a9a9a` |
| `color/bg/knob-on` | `--color-bg-knob-on` | `color/neutral/980` | `#0a0a0a` |
| `color/bg/ink` | `--color-bg-ink` | `color/neutral/980` | `#0a0a0a` |
| `color/border/default` | `--color-border-default` | `color/neutral/850` | `#1c1c1f` |
| `color/border/strong` | `--color-border-strong` | `color/neutral/700` | `#26262a` |
| `color/border/focus` | `--color-border-focus` | `color/gold/500` | `#c9a452` |
| `color/border/accent` | `--color-border-accent` | `color/champagne/300` | `#e6d3a3` |
| `color/text/primary` | `--color-text-primary` | `color/neutral/50` | `#f2f2f2` |
| `color/text/secondary` | `--color-text-secondary` | `color/neutral/400` | `#9a9a9a` |
| `color/text/muted` | `--color-text-muted` | `color/neutral/500` | `#85858b` |
| `color/text/pure` | `--color-text-pure` | `color/neutral/0` | `#ffffff` |
| `color/text/on-brand` | `--color-text-on-brand` | `color/neutral/980` | `#0a0a0a` |
| `color/text/on-brand-alt` | `--color-text-on-brand-alt` | `color/neutral/800` | `#1f1f22` |
| `color/text/accent` | `--color-text-accent` | `color/champagne/300` | `#e6d3a3` |
| `color/text/brand` | `--color-text-brand` | `color/gold/500` | `#c9a452` |
| `color/text/positive` | `--color-text-positive` | `color/green/500` | `#3dbe5a` |
| `color/icon/default` | `--color-icon-default` | `color/neutral/50` | `#f2f2f2` |
| `color/icon/brand` | `--color-icon-brand` | `color/gold/500` | `#c9a452` |
| `color/icon/on-brand` | `--color-icon-on-brand` | `color/neutral/980` | `#0a0a0a` |
| `color/feedback/success` | `--color-feedback-success` | `color/green/500` | `#3dbe5a` |
| `color/feedback/error` | `--color-feedback-error` | `color/champagne/300` | `#e6d3a3` |
| `color/category/moradia` | `--color-category-moradia` | `color/bronze/600` | `#a8873f` |
| `color/category/alimentacao` | `--color-category-alimentacao` | `color/gold/500` | `#c9a452` |
| `color/category/transporte` | `--color-category-transporte` | `color/sand/100` | `#efebe1` |
| `color/category/lazer` | `--color-category-lazer` | `color/champagne/300` | `#e6d3a3` |
| `color/category/outros` | `--color-category-outros` | `color/neutral/400` | `#9a9a9a` |
| `color/progress/fill-gold` | `--color-progress-fill-gold` | `color/gold/500` | `#c9a452` |
| `color/progress/fill-champagne` | `--color-progress-fill-champagne` | `color/champagne/300` | `#e6d3a3` |
| `color/progress/fill-bronze` | `--color-progress-fill-bronze` | `color/bronze/600` | `#a8873f` |
| `color/progress/track` | `--color-progress-track` | `color/neutral/700` | `#26262a` |
| `color/gradient/hero-start` | `--color-gradient-hero-start` | `color/bronze/600` | `#a8873f` |
| `color/gradient/hero-mid` | `--color-gradient-hero-mid` | `color/gold/400` | `#cfae5e` |
| `color/gradient/hero-end` | `--color-gradient-hero-end` | `color/champagne/200` | `#ecddb0` |
| `color/gradient/wallet-start` | `--color-gradient-wallet-start` | `color/gold/500` | `#c9a452` |
| `color/gradient/wallet-end` | `--color-gradient-wallet-end` | `color/champagne/200` | `#ecddb0` |
| `color/overlay/scrim` | `--color-overlay-scrim` | `color/neutral/990` | `#030303` |
| `color/overlay/header-glass` | `--color-overlay-header-glass` | `color/neutral/990` | `#030303` |
| `color/overlay/on-brand-soft` | `--color-overlay-on-brand-soft` | `color/neutral/980` | `#0a0a0a` |

## Opacidade · `opacity`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `opacity/scrim` | `--opacity-scrim` | `opacity/70` | `70` |
| `opacity/header-glass` | `--opacity-header-glass` | `opacity/85` | `85` |
| `opacity/on-brand-soft` | `--opacity-on-brand-soft` | `opacity/8` | `8` |
| `opacity/on-brand-strong` | `--opacity-on-brand-strong` | `opacity/12` | `12` |
| `opacity/disabled` | `--opacity-disabled` | `opacity/50` | `50` |
| `opacity/shadow-sheet` | `--opacity-shadow-sheet` | `opacity/35` | `35` |
| `opacity/shadow-card` | `--opacity-shadow-card` | `opacity/60` | `60` |

## Família tipográfica · `font-family`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `font-family/body` | `--font-family-body` | `font-family/satoshi` | `Satoshi` |
| `font-family/kicker` | `--font-family-kicker` | `font-family/plex-mono` | `IBM Plex Mono` |

## Tamanho de fonte (px) · `font-size`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `font-size/display-hero` | `--font-size-display-hero` | `font-size/66` | `66` |
| `font-size/display-xl` | `--font-size-display-xl` | `font-size/58` | `58` |
| `font-size/display-lg` | `--font-size-display-lg` | `font-size/52` | `52` |
| `font-size/display-md` | `--font-size-display-md` | `font-size/44` | `44` |
| `font-size/display-sm` | `--font-size-display-sm` | `font-size/38` | `38` |
| `font-size/title-xl` | `--font-size-title-xl` | `font-size/34` | `34` |
| `font-size/title-lg` | `--font-size-title-lg` | `font-size/32` | `32` |
| `font-size/title-md` | `--font-size-title-md` | `font-size/29` | `29` |
| `font-size/title-sm` | `--font-size-title-sm` | `font-size/26` | `26` |
| `font-size/sheet-title` | `--font-size-sheet-title` | `font-size/22` | `22` |
| `font-size/logo` | `--font-size-logo` | `font-size/20` | `20` |
| `font-size/subtitle` | `--font-size-subtitle` | `font-size/17` | `17` |
| `font-size/body-lg` | `--font-size-body-lg` | `font-size/16` | `16` |
| `font-size/body` | `--font-size-body` | `font-size/15` | `15` |
| `font-size/body-sm` | `--font-size-body-sm` | `font-size/14` | `14` |
| `font-size/caption` | `--font-size-caption` | `font-size/13` | `13` |
| `font-size/caption-sm` | `--font-size-caption-sm` | `font-size/12` | `12` |
| `font-size/kicker` | `--font-size-kicker` | `font-size/11` | `11` |
| `font-size/micro` | `--font-size-micro` | `font-size/10` | `10` |

## Peso da fonte · `font-weight`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `font-weight/regular` | `--font-weight-regular` | `font-weight/400` | `400` |
| `font-weight/medium` | `--font-weight-medium` | `font-weight/500` | `500` |
| `font-weight/semibold` | `--font-weight-semibold` | `font-weight/600` | `600` |
| `font-weight/bold` | `--font-weight-bold` | `font-weight/700` | `700` |

## Altura de linha (%) · `line-height`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `line-height/tight` | `--line-height-tight` | `line-height/100` | `100` |
| `line-height/snug` | `--line-height-snug` | `line-height/125` | `125` |
| `line-height/normal` | `--line-height-normal` | `line-height/150` | `150` |

## Espaçamento entre letras (% do corpo) · `letter-spacing`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `letter-spacing/title` | `--letter-spacing-title` | `letter-spacing/neg-3` | `-3` |
| `letter-spacing/sheet-title` | `--letter-spacing-sheet-title` | `letter-spacing/neg-2` | `-2` |
| `letter-spacing/amount` | `--letter-spacing-amount` | `letter-spacing/neg-2` | `-2` |
| `letter-spacing/number` | `--letter-spacing-number` | `letter-spacing/neg-5` | `-5` |
| `letter-spacing/number-sm` | `--letter-spacing-number-sm` | `letter-spacing/neg-4` | `-4` |
| `letter-spacing/kicker` | `--letter-spacing-kicker` | `letter-spacing/8` | `8` |

## Espaço / gap (px) · `space`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `space/gap/2xs` | `--space-gap-2xs` | `space/4` | `4` |
| `space/gap/xs` | `--space-gap-xs` | `space/8` | `8` |
| `space/gap/sm` | `--space-gap-sm` | `space/12` | `12` |
| `space/gap/md` | `--space-gap-md` | `space/16` | `16` |
| `space/gap/lg` | `--space-gap-lg` | `space/20` | `20` |
| `space/gap/xl` | `--space-gap-xl` | `space/28` | `28` |
| `space/gap/2xl` | `--space-gap-2xl` | `space/40` | `40` |
| `space/gap/inline` | `--space-gap-inline` | `space/6` | `6` |
| `space/gap/icon` | `--space-gap-icon` | `space/8` | `8` |
| `space/gap/row` | `--space-gap-row` | `space/14` | `14` |
| `space/gap/sheet` | `--space-gap-sheet` | `space/18` | `18` |
| `space/gap/label` | `--space-gap-label` | `space/2` | `2` |
| `space/gap/text-stack` | `--space-gap-text-stack` | `space/3` | `3` |
| `space/inset/screen-x` | `--space-inset-screen-x` | `space/20` | `20` |
| `space/inset/screen-x-lg` | `--space-inset-screen-x-lg` | `space/40` | `40` |
| `space/inset/screen-top` | `--space-inset-screen-top` | `space/20` | `20` |
| `space/inset/screen-top-lg` | `--space-inset-screen-top-lg` | `space/32` | `32` |
| `space/inset/screen-bottom` | `--space-inset-screen-bottom` | `space/48` | `48` |
| `space/inset/screen-bottom-lg` | `--space-inset-screen-bottom-lg` | `space/64` | `64` |
| `space/inset/sheet-x` | `--space-inset-sheet-x` | `space/20` | `20` |
| `space/inset/sheet-x-lg` | `--space-inset-sheet-x-lg` | `space/28` | `28` |
| `space/inset/sheet-top` | `--space-inset-sheet-top` | `space/12` | `12` |
| `space/inset/sheet-top-lg` | `--space-inset-sheet-top-lg` | `space/24` | `24` |
| `space/inset/sheet-bottom` | `--space-inset-sheet-bottom` | `space/28` | `28` |
| `space/inset/row` | `--space-inset-row` | `space/12` | `12` |
| `space/inset/button-x` | `--space-inset-button-x` | `space/24` | `24` |
| `space/inset/input-x` | `--space-inset-input-x` | `space/16` | `16` |
| `space/inset/chip-x` | `--space-inset-chip-x` | `space/16` | `16` |
| `space/inset/empty-x` | `--space-inset-empty-x` | `space/24` | `24` |
| `space/inset/empty-y` | `--space-inset-empty-y` | `space/40` | `40` |
| `space/inset/badge-x` | `--space-inset-badge-x` | `space/8` | `8` |
| `space/inset/badge-x-sm` | `--space-inset-badge-x-sm` | `space/6` | `6` |
| `space/overlap/header-pull` | `--space-overlap-header-pull` | `space/neg-8` | `-8` |
| `space/overlap/card-stack` | `--space-overlap-card-stack` | `space/neg-6` | `-6` |
| `space/overlap/bleed-x` | `--space-overlap-bleed-x` | `space/neg-20` | `-20` |
| `space/overlap/hairline` | `--space-overlap-hairline` | `space/neg-1` | `-1` |

## Tamanho (px) · `size`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `size/control/icon-button` | `--size-control-icon-button` | `size/44` | `44` |
| `size/control/button-height` | `--size-control-button-height` | `size/56` | `56` |
| `size/control/input-height` | `--size-control-input-height` | `size/56` | `56` |
| `size/control/chip-height` | `--size-control-chip-height` | `size/40` | `40` |
| `size/control/switch-width` | `--size-control-switch-width` | `size/52` | `52` |
| `size/control/switch-height` | `--size-control-switch-height` | `size/32` | `32` |
| `size/control/switch-knob` | `--size-control-switch-knob` | `size/26` | `26` |
| `size/control/sheet-handle-width` | `--size-control-sheet-handle-width` | `size/40` | `40` |
| `size/control/sheet-handle-height` | `--size-control-sheet-handle-height` | `size/4` | `4` |
| `size/control/spinner` | `--size-control-spinner` | `size/16` | `16` |
| `size/control/progress-height` | `--size-control-progress-height` | `size/4` | `4` |
| `size/control/status-dot` | `--size-control-status-dot` | `size/7` | `7` |
| `size/avatar/default` | `--size-avatar-default` | `size/44` | `44` |
| `size/logo/default` | `--size-logo-default` | `size/36` | `36` |
| `size/ring/default` | `--size-ring-default` | `size/88` | `88` |
| `size/empty/icon` | `--size-empty-icon` | `size/48` | `48` |
| `size/layout/topbar-height` | `--size-layout-topbar-height` | `size/76` | `76` |
| `size/container/screen` | `--size-container-screen` | `size/480` | `480` |
| `size/container/sheet` | `--size-container-sheet` | `size/520` | `520` |
| `size/container/desktop` | `--size-container-desktop` | `size/1200` | `1200` |

## Breakpoint (px) · `breakpoint`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `breakpoint/md` | `--breakpoint-md` | `breakpoint/md` | `800` |
| `breakpoint/lg` | `--breakpoint-lg` | `breakpoint/lg` | `1100` |

## Raio (px) · `radius`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `radius/control` | `--radius-control` | `radius/12` | `12` |
| `radius/tile` | `--radius-tile` | `radius/26` | `26` |
| `radius/wallet` | `--radius-wallet` | `radius/32` | `32` |
| `radius/card` | `--radius-card` | `radius/34` | `34` |
| `radius/sheet` | `--radius-sheet` | `radius/36` | `36` |
| `radius/logo` | `--radius-logo` | `radius/18` | `18` |
| `radius/pill` | `--radius-pill` | `radius/full` | `9999` |
| `radius/handle` | `--radius-handle` | `radius/4` | `4` |
| `radius/inner-sm` | `--radius-inner-sm` | `radius/14` | `14` |
| `radius/inner-md` | `--radius-inner-md` | `radius/22` | `22` |
| `radius/inner-lg` | `--radius-inner-lg` | `radius/28` | `28` |

## Contorno / stroke (px) · `stroke`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `stroke/default` | `--stroke-default` | `stroke/1` | `1` |
| `stroke/icon` | `--stroke-icon` | `stroke/1-8` | `1.8` |
| `stroke/icon-strong` | `--stroke-icon-strong` | `stroke/2` | `2` |
| `stroke/focus` | `--stroke-focus` | `stroke/2` | `2` |
| `stroke/spinner` | `--stroke-spinner` | `stroke/2` | `2` |
| `stroke/logo-mark` | `--stroke-logo-mark` | `stroke/5` | `5` |
| `stroke/ring` | `--stroke-ring` | `stroke/8` | `8` |

## Desfoque (px) · `blur`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `blur/scrim` | `--blur-scrim` | `blur/2` | `2` |
| `blur/header` | `--blur-header` | `blur/12` | `12` |
| `blur/shadow` | `--blur-shadow` | `blur/30` | `30` |

## Deslocamento de sombra (px) · `shadow-offset`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `shadow-offset/card` | `--shadow-offset-card` | `shadow-offset/y-10` | `10` |
| `shadow-offset/sheet` | `--shadow-offset-sheet` | `shadow-offset/y-neg-12` | `-12` |

## Movimento · `motion`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `motion/duration/fade` | `--motion-duration-fade` | `duration/200` | `200` |
| `motion/duration/toast` | `--motion-duration-toast` | `duration/260` | `260` |
| `motion/duration/sheet` | `--motion-duration-sheet` | `duration/320` | `320` |
| `motion/duration/pop` | `--motion-duration-pop` | `duration/380` | `380` |
| `motion/duration/progress` | `--motion-duration-progress` | `duration/700` | `700` |
| `motion/duration/reduced` | `--motion-duration-reduced` | `duration/1` | `1` |
| `motion/easing/fade` | `--motion-easing-fade` | `easing/ease-out` | `ease-out` |
| `motion/easing/emphasized` | `--motion-easing-emphasized` | `easing/spring-soft` | `cubic-bezier(0.2, 0.9, 0.25, 1)` |

## Camada (z-index) · `z-index`

| Token | Variável CSS | Alias (primitivo) | Valor |
|---|---|---|---|
| `z-index/header` | `--z-index-header` | `z-index/header` | `40` |
| `z-index/overlay` | `--z-index-overlay` | `z-index/overlay` | `50` |

---

# Tokens que não viram variável

Gradientes e sombras compostas não existem como variável no Figma; ficam como referência (as paradas de cor usam `color/gradient/*`).

| Nome | Definição |
|---|---|
| `--esk-hero` | `linear-gradient(128deg, color-gradient-hero-start 0%, color-gradient-hero-mid 45%, color-gradient-hero-end 100%)` |
| `--esk-wallet-front` | `linear-gradient(128deg, color-gradient-wallet-start 0%, color-gradient-wallet-end 70%)` |
| sombra do cartão | `0 shadow-offset-card blur-shadow rgba(0,0,0, opacity-shadow-card)` |
| sombra da folha | `0 shadow-offset-sheet blur-shadow rgba(0,0,0, opacity-shadow-sheet)` |
