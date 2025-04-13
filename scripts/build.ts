/**
 * @link https://github.com/sindresorhus/github-markdown-css
 */

const text = await Deno.readTextFile('README.md')

const content = await fetch('https://api.github.com/markdown', {
  method: 'POST',
  body: JSON.stringify({ text }),
  headers: {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${Deno.env.get('GITHUB_TOKEN')}`,
  },
}).then((res) => res.text())

await Deno.writeTextFile(
  'public/index.html',
  /* HTML */ `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App Center</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css"
    />
    <style>
      @media (prefers-color-scheme: dark) {
        :root {
          background-color: #0d1117;
        }
      }

      body {
        margin: 0;
      }

      .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
      }

      @media (max-width: 767px) {
        .markdown-body {
          padding: 15px;
        }
      }
    </style>
  </head>
  <body>
    <article class="markdown-body">${content}</article>
  </body>
</html>
`.trim(),
)
