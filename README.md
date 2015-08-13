# `pkgrun`

Run multiple `package.json` scripts with one command. `pkgrun` allows you to select scripts to run in `package.json` with a `glob` pattern. Basically `npm run` with glob support!

Turn this:

```bash
npm run soup-clam && npm run soup-cream && npm run soup-mushroom
```

Into this:

```bash
pkgrun 'soup-*'
```

Normally you want to have each command in it's own line, tucked away with it's own property, and you want to use `&&` to concat multiple operations together. This can get really messy really fast.

```json
{
  "soup": "npm run soup-clam && soup-cream && soup-mushroom",
  "soup-clam": "echo 'clam soup'",
  "soup-cream": "echo 'cream soup'",
  "soup-mushroom": "echo 'cream mushroom'"
}
```

Now you can just write:

```json
{
  "soup": "pkgrun 'soup*'",
  "soup-clam": "echo 'clam soup'",
  "soup-cream": "echo 'cream soup'",
  "soup-mushroom": "echo 'cream mushroom'"
}
```

The command `pkgrun 'soup*'` will go into your `package.json` file and pull all of the files starting with `soup` (in the order they are in) and execute them one by one.

## Glob Reminder

Most shells use glob patterns to select files and send the matched files to a command. If you have a file `soup-file.js` in your working directory then `pkgrun soup*` (note that the argument is not in quotes) will return `No package script match found: soup-file.js`. If theres a glob pattern in the argument should encapsulated in quotes.
