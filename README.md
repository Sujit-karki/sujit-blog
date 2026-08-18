# sujit-blogs

This repo is a thin wrapper around the actual project, which lives in the
`my-blog` **git submodule** (a separate repo: [Sujit-karki/sujit-blog](https://github.com/Sujit-karki/sujit-blog)).
Everything you'll actually edit — the Next.js blog — is inside `my-blog/`.

## Getting set up in VS Code

1. **Clone with submodules** (a plain `git clone` leaves `my-blog/` empty):

   ```sh
   git clone --recurse-submodules https://github.com/Sujit-karki/sujit-blogs.git
   ```

   If you already cloned without that flag:

   ```sh
   git submodule update --init --recursive
   ```

2. **Open `my-blog/` as the VS Code workspace folder** (not the repo root) — that's
   where `package.json`, `.vscode/`, and everything else live.

3. **Install dependencies and env vars**:

   ```sh
   cd my-blog
   npm install
   cp .env.example .env.local   # then fill in any values you need
   ```

4. **Run it**:

   ```sh
   npm run dev
   ```

VS Code will prompt to install the recommended extensions (ESLint, Tailwind CSS
IntelliSense, MDX, Playwright) the first time you open `my-blog/` — accept that
prompt, it's the same tooling the project already lints/type-checks with.

## Node version

`my-blog/.nvmrc` pins Node 24 (matches `package.json`'s dependency on Next.js 16 /
React 19). If you use `nvm`, run `nvm use` inside `my-blog/`.

## Notes

- `main.py`, `.venv/`, and `.idea/` at the repo root are leftover PyCharm project
  scaffolding — unrelated to the blog, gitignored (except `main.py`), safe to ignore.
- The two repos (`sujit-blogs` and `my-blog`) each have their own git history and
  their own `.gitignore`/`.gitattributes`. Commit blog changes from inside
  `my-blog/`, then commit the resulting submodule pointer bump from the root.
