<h1 align="center">Valo-Kit</h1>

![GitHub Workflow Status][build-status-shield]
[![Downloads][downloads-shield]][downloads-url]
[![Language][language-shield]][language-url]
[![License][license-shield]][license-url]

[build-status-shield]: https://img.shields.io/github/actions/workflow/status/tanishqmanuja/valo-kit/workspace.yaml?branch=main&style=for-the-badge

[downloads-shield]: https://img.shields.io/github/downloads/tanishqmanuja/valo-kit/total?style=for-the-badge&logo=github
[downloads-url]: https://github.com/tanishqmanuja/valo-kit/releases/latest

[language-shield]: https://img.shields.io/github/languages/top/tanishqmanuja/valo-kit?style=for-the-badge
[language-url]: https://www.typescriptlang.org/

[license-shield]: https://img.shields.io/github/license/tanishqmanuja/valo-kit?style=for-the-badge
[license-url]: https://github.com/tanishqmanuja/valo-kit/blob/main/LICENSE.md

A monorepo build using pnpm and turborepo, which encapsulates multiple interdependent projects for valorant.

## Contents
1. [vRYjs](#vryjs)
2. [Api Client](#api-client)
3. [Acknowledgements](#infinite-thanks-%EF%B8%8F)
4. [Disclaimer](#disclaimer)

## vRYjs

This is port/rewrite of the OG project [VALORANT Rank Yoinker](https://github.com/zayKenyon/VALORANT-rank-yoinker) which is originally written in python.

### Preview
![vRYjs Table](https://raw.github.com/tanishqmanuja/valo-kit/main/assets/vRYjsTable.png?maxAge=2592000)

### Usage for Noobs (Basic)
1. Download vRYjs.exe from [releases](https://github.com/tanishqmanuja/valo-kit/releases/)
2. Put in a separate folder because software generates temporary helper folder and files.
3. Run and Enjoy!

### Usage for Techies (Intermediate)
1. All steps from `Usage for Noobs`
2. Download file `plugins.yaml` from [here](https://github.com/tanishqmanuja/valo-kit/blob/main/vry-js/plugins.yaml)
3. Place `plugins.yaml` in the same folder as vRYjs.exe
4. Use your creativity to customize the file using the guide below.
```yaml
# Disable a plugin
# Example: sort-by-level: false

plugin-name: false

# Enable a plugin
# Example: team-spacer: true
plugin-name: true

# Enable a plugin with flags
# Example: player-weapons: [Odin]

# if plugin supports single flag
plugin-name: [flag]
# if plugin supports multiple flags
plugin-name: [flag1, flag2, flag3]
```

### Usage for Gods (Advance)
Prerequisites
- node >=18.12

Running from source
1. Clone the repo

```shell
git clone https://github.com/tanishqmanuja/valo-kit.git
```

2. Cd to the cloned repo folder

```shell
cd valo-kit
```

3. Enable pnpm if not yet enabled

```shell
corepack enable
corepack prepare pnpm@latest --activate
```

4. Install Dependencies

```shell
pnpm i
```

5. Start vRYjs

```shell
pnpm start:vry-js
```

6. Package vRYjs (optional)

Do this if you want to make your own executable file

```shell
pnpm package
```
> The file will be located at __./vry-js/bin/vRYjs-{version}.exe__

### Notes
1. AntiVirus Programs\
Some antivirus vendors mark .exe file generated using `@vercel/pkg` as trojan. This is a false positive.
Still if you dont trust the executable provided in release, you can build your own or run from the source.

Reference Issues:
- https://github.com/vercel/pkg/issues/1540

## Api Client

A helper library built to provide authentication and http requests support for remote/local valorant api.

## Show your support

Give a ⭐️ if this project helped you!

## Infinite Thanks ❤️‍🔥

- [VALORANT-rank-yoinker](https://github.com/zayKenyon/VALORANT-rank-yoinker)
- [valorant-api-docs](https://github.com/techchrism/valorant-api-docs)

## Disclaimer

THIS PROJECT IS NOT ASSOCIATED OR ENDORSED BY RIOT GAMES. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
Whilst effort has been made to abide by Riot's API rules; you acknowledge that use of this software is done so at your own risk.
