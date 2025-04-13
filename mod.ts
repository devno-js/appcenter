export interface ReleaseInfo {
  id: string
  version: string
  short_version: string
}

export interface DownloadInfo {
  download_url: string
}

export interface ErrorResponse {
  code: number | string
  message: string
}

const NOT_FOUND = 404

export async function appcenter(req: Request): Promise<Response> {
  let url = new URL(req.url).pathname

  if (!url || url === '/') {
    url = '/index.html'
  }

  if (/\.[a-z]+[a-z\d]*$/.test(url)) {
    return new Response(await Deno.readFile(`./public${url}`))
  }

  const matched = /\/([\w-]+)\/([\w-]+)\/([.\w]+)/.exec(url)

  if (!matched) {
    return Response.json({
      code: NOT_FOUND,
      message: 'Not Found',
    }, {
      status: NOT_FOUND,
    })
  }

  const [, owner, app, version] = matched

  const releasesUrl =
    `https://install.appcenter.ms/api/v0.1/apps/${owner}/${app}/distribution_groups/public/public_releases`

  console.log(`Fetching ${releasesUrl}`)

  const releasesRes = await fetch(releasesUrl)

  if (!releasesRes.ok) {
    return releasesRes
  }

  const releases = await releasesRes.json() as ReleaseInfo[]

  const found = releases.find(
    (it) => it.version === version || it.short_version === version,
  )

  if (!found) {
    return Response.json(
      {
        code: NOT_FOUND,
        message: `No matched version ${version} found for ${owner}/${app}`,
      } satisfies ErrorResponse,
      {
        status: NOT_FOUND,
      },
    )
  }

  const releaseUrl =
    `https://install.appcenter.ms/api/v0.1/apps/${owner}/${app}/distribution_groups/public/releases/${found.id}`

  console.log(`Fetching ${releaseUrl}`)

  const downloadUrlRes = await fetch(
    releaseUrl,
  )

  if (!downloadUrlRes.ok) {
    return downloadUrlRes
  }

  const { download_url: downloadUrl } = await downloadUrlRes
    .json() as DownloadInfo

  console.log(`Redirect to ${downloadUrl}`)

  return Response.redirect(downloadUrl)
}
